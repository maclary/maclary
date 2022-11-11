import type { PermissionsBitField } from 'discord.js';
import type { Action } from '#/structures/Action';
import { Base } from '#/structures/Base';
import type { Command } from '#/structures/Command';
import type { Awaitable } from '#/types';

/**
 * Precondition class for commands and actions.
 * @since 1.0.0
 */
export abstract class Precondition extends Base {
    public ok() {
        return Precondition.Result.ok();
    }

    public error<T extends keyof Precondition.Identifiers>(
        identifier: T,
        ...parameters: Precondition.Identifiers[T]
    ) {
        return Precondition.Result.error(identifier, ...parameters);
    }

    /**
     * Run this precondition for a prefix command.
     * @param message The message that triggered the command.
     * @param command The command that was triggered.
     * @since 1.0.0
     */
    public abstract prefixRun(
        message: Command.Message,
        command: Command<Command.Type.ChatInput, any>
    ): Awaitable<Precondition.Result>;

    /**
     * Run this precondition for a slash command.
     * @param input The interaction that triggered the command.
     * @param command The command that was triggered.
     * @since 1.0.0
     */
    public abstract slashRun(
        input: Command.ChatInput,
        command: Command<Command.Type.ChatInput, any>
    ): Awaitable<Precondition.Result>;

    /**
     * Run this precondition for a message or user context menu.
     * @param menu The interaction that triggered the action.
     * @param command The command that was triggered.
     * @since 1.0.0
     */
    public abstract contextMenuRun(
        menu: Command.ContextMenu,
        command: Command<Command.Type.ChatInput, any>
    ): Awaitable<Precondition.Result>;

    /**
     * Run this precondition for any action.
     * @param interaction The interaction that triggered the action.
     * @param action The action that was triggered.
     * @since 1.0.0
     */
    public abstract actionRun(
        interaction: Action.AnyInteraction,
        action: Action
    ): Awaitable<Precondition.Result>;
}

export namespace Precondition {
    /**
     * An interface of precondition error identifiers.
     * @since 1.0.0
     */
    export interface Identifiers {
        BotOwnerOnly: [];
        ClientPermissions: [PermissionsBitField];
        CouldNotDetermineClientPermissions: [];
        CouldNotDetermineUserPermissions: [];
        DMOnly: [];
        GuildOnly: [];
        GuildOwnerOnly: [];
        NSFWOnly: [];
        UserPermissions: [PermissionsBitField];
    }

    /**
     * Represents a successful precondition result.
     * @since 1.0.0
     */
    export interface Ok {
        success: true;
    }

    /**
     * Represents a failed precondition result.
     * @typeparam T The error identifier.
     * @since 1.0.0
     */
    export interface Error<I extends keyof Identifiers = keyof Identifiers> {
        identifier: I;
        parameters: Identifiers[I];
        success: false;
    }

    /**
     * Represents a precondition result.
     * @since 1.0.0
     */
    export type Result = Error | Ok;

    export namespace Result {
        /**
         * Creates a successful precondition result.
         * @since 1.0.0
         */
        export function ok(): Ok {
            return { success: true };
        }

        /**
         * Creates a failed precondition result.
         * @param identifier The error identifier.
         * @param parameters The error parameters.
         * @since 1.0.0
         */
        export function error<I extends keyof Identifiers = keyof Identifiers>(
            identifier: I,
            ...parameters: Identifiers[I]
        ): Error<I> {
            return { success: false, identifier, parameters };
        }

        /**
         * Checks if a value is a valid precondition result.
         * @param value The value to check.
         * @since 1.0.0
         */
        export function is(value: unknown): value is Result {
            return typeof value === 'object' && value !== null && 'success' in value;
        }

        /**
         * Checks if a value is a successful precondition result.
         * @param value The value to check.
         * @since 1.0.0
         */
        export function isOk(value: unknown): value is Ok {
            return is(value) && value.success;
        }

        /**
         * Checks if a value is a failed precondition result.
         * @param value The value to check.
         * @since 1.0.0
         */
        export function isError(value: unknown) {
            return is(value) && !value.success;
        }
    }

    /**
     * The container for preconditions.
     * @typeparam P Whether this container is for commands or actions.
     * @since 1.0.0
     */
    export class Container<
        P extends Action | Command<any, any> = Action | Command<any, any>
    > extends Base {
        private readonly _entries: Precondition[] = [];

        private readonly _parent: P;

        /**
         * @param parent The parent of this container.
         * @since 1.0.0
         */
        public constructor(parent: P) {
            super();
            this._parent = parent;
        }

        /**
         * Add a precondition to this container.
         * @param preconditions The preconditions to add.
         * @since 1.0.0
         */
        public add(...preconditions: typeof Precondition[]) {
            for (const Precondition of preconditions) {
                if (!this._extendsPrecondition(Precondition)) return;
                // @ts-expect-error Fix abstract class
                const precondition = new Precondition();
                this._entries.push(precondition);
            }
        }

        /**
         * Run all the preconditions in this container for a slash command.
         * @param input The interaction that triggered the command.
         * @since 1.0.0
         */
        public async slashRun(input: Command.ChatInput) {
            for (const entrie of this._entries)
                if (typeof entrie.slashRun === 'function') {
                    const result = await entrie.slashRun(input, this._parent as any);
                    if (!result.success) return result;
                }

            return Result.ok();
        }

        /**
         * Run all the preconditions in this container for a prefix command.
         * @param message The message that triggered the command.
         * @since 1.0.0
         */
        public async prefixRun(message: Command.Message) {
            for (const entrie of this._entries)
                if (typeof entrie.slashRun === 'function') {
                    const result = await entrie.prefixRun(message, this._parent as any);
                    if (!result.success) return result;
                }

            return Result.ok();
        }

        /**
         * Run all the preconditions in this container for a context menu command.
         * @param menu The interaction that triggered the command.
         * @since 1.0.0
         */
        public async contextMenuRun(menu: Command.ContextMenu) {
            for (const entrie of this._entries)
                if (typeof entrie.slashRun === 'function') {
                    const result = await entrie.contextMenuRun(menu, this._parent as any);
                    if (!result.success) return result;
                }

            return Result.ok();
        }

        /**
         * Run all the preconditions in this container for any component action.
         * @param interaction The interaction that triggered the action.
         * @since 1.0.0
         */
        public async actionRun(interaction: Action.AnyInteraction) {
            for (const entrie of this._entries)
                if (typeof entrie.slashRun === 'function') {
                    const result = await entrie.actionRun(interaction, this._parent as any);
                    if (!result.success) return result;
                }

            return Result.ok();
        }

        private _extendsPrecondition(value: unknown): value is typeof Precondition {
            return typeof value === 'function' && value.prototype instanceof Precondition;
        }
    }
}
