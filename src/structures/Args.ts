import { Args as LArgs, joinTokens } from 'lexure';

/**
 * A class that represents a set of arguments.
 * @extends {Lexure.Args}
 */
export class Args extends LArgs {
    /**
     * Get the remaining arguments as a string.
     */
    public rest(): string {
        // Lexure does not have a `rest` method, so we have to do this ourselves
        return joinTokens(this.many());
    }
}
