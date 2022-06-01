import { ReplyError } from '../errors/ReplyError';
import { Base } from './Base';
import type { Command } from './Command';

export interface Result {
    success: boolean;
    value?: any;
    error?: ReplyError;
    context?: any;
}

export abstract class Precondition extends Base {
    public messageRun?(message: Command.Message, command: Command): Result | Promise<Result>;

    public chatInputRun?(message: Command.ChatInput, command: Command): Result | Promise<Result>;

    public contextMenuRun?(
        message: Command.UserContextMenu | Command.MessageContextMenu,
        command: Command,
    ): Result | Promise<Result>;

    public ok(value?: any): Result {
        return { success: true, value };
    }

    public error(message: string, context?: any): Result {
        return { success: false, error: new ReplyError(message), context };
    }
}

export class PreconditionsContainer extends Base {
    private entries: Precondition[] = [];

    /**
     * Add a precondition to the container.
     * @param Class Precondition class
     */
    public add(Class: typeof Precondition) {
        if (Class.prototype instanceof Precondition) {
            // @ts-ignore Fix abstract class
            const precondition = new Class();
            this.entries.push(precondition);
        }
    }

    /**
     * Run the preconditions for a message.
     * @param message Message object
     * @param command Command object
     */
    public async messageRun(message: Command.Message, command: Command): Promise<Result> {
        for (const entrie of this.entries) {
            if (entrie.messageRun) {
                const result = await entrie.messageRun(message, command);
                if (!result.success) return result;
            }
        }

        return Precondition.prototype.ok();
    }

    /**
     * Run the preconditions for a chat input.
     * @param interaction Interaction object
     * @param command Command object
     */
    public async chatInputRun(interaction: Command.ChatInput, command: Command): Promise<Result> {
        for (const entrie of this.entries) {
            if (entrie.chatInputRun) {
                const result = await entrie.chatInputRun(interaction, command);
                if (!result.success) return result;
            }
        }

        return Precondition.prototype.ok();
    }

    /**
     * Run the preconditions for a context menu.
     * @param interaction Interaction object
     * @param command Command object
     */
    public async contextMenuRun(
        interaction: Command.ContextMenu,
        command: Command,
    ): Promise<Result> {
        for (const entrie of this.entries) {
            if (entrie.contextMenuRun) {
                const result = await entrie.contextMenuRun(interaction, command);
                if (!result.success) return result;
            }
        }

        return Precondition.prototype.ok();
    }
}
