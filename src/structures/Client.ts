import { type Container, container } from '../container';
import { Error } from '../errors';
import { CommandManager } from '../managers/CommandManager';
import { ComponentManager } from '../managers/ComponentManager';
import { EventManager } from '../managers/EventManager';
import {
    PluginManager,
    broadcastPreparing,
    broadcastReady,
    broadcastDestroy,
} from '../managers/PluginManager';
import { getRootData } from '../internal/RootScanner';
import { Prefix as PrefixRegex, Snowflake as SnowflakeRegex } from '../utils/Regexes';

import { Client, type Snowflake, type ClientOptions } from 'discord.js';
import Joi from 'joi';

export interface MaclaryClientOptions {
    /**
     * The default prefix for message commands.
     */
    defaultPrefix: string | string[];

    /**
     * Where the client logs to, defaults to the console.
     * @default typeof console
     */
    logger?: any;

    /**
     * The ID of the development guild, where interaction commands will be
     * loaded when in development.
     */
    developmentGuildId: Snowflake;

    /**
     * The prefix to use when in development.
     */
    developmentPrefix: string | string[];
}

export class MaclaryClient extends Client {
    /**
     * The clients {@link EventManager}.
     */
    public readonly events: EventManager;

    /**
     * The clients {@link CommandManager}.
     */
    public readonly commands: CommandManager;

    /**
     * The clients {@link ComponentManager}.
     */
    public readonly components: ComponentManager;

    /**
     * The clients {@link PluginManager}.
     */
    public readonly plugins: PluginManager;

    /**
     * The base directory, used to find default {@link CommandManager} and {@link EventManager} directories.
     */
    public get baseDirectory(): string {
        return getRootData().root;
    }

    /**
     * A reference to the container.
     */
    public get container(): Container {
        return container;
    }

    public constructor(options: ClientOptions) {
        super(options);

        this.validateOptions();

        container.client = this;

        this.events = new EventManager();
        this.commands = new CommandManager();
        this.components = new ComponentManager();
        this.plugins = new PluginManager();

        const logger = options.logger || console;
        container.logger = logger;
    }

    /**
     * Connect the client to the Discord API.
     * @param token {string} Discord bot token
     * @returns {Promise<string>} The token used to login
     */
    public override async login(token: string): Promise<string> {
        if (!token || typeof token !== 'string') {
            throw new Error('INVALID_TOKEN');
        }

        this.validateOptions();

        await this.preparing();
        await super.login(token);
        await this.ready();

        return (process.env.__DISCORD_TOKEN__ = token);
    }

    /**
     * Destroy the client.
     */
    public override async destroy(): Promise<void> {
        await this.plugins[broadcastDestroy]();
        super.destroy();
    }

    /**
     * Disconnect then connect the client.
     * @returns {Promise<string>} The token used to login
     */
    public async reload(): Promise<string> {
        await this.destroy();
        return this.login(process.env.__DISCORD_TOKEN__ as string);
    }

    /**
     * Run all plugins on preparing method.
     */
    private async preparing(): Promise<void> {
        for (const promise of [
            () => this.events.load().then((e) => e.patch()),
            () => this.commands.load(),
            () => this.components.load(),
            () => this.plugins[broadcastPreparing](),
        ])
            await promise();
    }

    /**
     * Run all plugins on ready method.
     */
    private async ready(): Promise<void> {
        if (process.env.MACLARY_ENV === 'development') {
            // If in development mode, set the commands
            // application to the development guild
            if (this.shard === null) {
                this.options.defaultPrefix = this.options.developmentPrefix;
                this.commands.application = await this.guilds.fetch(
                    this.options.developmentGuildId,
                );
            } else throw new Error('DEVELOPMENT_ON_SHARD');
        }

        for (const promise of [
            () => this.application?.fetch(),
            () => this.plugins[broadcastReady](),
            () => this.commands.patch(),
        ])
            await promise();
    }

    private validateOptions(): void {
        const schema = Joi.object({
            logger: Joi.any().optional(),
            defaultPrefix: Joi.string().regex(PrefixRegex).required(),
            developmentPrefix: Joi.string().regex(PrefixRegex).required(),
            developmentGuildId: Joi.string().regex(SnowflakeRegex).required(),
        }).unknown();

        const { error } = schema.validate(this.options);
        if (error) throw error;
    }
}

declare module 'discord.js' {
    interface ClientOptions extends MaclaryClientOptions {}
}

declare module '../container' {
    interface Container {
        client: MaclaryClient;
        logger: any;
    }
}
