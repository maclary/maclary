import { type Container, container } from '../container';

/**
 * Base class that all Maclary classes extend.
 */
export abstract class Base {
    /**
     * A reference to the container.
     */
    protected get container(): Container {
        return container;
    }
}
