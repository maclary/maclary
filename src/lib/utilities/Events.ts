import { Events as DJSEvents } from 'discord.js';
import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import type { Listener } from '#/structures/Listener';
import type { Precondition } from '#/structures/Precondition';

export const Events = {
    // Discord events
    ChannelCreate: DJSEvents.ChannelCreate as const,
    ChannelDelete: DJSEvents.ChannelDelete as const,
    ChannelPinsUpdate: DJSEvents.ChannelPinsUpdate as const,
    ChannelUpdate: DJSEvents.ChannelUpdate as const,
    ClientReady: DJSEvents.ClientReady as const,
    Debug: DJSEvents.Debug as const,
    Error: DJSEvents.Error as const,
    GuildBanAdd: DJSEvents.GuildBanAdd as const,
    GuildBanRemove: DJSEvents.GuildBanRemove as const,
    GuildCreate: DJSEvents.GuildCreate as const,
    GuildDelete: DJSEvents.GuildDelete as const,
    GuildEmojiCreate: DJSEvents.GuildEmojiCreate as const,
    GuildEmojiDelete: DJSEvents.GuildEmojiDelete as const,
    GuildEmojiUpdate: DJSEvents.GuildEmojiUpdate as const,
    GuildIntegrationsUpdate: DJSEvents.GuildIntegrationsUpdate as const,
    GuildMemberAdd: DJSEvents.GuildMemberAdd as const,
    GuildMemberAvailable: DJSEvents.GuildMemberAdd as const,
    GuildMemberRemove: DJSEvents.GuildMemberRemove as const,
    GuildMembersChunk: DJSEvents.GuildMembersChunk as const,
    GuildMemberUpdate: DJSEvents.GuildMemberUpdate as const,
    GuildRoleCreate: DJSEvents.GuildRoleCreate as const,
    GuildRoleDelete: DJSEvents.GuildRoleDelete as const,
    GuildRoleUpdate: DJSEvents.GuildRoleUpdate as const,
    GuildStickerCreate: DJSEvents.GuildStickerCreate as const,
    GuildStickerDelete: DJSEvents.GuildStickerDelete as const,
    GuildStickerUpdate: DJSEvents.GuildStickerUpdate as const,
    GuildUnavailable: DJSEvents.GuildUnavailable as const,
    GuildUpdate: DJSEvents.GuildUpdate as const,
    InteractionCreate: DJSEvents.InteractionCreate as const,
    Invalidated: DJSEvents.Invalidated as const,
    InviteCreate: DJSEvents.InviteCreate as const,
    InviteDelete: DJSEvents.InviteDelete as const,
    MessageBulkDelete: DJSEvents.MessageBulkDelete as const,
    MessageCreate: DJSEvents.MessageCreate as const,
    MessageDelete: DJSEvents.MessageDelete as const,
    MessageReactionAdd: DJSEvents.MessageReactionAdd as const,
    MessageReactionRemove: DJSEvents.MessageReactionRemove as const,
    MessageReactionRemoveAll: DJSEvents.MessageReactionRemoveAll as const,
    MessageReactionRemoveEmoji: DJSEvents.MessageReactionRemoveEmoji as const,
    MessageUpdate: DJSEvents.MessageUpdate as const,
    PresenceUpdate: DJSEvents.PresenceUpdate as const,
    Raw: DJSEvents.Raw as const,
    ShardDisconnect: DJSEvents.ShardDisconnect as const,
    ShardError: DJSEvents.ShardError as const,
    ShardReady: DJSEvents.ShardReady as const,
    ShardReconnecting: DJSEvents.ShardReconnecting as const,
    ShardResume: DJSEvents.ShardResume as const,
    StageInstanceCreate: DJSEvents.StageInstanceCreate as const,
    StageInstanceDelete: DJSEvents.StageInstanceDelete as const,
    StageInstanceUpdate: DJSEvents.StageInstanceUpdate as const,
    ThreadCreate: DJSEvents.ThreadCreate as const,
    ThreadDelete: DJSEvents.ThreadDelete as const,
    ThreadListSync: DJSEvents.ThreadListSync as const,
    ThreadMembersUpdate: DJSEvents.ThreadMembersUpdate as const,
    ThreadMemberUpdate: DJSEvents.ThreadMemberUpdate as const,
    ThreadUpdate: DJSEvents.ThreadUpdate as const,
    TypingStart: DJSEvents.TypingStart as const,
    UserUpdate: DJSEvents.UserUpdate as const,
    VoiceServerUpdate: DJSEvents.VoiceServerUpdate as const,
    VoiceStateUpdate: DJSEvents.VoiceStateUpdate as const,
    Warn: DJSEvents.Warn as const,
    WebhooksUpdate: DJSEvents.WebhooksUpdate as const,

    // Maclary events
    /**
     * Emitted when a message is created consisting of only the client's mention.
     * @param {Command.Message} message The message that was created.
     * @since 1.0.0
     */
    ClientMention: 'clientMention' as const,

    /**
     * Emitted when a message is created by a user account.
     * @param {Command.Message} message The message that was created.
     * @since 1.0.0
     */
    UserMessage: 'userMessage' as const,

    /**
     * Emitted when a message is created and starts with the client's prefix.
     * @param {Command.Message} message The message that was created.
     * @param {string|RegExp} prefix The prefix that was used.
     * @since 1.0.0
     */
    PrefixedMessage: 'prefixedMessage' as const,

    /**
     * Emitted when a message is created and does not start with the client's prefix.
     * @param {Command.Message} message The message that was created.
     * @since 1.0.0
     */
    NonPrefixedMessage: 'nonPrefixedMessage' as const,

    /**
     * Emitted when a message is created that starts with the client's prefix but is not a valid command.
     * @param {Command.Message} message The message that was created.
     * @param {string} commandName The name of the command that was attempted to be used.
     * @since 1.0.0
     */
    UnknownPrefixCommand: 'unknownPrefixCommand' as const,

    /**
     * Emitted when a command precondition has passed.
     * @param {CommandPayload} payload The payload for the command.
     * @param {Precondition.ErrResul} result The result of the precondition.
     * @since 1.0.0
     */
    CommandPreconditionPass: 'commandPreconditionPass' as const,

    /**
     * Emitted when a command precondition has failed.
     * @param {CommandPayload} payload The payload for the command.
     * @param {Precondition.Error} result The result of the precondition.
     * @since 1.0.0
     */
    CommandPreconditionFail: 'commandPreconditionFail' as const,

    /**
     * Emitted when a action precondition has passed.
     * @param {ActionPayload} payload The payload for the action.
     * @param {Precondition.Error} result The result of the precondition.
     * @since 1.0.0
     */
    ActionPreconditionPass: 'actionPreconditionPass' as const,

    /**
     * Emitted when a action precondition has failed.
     * @param {ActionPayload} payload The payload for the action.
     * @param {Precondition.Error} result The result of the precondition.
     * @since 1.0.0
     */
    ActionPreconditionFail: 'actionPreconditionFail' as const,

    /**
     * Emitted when a command has successfully been executed.
     * @param {CommandPayload} payload The payload for the command.
     * @since 1.0.0
     */
    CommandSuccess: 'commandSuccess' as const,

    /**
     * Emitted when an error has occurred while executing a command.
     * @param {CommandPayload} payload The payload for the command.
     * @param {Error} error The error that occurred.
     * @since 1.0.0
     */
    CommandError: 'commandError' as const,

    /**
     * Emitted when an action has successfully been executed.
     * @param {ActionPayload} payload The payload for the action.
     * @since 1.0.0
     */
    ActionSuccess: 'actionSuccess' as const,

    /**
     * Emitted when an error has occurred while executing an action.
     * @param {ActionPayload} payload The payload for the action.
     * @param {Error} error The error that occurred.
     * @since 1.0.0
     */
    ActionError: 'actionError' as const,

    /**
     * Emitted when a listener has successfully been executed.
     * @param {ListenerPayload} payload The payload for the listener.
     * @since 1.0.0
     */
    ListenerSuccess: 'listenerSuccess' as const,

    /**
     * Emitted when an error has occurred while executing a listener.
     * @param {ListenerPayload} payload The payload for the listener.
     * @param {Error} error The error that occurred.
     * @since 1.0.0
     */
    ListenerError: 'listenerError' as const,
};

declare const MaclaryEvents: typeof Events;

export interface PrefixCommandPayload {
    args: Command.Arguments;
    command: Command<any, any>;
    from: Command.Message;
}

export interface InteractionCommandPayload {
    command: Command<any, any>;
    from: Command.AnyInteraction;
}

export type CommandPayload = InteractionCommandPayload | PrefixCommandPayload;

export interface ActionPayload {
    action: Action;
    from: Action.AnyInteraction;
}

export interface ListenerPayload {
    listener: Listener<any>;
}

declare module 'discord.js' {
    interface ClientEvents {
        // Message Create
        [MaclaryEvents.ClientMention]: [message: Message];
        [MaclaryEvents.UserMessage]: [message: Message];
        [MaclaryEvents.PrefixedMessage]: [message: Message, prefix: RegExp | string];
        [MaclaryEvents.NonPrefixedMessage]: [message: Message];
        [MaclaryEvents.UnknownPrefixCommand]: [message: Message, commandName: string];
        [MaclaryEvents.CommandPreconditionPass]: [payload: CommandPayload, result: Precondition.Ok];
        [MaclaryEvents.CommandPreconditionFail]: [
            payload: CommandPayload,
            result: Precondition.Error
        ];
        [MaclaryEvents.ActionPreconditionPass]: [payload: ActionPayload, result: Precondition.Ok];
        [MaclaryEvents.ActionPreconditionFail]: [
            payload: ActionPayload,
            result: Precondition.Error
        ];
        [MaclaryEvents.CommandSuccess]: [payload: CommandPayload];
        [MaclaryEvents.CommandError]: [payload: CommandPayload, error: Error];
        [MaclaryEvents.ActionSuccess]: [payload: ActionPayload];
        [MaclaryEvents.ActionError]: [payload: ActionPayload, error: Error];
        [MaclaryEvents.ListenerSuccess]: [payload: ListenerPayload];
        [MaclaryEvents.ListenerError]: [payload: ListenerPayload, error: Error];
    }
}
