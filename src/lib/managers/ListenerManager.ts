import { join } from 'node:path';
import { SetManager } from './BaseManager';
import { isDirectory, isFile } from '#/internal/FileResolver';
import { flattenTree } from '#/internal/ItemFormatters';
import { getModuleData, loadModule } from '#/internal/ModuleLoader';
import { Listener } from '#/structures/Listener';

/**
 * The {@link Listener} manager.
 * You should never need to create an instance of this.
 * @since 1.0.0
 */
export class ListenerManager extends SetManager<Listener<any>> {
    /**
     * The paths to load listeners from.
     * @since 1.0.0
     */
    public paths = new Set<string>();

    public constructor() {
        super();

        const internalPath = join(__dirname, '../..', 'listeners');
        if (isDirectory(internalPath)) this.paths.add(internalPath);

        const rootPath = join(this.baseDirectory, 'listeners');
        if (isDirectory(rootPath)) this.paths.add(rootPath);
    }

    /**
     * Load all listeners from the paths and store them in the cache.
     * @since 1.0.0
     */
    public async load() {
        this.cache.clear();
        this.container.logger.info('Loading listeners...');
        for (const path of this.paths) await this._loadItem(path);
        this.container.logger.info(`Loaded ${this.cache.size} listeners`);
        return this;
    }

    /**
     * Attach the listeners to the event emitters.
     * @since 1.0.0
     */
    public async patch() {
        await this.unpatch();

        for (const listener of this.cache) {
            const method = listener.once ? 'once' : 'on';
            const handler = listener._handleRun.bind(listener);
            listener.emitter[method](listener.event, handler);
        }

        return this;
    }

    /**
     * Remove all listeners from their event emitters.
     * @since 1.0.0
     */
    public async unpatch() {
        for (const listener of this.cache) {
            const handler = listener._handleRun.bind(listener);
            listener.emitter.off(listener.event, handler);
        }

        return this;
    }

    private async _loadItem(itemPath: string) {
        if (!isDirectory(itemPath) && !isFile(itemPath)) return;

        const data = getModuleData(itemPath, true);
        const contents = data && (await loadModule(data));
        if (!contents) return;

        const object = flattenTree(contents, '/');
        const listeners = Object.values(object).filter(this._extendsListener);

        this._registerListeners([contents, ...listeners]);
    }

    private _registerListeners(listeners: typeof Listener[]) {
        for (const listener of listeners) {
            if (this._isListener(listener)) this.cache.add(listener);
            else if (this._extendsListener(listener)) {
                // @ts-expect-error 2511 Access abstract class
                const instance = new listener(this.container);
                this.cache.add(instance);
            }
        }
    }

    private _isListener(value: unknown): value is Listener<any> {
        return value instanceof Listener;
    }

    private _extendsListener(value: unknown): value is typeof Listener {
        return typeof value === 'function' && value.prototype instanceof Listener;
    }
}
