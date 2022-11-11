import { Args as LexureArgs, joinTokens } from 'lexure';

/**
 * A class that represents a set of arguments.
 * @since 1.0.0
 */
export class Arguments extends LexureArgs {
    /**
     * get the remaining arguments.
     * @since 1.0.0
     */
    public rest() {
        // Lexure does not have a rest method, so we have to do it ourselves
        return joinTokens(this.many());
    }
}
