import { MapManager } from './BaseManager';
import { Plugin } from '#/structures/Plugin';

/**
 * The {@link Plugin} manager.
 * You should never need to create an instance of this.
 * @since 1.0.0
 */
export class PluginManager extends MapManager<string, Plugin> {
    /**
     * Tell the client to use a plugin.
     * @param plugin The plugin to use.
     * @param args The arguments to pass to the plugins constructor.
     * @since 1.0.0
     */
    public use<T extends typeof Plugin>(plugin: T, ...args: ConstructorParameters<T>) {
        if (typeof plugin === 'function' && plugin.prototype instanceof Plugin) {
            // @ts-expect-error 2511 Access abstract class
            const plug = new plugin(...args);
            this.cache.set(plug.name, plug);
        }
    }

    /**
     * Get a plugin from the cache by its name.
     * @typeparam T The type of the plugin.
     * @param name The name of the plugin.
     * @since 1.0.0
     */
    public get<T extends Plugin>(name: string): T | undefined {
        return this.cache.get(name) as T | undefined;
    }

    /** @internal */ public async broadcastPreparing() {
        for (const plugin of this.cache.values())
            if (typeof plugin.onPreparing === 'function') await plugin.onPreparing();
    }

    /** @internal */ public async broadcastReady() {
        for (const plugin of this.cache.values()) //
            if (typeof plugin.onReady === 'function') await plugin.onReady();
    }

    /** @internal */ public async broadcastDestory() {
        for (const plugin of this.cache.values())
            if (typeof plugin.onDestory === 'function') await plugin.onDestory();
    }
}
