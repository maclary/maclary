import { Base } from './Base';

/**
 * The plugin class, all plugins must extend this class and implement the abstract methods.
 */
export abstract class Plugin extends Base {
    /**
     * Run when the client is preparing to login.
     */
    public onPreparing(): unknown | Promise<unknown> {
        return null;
    }

    /**
     * Run once the client has logged in.
     */
    public onReady(): unknown | Promise<unknown> {
        return null;
    }

    /**
     * Run when right before the client is destoryed.
     */
    public onDestroy(): unknown | Promise<unknown> {
        return null;
    }
}
