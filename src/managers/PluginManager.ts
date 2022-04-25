import { SetManager } from './SetManager';
import { Plugin } from '../structures/Plugin';
import { Error } from '../errors';

export const broadcastPreparing = Symbol('broadcastPreparing');
export const broadcastReady = Symbol('broadcastReady');
export const broadcastDestroy = Symbol('broadcastDestroy');

/**
 * The {@link Plugin} manager. You should never have to create an instance of this class.
 */
export class PluginManager extends SetManager<Plugin> {
    /**
     * Tell the client to use a plugin.
     * @param plugin The plugin to load.
     * @param args The arguments to pass to the plugin constructor.
     */
    public use(plugin: typeof Plugin, ...args: any[]): void {
        if (plugin.prototype instanceof Plugin) {
            // @ts-ignore Fix abstract class
            this.cache.add(new plugin(...(args as [])));
        } else {
            throw new Error('INVALID_PLUGIN');
        }
    }

    /**
     * @ignore
     */
    public async [broadcastPreparing](): Promise<void> {
        for (const plugin of this.cache.values()) {
            await plugin.onPreparing();
        }
    }

    /**
     * @ignore
     */
    public async [broadcastReady](): Promise<void> {
        for (const plugin of this.cache.values()) {
            await plugin.onReady();
        }
    }

    /**
     * @ignore
     */
    public async [broadcastDestroy](): Promise<void> {
        for (const plugin of this.cache.values()) {
            await plugin.onDestroy();
        }
    }
}
