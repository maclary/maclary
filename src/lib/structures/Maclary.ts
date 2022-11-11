import { type InferType, s } from '@sapphire/shapeshift';
import type { Client, Snowflake as DiscordSnowflake, Message } from 'discord.js';
import { Base } from './Base';
import { container } from '#/container';
import { ActionManager } from '#/managers/ActionManager';
import { CommandManager } from '#/managers/CommandManager';
import { ListenerManager } from '#/managers/ListenerManager';
import { PluginManager } from '#/managers/PluginManager';
import type { Awaitable } from '#/types';
import * as Regexes from '#/utilities/Regexes';

/**
 * The main Maclary class.
 * @example
 * ```typescript
 * import { Client } from 'discord.js';
 * import { Maclary } from 'maclary';
 *
 * const client = new Client({ ...clientOptions });
 * const maclary = new Maclary({ ...maclaryOptions });
 * Maclary.init(maclary, client);
 * ```
 * @since 1.0.0
 */
export class Maclary extends Base {
    public readonly options!: InferType<typeof Maclary.prototype['_schema']> & Maclary.Options;

    /**
     * Maclarys {@link ActionManager}, which manages all {@link Action}s.
     * @since 1.0.0
     */
    public actions = new ActionManager();

    /**
     * Maclarys {@link CommandManager}, which manages all {@link Command}s.
     * @since 1.0.0
     */
    public commands = new CommandManager();

    /**
     * Maclarys {@link ListenerManager}, which manages all {@link Listener}s.
     * @since 1.0.0
     */
    public listeners = new ListenerManager();

    /**
     * Maclarys {@link PluginManager}, which manages all {@link Plugin}s.
     * @since 1.0.0
     */
    public plugins = new PluginManager();

    /**
     * @param options Options for this Maclary instance.
     * @since 1.0.0
     */
    public constructor(options: Maclary.Options) {
        super();

        const results = this._schema.parse(options);
        Reflect.set(this, 'options', results);
    }

    private get _schema() {
        return s.object({
            guildId: s.union(
                s.string.regex(Regexes.Snowflake),
                s.string.regex(Regexes.Snowflake).array
            ).optional,
            defaultPrefix: s.union(
                s.string.regex(Regexes.Prefix),
                s.string.regex(Regexes.Prefix).array
            ).optional,
            regexPrefix: s.instance(RegExp).optional,
            fetchPrefix: s.instance(Function).default(() => () => this.options.defaultPrefix),
            caseInsensitivePrefixes: s.boolean.default(false),
            disableMentionPrefix: s.boolean.default(false),
            caseInsensitiveCommands: s.boolean.default(false),
        });
    }

    /** @internal */ public async preparing() {
        for (const promise of [
            async () => this.listeners.load().then(async lis => lis.patch()),
            async () => this.actions.load().then(async act => act.patch()),
            async () => this.commands.load(),
            async () => this.plugins.broadcastPreparing(),
        ])
            await promise();
    }

    /** @internal */ public async ready() {
        for (const promise of [
            async () => this.container.client.application.fetch(),
            async () => this.commands.patch(),
            async () => this.plugins.broadcastReady(),
        ])
            await promise();
    }

    /** @internal */ public async destroy() {
        for (const promise of [async () => this.plugins.broadcastDestory()]) await promise();
    }
}

export namespace Maclary {
    export interface Options {
        /**
         * Whether prefix commands names should be case insensitive.
         * @default false
         * @since 1.0.0
         */
        caseInsensitiveCommands?: boolean;

        /**
         * Whether the prefix command prefixes should be case insensitive.
         * @default false
         * @since 1.0.0
         */
        caseInsensitivePrefixes?: boolean;

        /**
         * The default prefix for prefix commands.
         * @default []
         * @since 1.0.0
         */
        defaultPrefix?: string[] | string;

        /**
         * Whether or not to disable the bots mention as a prefix command prefix.
         * @default false
         * @since 1.0.0
         */
        disableMentionPrefix?: boolean;

        /**
         * A function that can use to have dynamic prefixes. Supports Promises.
         * @default () => defaultPrefix
         * @example
         * ```typescript
         * fetchPrefix: (message: Message) => db.prefixes.get(message.guild.id)
         * ```
         * @since 1.0.0
         */
        fetchPrefix?(message: Message): Awaitable<string[] | string | null>;

        /**
         * By default, Maclary will register commands globally,
         * use this to only register to one or more guilds.
         * @since 1.0.0
         */
        guildId?: DiscordSnowflake | DiscordSnowflake[];

        /**
         * The message command regex prefix, an alternative to default string prefixes.
         * @default []
         * @since 1.0.0
         */
        regexPrefix?: RegExp;
    }

    /**
     * Inject Maclary methods into the `Client#login` and `Client#destroy` methods.
     * @param maclary Maclary instance.
     * @param client Discord Client instance.
     * @since 1.0.0
     */
    export function init(maclary: Maclary, client: Client) {
        container.maclary = maclary;
        container.client = client;

        const normalLogin = client.login.bind(client);
        Reflect.set(client, 'login', async (...args: any[]) => {
            await maclary.preparing();
            client.on('ready', async () => maclary.ready());
            return normalLogin(...args);
        });

        const normalDestroy = client.destroy.bind(client);
        Reflect.set(client, 'destroy', async () => {
            await maclary.destroy();
            normalDestroy();
        });
    }
}
