import { Base } from './Base';
import { Error } from '../errors';
import { Precondition, PreconditionsContainer } from './Precondition';
import { CustomId } from '../utils/CustomId';
import type { Args } from './Args';

import { z } from 'zod';
import type * as Discord from 'discord.js';

export interface CommandOptions {
    /**
     * The type of the command, one of the the command or command option types.
     * @default Command.Type.ChatInput
     */
    type?: Command.Type | Command.OptionType;

    /**
     * What kinds of command this is, sets wether or not this command is
     * a prefix command, interaction command, or both.
     * @default [Command.Kind.Prefix, Command.Kind.Interaction]
     */
    kinds?: Command.Kind[];

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
     * @default '-'
     */
    description?: string;

    /**
     * The category this command might belong to.
     * @default undefined
     */
    category?: string;

    /**
     * The options for the command.
     * @default []
     */
    options?: Array<Command | CommandOptions | Discord.ApplicationCommandOptionData>;

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
    /**
     * The type of the command, one of the the command or command option types.
     * @default Command.Type.ChatInput
     */
    public type: Command.Type | Command.OptionType;
    public internalType: Command.InternalType = Command.InternalType.Command;

    /**
     * What kinds of command this is, sets wether or not this command is
     * a prefix command, interaction command, or both.
     * @default [Command.Kind.Prefix, Command.Kind.Interaction]
     */
    public kinds: Command.Kind[];

    /**
     * The name of the command.
     */
    public name: string;

    /**
     * Alais command names for this command, only works with prefix commands.
     * @default []
     */
    public aliases: string[];

    /**
     * The description for the command.
     * @default '-'
     */
    public description: string;

    /**
     * The category this command might belong to.
     * @default ''
     */
    public category: string | undefined;

    /**
     * The options for the command.
     * @default []
     */
    public options: Array<Command | CommandOptions | Discord.ApplicationCommandOptionData>;

    /**
     * The preconditions for the command.
     * @default PreconditionsContainer
     */
    public preconditions = new PreconditionsContainer();

    public constructor(options: CommandOptions) {
        super();

        this.type = z.nativeEnum(Command.Type).default(Command.Type.ChatInput).parse(options.type);
        this.description = z.string().default('-').parse(options.description);
        this.category = z.string().default('').parse(options.category);
        this.options = z.array(z.any()).default([]).parse(options.options);

        this.kinds = z
            .array(z.nativeEnum(Command.Kind))
            .default([Command.Kind.Prefix, Command.Kind.Interaction])
            .parse(options.kinds);
        this.name = z
            .string()
            .regex(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)
            .parse(options.name);
        this.aliases = z
            .array(z.string().regex(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u))
            .default([])
            .parse(options.aliases);

        z.array(z.instanceof(Precondition as any))
            .default([])
            .parse(options.preconditions?.map((p) => p.prototype));

        options.preconditions?.forEach((precondition) => this.preconditions.add(precondition));
    }

    /**
     * When a slash command interaction is received for this command.
     * @param interaction {ChatInputCommandInteraction} The command interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onChatInput(interaction: Discord.ChatInputCommandInteraction): Promise<unknown> {
        if (this.internalType === Command.InternalType.Group) {
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
        if (this.internalType === Command.InternalType.Group) {
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
    public onUserContextMenu(_: Command.UserContextMenu): Promise<unknown> {
        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onUserContextMenu');
    }

    /**
     * When a message context menu command interaction is received for this command.
     * @param menu {Command.SelectMenu} The select menu interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public onMessageContextMenu(_: Command.MessageContextMenu): Promise<unknown> {
        throw new Error('COMMAND_MISSING_METHOD', this.name, 'onMessageContextMenu');
    }

    /**
     * When a button interaction is received for this command.
     * @param button {Command.Button} The button interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onButton(button: Command.Button): Promise<unknown> {
        if (this.internalType === Command.InternalType.Group) {
            const [commandNames] = CustomId.parse(button.customId);
            const command = this.options.find((c) => commandNames.includes(c.name));
            if (command instanceof Command) return command.onButton(button);
            return undefined;
        }

        throw new Error(`Command ${this.name} is missing its onButton method`);
    }

    /**
     * When a select menu interaction is received for this command.
     * @param menu {Command.ModalSubmit} The modal submit interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onSelectMenu(menu: Command.SelectMenu): Promise<unknown> {
        if (this.internalType === Command.InternalType.Group) {
            const [commandNames] = CustomId.parse(menu.customId);
            const command = this.options.find((c) => commandNames.includes(c.name));
            if (command instanceof Command) return command.onSelectMenu(menu);
            return undefined;
        }

        throw new Error(`Command ${this.name} is missing its onSelectMenu method`);
    }

    /**
     * When a modal submit interaction is received for this command.
     * @param modal {Command.ModalSubmit} The modal interaction
     * @returns {Promise<unknown>}
     * @abstract
     */
    public async onModalSubmit(modal: Command.ModalSubmit): Promise<unknown> {
        if (this.internalType === Command.InternalType.Group) {
            const [commandNames] = CustomId.parse(modal.customId);
            const command = this.options.find((c) => commandNames.includes(c.name));
            if (command instanceof Command) return command.onModalSubmit(modal);
            return undefined;
        }

        throw new Error(`Command ${this.name} is missing its onModalSubmit method`);
    }
}

export namespace Command {
    export type Arguments = Args;
    export type Options = CommandOptions;
    export type ChatInput = Discord.ChatInputCommandInteraction;
    export type UserContextMenu = Discord.UserContextMenuCommandInteraction;
    export type MessageContextMenu = Discord.MessageContextMenuCommandInteraction;
    export type ContextMenu = UserContextMenu | MessageContextMenu;
    export type Message = Discord.Message;
    export type Button = Discord.ButtonInteraction;
    export type SelectMenu = Discord.SelectMenuInteraction;
    export type ModalSubmit = Discord.ModalSubmitInteraction;

    export enum Type {
        ChatInput = 1,
        User,
        Message,
    }

    export enum InternalType {
        Command = 1,
        Group,
    }

    export enum OptionType {
        Subcommand = 1,
        SubcommandGroup,
        String,
        Integer,
        Boolean,
        User,
        Channel,
        Role,
        Mentionable,
        Number,
        Attachment,
    }

    export enum Kind {
        Prefix = 1,
        Interaction,
    }
}
