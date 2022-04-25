import { BaseManager } from './BaseManager';
import { Collection } from 'discord.js';

/**
 * Base manager class for all managers that require a key-value cache.
 * @extends {BaseManager}
 */
export class MapManager<K, V> extends BaseManager {
    /**
     * The cache of items for this manager.
     */
    public cache = new Collection<K, V>();
}
