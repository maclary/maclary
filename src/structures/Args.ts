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
        return joinTokens(this.many());
    }
}
