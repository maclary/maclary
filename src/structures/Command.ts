import { Base } from './Base';
import { Error } from '../errors';
import { Precondition, PreconditionsContainer } from './Precondition';
import type { Args } from './Args';

import { s } from '@sapphire/shapeshift';
import * as Discord from 'discord.js';

export interface CommandOptions {
    /**
     * The type of the command, one of the the command or command option types.
     */
    type: Command.Type;

    /**
     * What kinds of command this is, sets wether or not this command is
     * a prefix command, interaction command, or both.
     */
    kinds: Command.Kind[];

    /**
     * The name of the command.
     */
    name: string;

    /**
     * Alais command names for this command, only applies to prefix commands.
     * @default []
     */
    aliases?: string[];

    /**
     * The description for the command.
     */
    description?: string;

    /**
     * The category this command might belong to.
     * @default ''
     */
    category?: string;

    /**
     * The options for the command.
     * @default []
     */
    options?: Discord.ApplicationCommandOptionData[];

    /**
     * The preconditions for the command.
     * @default []
     */
    preconditions?: typeof Precondition[];
}

/**
 * All commands must extend this class and implement its abstract methods.
 */
export abstract class Command extends Base {
    public internalType: Command.InternalType = Command.InternalType.Base;
    public subType: Command.SubType = Command.SubType.Command;

    /**
     * The type of the command.
     */
    public type: Command.Type;

    /**
     * What kinds of command this is, sets wether or not this command is
     * a prefix command, interaction command, or both.
     */
    public kinds: Command.Kind[];

    /**
     * The name of the command.
     */
    public name: string;

    /**
     * Alais command names for this command, only works with prefix commands.
     */
    public aliases: string[];

    /**
     * The description for the command.
     */
    public description: string;

    /**
     * The category this command might belong to.
     */
    public category: string;

    /**
     * The options for the command.
     */
    public options: (Command | Discord.ApplicationCommandOptionData)[];

    /**
     * The preconditions for the command.
     */
    public preconditions = new PreconditionsContainer();

    public constructor(options: CommandOptions) {
        super();

        this.type = s.nativeEnum(Command.Type).parse(options.type);
        this.kinds = s.nativeEnum(Command.Kind).array.parse(options.kinds);
        const regex =
            this.type === Command.Type.ChatInput
                ? /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u
                : /^[\w -]{3,32}$/;
        this.name = s.string.regex(regex).parse(options.name);
        this.aliases = s.string.regex(regex).array.parse(options.aliases ?? []);
        this.description = s.string.lengthLessThan(101).parse(options.description ?? '');
        this.category = s.string.optional.parse(options.category ?? '');
        this.options = s.any.array.parse(options.options ?? []);

        const preconditions = s.any.array.parse(options.preconditions ?? []);
        preconditions.forEach((p) => this.preconditions.add(p));
    }

    /**
     * When a slash command interaction is received for this command.
     * @param interaction {ChatInputCommandInteraction} The command interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onChatInput(interaction: Command.ChatInput): Promise<unknown> {
        if (this.subType === Command.SubType.Group) {
            const commandName =
                interaction.options.getSubcommandGroup() || interaction.options.getSubcommand();
            Reflect.set(interaction.options, '_group', null);
            const command = this.options.find((c) => c.name === commandName);

            if (command instanceof Command) {
                const result = await command.preconditions.chatInputRun(interaction, command);
                if (result.error === undefined) return command.onChatInput(interaction);
                const options = result.error.options as Discord.InteractionReplyOptions;
                return interaction.reply(options);
            }
            return undefined;
        }

        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onChatInput');
    }

    /**
     * When a message command is received for this command.
     * @param message {Command.Message} The message
     * @param args {Command.Arguments} The remaining arguments
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onMessage(message: Command.Message, args: Command.Arguments): Promise<unknown> {
        if (this.subType === Command.SubType.Group) {
            const single = args.single();
            const command = this.options.find((c) => c.name === single);
            // if (command instanceof Command) return command.onMessage(message, args);

            if (command instanceof Command) {
                const result = await command.preconditions.messageRun(message, command);
                if (result.error === undefined) return command.onMessage(message, args);
                const options = result.error.options as Discord.ReplyMessageOptions;
                return message.reply(options);
            }
            return undefined;
        }

        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onMessage');
    }

    /**
     * When a user context menu command interaction is received for this command.
     * @param menu {Command.UserContextMenu} The user context menu
     * @returns {Promise<unknown>}
     * @abstract
     */
    public onUserContextMenu(menu: Command.UserContextMenu): Promise<unknown> {
        void menu;
        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onUserContextMenu');
    }

    /**
     * When a message context menu command interaction is received for this command.
     * @param menu {Command.SelectMenu} The select menu interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public onMessageContextMenu(menu: Command.MessageContextMenu): Promise<unknown> {
        void menu;
        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onMessageContextMenu');
    }

    public toJSON(): Discord.ApplicationCommandData | Discord.ApplicationCommandData[] {
        if (this.type === Command.Type.ContextMenu) {
            return this.kinds.map((kind) => ({
                type:
                    kind === Command.Kind.Message
                        ? Discord.ApplicationCommandType.Message
                        : Discord.ApplicationCommandType.User,
                name: this.name,
            }));
        }
        return {
            type:
                this.internalType === Command.InternalType.Base
                    ? Discord.ApplicationCommandType.ChatInput
                    : this.internalType === Command.InternalType.Group
                    ? Discord.ApplicationCommandOptionType.SubcommandGroup
                    : this.internalType === Command.InternalType.Sub
                    ? Discord.ApplicationCommandOptionType.Subcommand
                    : Discord.ApplicationCommandOptionType.Subcommand,
            name: this.name,
            description: this.description,
            options: this.options.map((o) => Reflect.get(o, 'toJSON')?.bind(o)() ?? o),
        } as any;
    }
}

export namespace Command {
    export enum InternalType {
        Base = 1,
        Group,
        Sub,
    }

    export enum SubType {
        Group = 1,
        Command,
    }

    export enum Type {
        ChatInput = 1,
        ContextMenu,
    }

    export enum Kind {
        User = 1,
        Message,
        Slash,
        Prefix,
    }

    export type Options = CommandOptions;
    export type OptionType = Discord.ApplicationCommandOptionType;

    export type Message = Discord.Message;
    export type Arguments = Args;

    export type ChatInput = Discord.ChatInputCommandInteraction;
    export type UserContextMenu = Discord.UserContextMenuCommandInteraction;
    export type MessageContextMenu = Discord.MessageContextMenuCommandInteraction;
    export type ContextMenu = UserContextMenu | MessageContextMenu;
    export type Interaction = ChatInput | UserContextMenu | MessageContextMenu;
}
