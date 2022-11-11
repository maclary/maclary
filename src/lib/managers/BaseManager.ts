import { Collection } from 'discord.js';
import { Base } from '#/structures/Base';

/**
 * Base manager class for all Maclary managers.
 * @since 1.0.0
 */
export abstract class BaseManager extends Base {}

/**
 * Base manager class for all managers that require a value only cache.
 * @typeparam V What the manager caches.
 * @since 1.0.0
 */
export abstract class SetManager<V> extends BaseManager {
    /**
     * The cache of items for this manager.
     * @since 1.0.0
     */
    public cache = new Set<V>();
}

/**
 * Base manager class for all managers that require a key and value pair cache.
 * @typeparam K What each key type is.
 * @typeparam V What the manager caches.
 * @since 1.0.0
 */
export abstract class MapManager<K, V> extends BaseManager {
    /**
     * The cache of items for this manager.
     * @since 1.0.0
     */
    public cache = new Collection<K, V>();
}
