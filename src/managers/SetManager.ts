import { BaseManager } from './BaseManager';

/**
 * Base manager class for all managers that require a value only cache.
 * @extends {BaseManager}
 */
export class SetManager<V> extends BaseManager {
    /**
     * The cache of items for this manager.
     */
    public cache = new Set<V>();
}
