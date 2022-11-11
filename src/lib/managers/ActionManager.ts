import { join } from 'node:path';
import { SetManager } from './BaseManager';
import { isDirectory, isFile } from '#/internal/FileResolver';
import { flattenTree } from '#/internal/ItemFormatters';
import { getModuleData, loadModule } from '#/internal/ModuleLoader';
import { Action } from '#/structures/Action';

/**
 * The {@link Action} manager.
 * You should never need to create an instance of this.
 * @since 1.0.0
 */
export class ActionManager extends SetManager<Action> {
    /**
     * The paths to load actions from.
     * @since 1.0.0
     */
    public paths = new Set<string>();

    public constructor() {
        super();

        const internalPath = join(__dirname, '../..', 'actions');
        if (isDirectory(internalPath)) this.paths.add(internalPath);

        const rootPath = join(this.baseDirectory, 'actions');
        if (isDirectory(rootPath)) this.paths.add(rootPath);
    }

    /**
     * Load all actions from the paths and store them in the cache.
     * @since 1.0.0
     */
    public async load() {
        this.cache.clear();
        this.container.logger.info('Loading actions...');
        for (const path of this.paths) await this._loadItem(path);
        this.container.logger.info(`Loaded ${this.cache.size} actions`);
        return this;
    }

    /**
     * Patch the actions, right now, this does nothing.
     * @internal
     * @since 1.0.0
     */
    public async patch() {
        return this;
    }

    /**
     * Resolve a action ID to a command instance.
     * @param actionId The ID of the action to resolve.
     * @param [actions] An optional array of actions to search through.
     * @since 1.0.0
     */
    public resolve(actionId: string, actions = Array.from(this.cache)) {
        return actions.find(a => a.id === actionId);
    }

    private async _loadItem(itemPath: string) {
        if (!isDirectory(itemPath) && !isFile(itemPath)) return;

        const data = getModuleData(itemPath, true);
        const contents = data && (await loadModule(data));
        if (!contents) return;

        const object = flattenTree(contents);
        const actions = Object.values(object).filter(this._extendsAction);
        this._registerActions([contents, ...actions]);
    }

    private _registerActions(actions: typeof Action[]) {
        for (const action of actions) {
            if (this._isAction(action)) this.cache.add(action);
            if (this._extendsAction(action)) {
                // @ts-expect-error Access abstract class
                const instance = new action(this.container);
                this.cache.add(instance);
            }
        }
    }

    private _isAction(value: unknown): value is Action {
        return value instanceof Action;
    }

    private _extendsAction(value: unknown): value is typeof Action {
        return typeof value === 'function' && value.prototype instanceof Action;
    }
}
