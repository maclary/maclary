import { type Container, container } from '../container';
import { Error } from '../errors';
import { CommandManager } from '../managers/CommandManager';
import { EventManager } from '../managers/EventManager';
import {
    PluginManager,
    broadcastPreparing,
    broadcastReady,
    broadcastDestroy,
} from '../managers/PluginManager';
import { getRootData } from '../internal/RootScanner';
import { Prefix as PrefixRegex } from '../utils/Regexes';

import { Client, type ClientOptions } from 'discord.js';
import { z } from 'zod';

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
     * The clients {@link PluginManager}.
     */
    public readonly plugins: PluginManager;

    /**
     * The base directory, used to find default {@link CommandManager} and{@link EventManager} directories.
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
        this.plugins = new PluginManager();

        const logger = options.logger || console;
        container.logger = logger;
    }

    /**
     * Connect the client to the Discord API.
     * @param [token] {string} Discord bot token
     * @returns {Promise<string>} The token used to login
     */
    public override async login(token?: string): Promise<string> {
        if (!token || typeof token !== 'string') {
            throw new Error('INVALID_TOKEN');
        }

        this.validateOptions();
        await this.preparing();
        await super.login(token);
        await this.ready();

        return token;
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
        return this.login();
    }

    private async preparing(): Promise<void> {
        for (const promise of [
            () => this.events.load().then((e) => e.patch()),
            () => this.commands.load(),
            () => this.plugins[broadcastPreparing](),
        ])
            await promise();
    }

    private async ready(): Promise<void> {
        for (const promise of [() => this.plugins[broadcastReady](), () => this.commands.patch()])
            await promise();
    }

    private validateOptions(): void {
        const prefixes = z.union([
            z.string().regex(PrefixRegex),
            z.array(z.string().regex(PrefixRegex)),
        ]);
        prefixes.parse(this.options.defaultPrefix);
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
