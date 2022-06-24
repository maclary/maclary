import { Base } from './Base';
import { Error } from '../errors';
import { Precondition, PreconditionsContainer } from './Precondition';
import type { Args } from './Args';

import Joi from 'joi';
import * as Discord from 'discord.js';

export interface CommandOptions {
    /**
     * The type of the command, one of the the command or command option types.
     * @default Command.Type.ChatInput
     */
    type: Command.Type | Command.OptionType;

    /**
     * What kinds of command this is, sets wether or not this command is
     * a prefix command, interaction command, or both.
     * @default [Command.Kind.Prefix, Command.Kind.Interaction]
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
    options?: (Command | CommandOptions | Discord.ApplicationCommandOptionData)[];

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
     */
    public type: Command.Type | Command.OptionType;

    public internalType: Command.InternalType = Command.InternalType.Command;

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
    public category: string | undefined;

    /**
     * The options for the command.
     */
    public options: Array<Command | CommandOptions | Discord.ApplicationCommandOptionData>;

    /**
     * The preconditions for the command.
     */
    public preconditions = new PreconditionsContainer();

    public constructor(options: CommandOptions) {
        super();

        const schema = Joi.object({
            type: Joi.string()
                .valid(...Object.values(Command.Type))
                .required(),
            name: Joi.string()
                .regex(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)
                .required(),
            aliases: Joi.array()
                .items(
                    Joi.string()
                        .regex(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)
                        .required(),
                )
                .default([]),
            description: Joi.string().default('-'),
            category: Joi.string().optional(),
            kinds: Joi.array()
                .items(Joi.string().valid(...Object.values(Command.Kind)))
                .default([]),
            options: Joi.array().items(Joi.any()).default([]),
            preconditions: Joi.array().items(Joi.any()).default([]),
        });

        const { error, value } = schema.validate(options);
        if (error !== undefined) throw error;

        this.type = value.type;
        this.name = value.name;
        this.aliases = value.aliases;
        this.description = value.description;
        this.category = value.category;
        this.kinds = value.kinds;
        this.options = value.options;

        value.preconditions.forEach((p: any) => this.preconditions.add(p));
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
}

export namespace Command {
    export type Arguments = Args;
    export type Options = CommandOptions;
    export type ChatInput = Discord.ChatInputCommandInteraction;
    export type UserContextMenu = Discord.UserContextMenuCommandInteraction;
    export type MessageContextMenu = Discord.MessageContextMenuCommandInteraction;
    export type ContextMenu = UserContextMenu | MessageContextMenu;
    export type Message = Discord.Message;
    export import Type = Discord.ApplicationCommandType;
    export import OptionType = Discord.ApplicationCommandOptionType;

    export enum InternalType {
        Command = 1,
        Group,
    }

    export enum Kind {
        Prefix = 1,
        Interaction,
    }
}
