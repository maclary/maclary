import { container } from '#/container';
import { getRootData } from '#/internal/RootScanner';

/**
 * Base class for all Maclary classes extend from.
 * @since 1.0.0
 */
export abstract class Base {
    /**
     * A reference to the container.
     * @since 1.0.0
     */
    public get container() {
        return container;
    }

    /**
     * The base directory, used to find default directories.
     * @since 1.0.0
     */
    public get baseDirectory() {
        return getRootData().root;
    }
}
