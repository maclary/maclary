import { s } from '@sapphire/shapeshift';
import * as Discord from 'discord.js';
import * as Lexure from './Arguments';
import { Base } from './Base';
import { Precondition } from './Precondition';
import type { Awaitable } from '#/types';
import { Events } from '#/utilities/Events';
import * as Regexes from '#/utilities/Regexes';

const toJSON = (obj: any) => ('toJSON' in obj ? obj.toJSON() : obj);

/**
 * All commands must extend this class and implement its required methods.
 * @typeparam T The command type.
 * @typeparam K The command kinds.
 * @since 1.0.0
 */
export abstract class Command<
        T extends Command.Type,
        K extends T extends Command.Type.ChatInput
            ? (Command.Kind.Prefix | Command.Kind.Slash)[]
            : (Command.Kind.Message | Command.Kind.User)[]
    >
    extends Base
    implements Omit<Command.Options<T, K>, 'preconditions'>
{
    /** @internal */ public _isBase = false;

    /** @internal */ public _variety: Command.Variety = Command.Variety.Command;

    public readonly type: T;

    public readonly kinds: K;

    public readonly name!: string;

    public readonly nameLocalizations?: Discord.LocalizationMap;

    public readonly description: string;

    public readonly descriptionLocalizations?: Discord.LocalizationMap;

    public readonly category?: string;

    public readonly categoryLocalizations?: Discord.LocalizationMap;

    public readonly dmPermission: boolean = true;

    public readonly defaultMemberPermissions = new Discord.PermissionsBitField(0n);

    public readonly options?: T extends Command.Type.ChatInput ? Command.OptionData[] : never;

    /**
     * The precondition container for this command.
     * @since 1.0.0
     */
    public readonly preconditions: Precondition.Container<Command<T, K>> =
        new Precondition.Container(this);

    /**
     * @param options Options for the command.
     * @since 1.0.0
     */
    public constructor(options: Command.Options<T, K>) {
        super();

        this.type = options.type;
        this.kinds = options.kinds;

        const results = this._schema.parse(options);
        this.nameLocalizations = results.nameLocalizations;
        this.description = results.description;
        this.descriptionLocalizations = results.descriptionLocalizations;
        this.category = results.category;
        this.categoryLocalizations = results.categoryLocalizations;

        if (results.dmPermission !== undefined) this.dmPermission = results.dmPermission;
        if (results.defaultMemberPermissions !== undefined)
            this.defaultMemberPermissions = results.defaultMemberPermissions;

        if (results.name) this.name = results.name;
        Reflect.set(this, 'options', results.options);

        for (const pre of results.preconditions) this.preconditions.add(pre);
    }

    private get _schema() {
        const isChatInput = this.type === Command.Type.ChatInput;
        const nameRegex = isChatInput
            ? Regexes.ChatInputCommandName
            : Regexes.ContextMenuCommandName;

        return s.object({
            type: s.nativeEnum(Command.Type),
            kinds: s.array(s.nativeEnum(Command.Kind)),
            name: s.string.regex(nameRegex),
            nameLocalizations: s.record(s.string.regex(nameRegex)).optional,
            description: s.string.lengthLessThanOrEqual(100),
            descriptionLocalizations: s.record(s.string.lengthLessThanOrEqual(100)).optional,
            category: s.string.optional,
            categoryLocalizations: s.record(s.string.optional).optional,
            dmPermission: s.boolean.optional.default(true),
            defaultMemberPermissions: s
                .instance(Discord.PermissionsBitField)
                .default(new Discord.PermissionsBitField(0n)).optional,
            options: s.any.array.default([]),
            preconditions: s.any.array.default([]),
        });
    }

    private get _isGroup() {
        return (
            this._variety === Command.Variety.Group ||
            this.options?.some(opt => toJSON(opt).type === 1)
        );
    }

    // Manual group refers to a command there the subcommands are manually defined
    // in the options array, rather than Maclary automatically generating them.
    private get _isManualGroup() {
        return this._isGroup && !this.options?.some(opt => toJSON(opt).type === 1);
    }

    private get _subCommands() {
        if (this.type === Command.Type.ContextMenu || !this.options) return [];
        return this.options.filter((opt): opt is Command<any, any> => opt instanceof Command);
    }

    /**
     * Convert this command class into an application command data object.
     * @since 1.0.0
     */
    public toJSON() {
        if (this.type === Command.Type.ContextMenu)
            return this.kinds.map(kind => ({
                type: kind === Command.Kind.Message ? 3 : 2,
                name: this.name,
                nameLocalizations: this.nameLocalizations,
                dmPermission: this.dmPermission,
                defaultMemberPermissions: this.defaultMemberPermissions,
            }));

        return {
            type: this._isBase ? 1 : this._isGroup ? 2 : 1,
            name: this.name,
            nameLocalizations: this.nameLocalizations,
            description: this.description,
            descriptionLocalizations: this.descriptionLocalizations,
            dmPermission: this.dmPermission,
            defaultMemberPermissions: this.defaultMemberPermissions,
            options: this.options?.map(opt => toJSON(opt)),
        };
    }

    /**
     * Triggered when a chat input interaction is received, this method is called.
     * @param input The chat input interaction.
     * @since 1.0.0
     */
    public onSlash?(input: Command.ChatInput): Awaitable<unknown>;

    /** @internal */ public async _handleSlash(input: Command.ChatInput): Promise<unknown> {
        const payload = { from: input, command: this };

        const result = await this.preconditions.slashRun(input);
        if (Precondition.Result.isOk(result))
            this.container.client.emit(Events.CommandPreconditionPass, payload, result);
        else {
            this.container.client.emit(Events.CommandPreconditionFail, payload, result);
            return;
        }

        if (!this._isGroup || this._isManualGroup) {
            if (typeof this.onSlash === 'function') this.onSlash(input);
            throw new Error(`Command "${this.name}" is missing its "onSlash" handler.`);
        }

        const name = input.options.getSubcommandGroup() ?? input.options.getSubcommand();
        Reflect.set(input.options, '_groups', null);
        const command = this.container.maclary.commands.resolve(name, this._subCommands);
        if (!(command instanceof Command)) return;

        return command._handleSlash(input);
    }

    /**
     * Triggered when a autocomplete interaction is received, this method is called.
     * @param autocomplete The autocomplete interaction.
     * @since 1.0.0
     */
    public onAutocomplete?(autocomplete: Command.Autocomplete): Awaitable<unknown>;

    /** @internal */ public async _handleAutocomplete(
        autocomplete: Command.Autocomplete
    ): Promise<unknown> {
        if (!this._isGroup || this._isManualGroup) {
            if (typeof this.onAutocomplete === 'function') this.onAutocomplete(autocomplete);
            throw new Error(`Command "${this.name}" is missing its "onAutocomplete" handler.`);
        }

        const name =
            autocomplete.options.getSubcommandGroup() ?? autocomplete.options.getSubcommand();
        Reflect.set(autocomplete.options, '_groups', null);
        const command = this.container.maclary.commands.resolve(name, this._subCommands);
        if (!(command instanceof Command)) return undefined;
        return command._handleAutocomplete(autocomplete);
    }

    /**
     * Triggered when a prefixed message is received for this command.
     * @param message The message instance.
     * @param args Parsed arguments from the message content.
     * @since 1.0.0
     */
    public onPrefix?(message: Command.Message, args: Command.Arguments): Awaitable<unknown>;

    /** @internal */ public async _handlePrefix(
        message: Command.Message,
        args: Command.Arguments
    ): Promise<unknown> {
        const payload = { from: message, command: this, args };

        const result = await this.preconditions.prefixRun(message);
        if (Precondition.Result.isOk(result))
            this.container.client.emit(Events.CommandPreconditionPass, payload, result);
        else {
            this.container.client.emit(Events.CommandPreconditionFail, payload, result);
            return;
        }

        if (!this._isGroup || this._isManualGroup) {
            if (this.onPrefix) return this.onPrefix(message, args);
            throw new Error(`Command "${this.name}" is missing its "onPrefix" handler.`);
        }

        const name = args.single();
        if (!name) return undefined;
        const command = this.container.maclary.commands.resolve(name, this._subCommands);
        if (!(command instanceof Command)) return undefined;

        return command._handlePrefix(message, args);
    }

    /**
     * Triggered when a message context menu interaction is received, this method is called.
     * @param menu The message menu interaction.
     * @since 1.0.0
     */
    public onMessageMenu?(menu: Command.MessageContextMenu): Awaitable<unknown>;

    /** @internal */ public async _handleMessageMenu(menu: Command.MessageContextMenu) {
        const payload = { from: menu, command: this };

        const result = await this.preconditions.contextMenuRun(menu);
        if (Precondition.Result.isOk(result))
            this.container.client.emit(Events.CommandPreconditionPass, payload, result);
        else {
            this.container.client.emit(Events.CommandPreconditionFail, payload, result);
            return;
        }

        if (typeof this.onMessageMenu === 'function') return this.onMessageMenu(menu);
        throw new Error(`Command "${this.name}" is missing its "onMessageMenu" handler.`);
    }

    /**
     * Triggered when a user context menu interaction is received, this method is called.
     * @param menu The user menu interaction.
     * @since 1.0.0
     */
    public onUserMenu?(menu: Command.UserContextMenu): Awaitable<unknown>;

    /** @internal */ public async _handleUserMenu(menu: Command.UserContextMenu) {
        const payload = { from: menu, command: this };

        const result = await this.preconditions.contextMenuRun(menu);
        if (Precondition.Result.isOk(result))
            this.container.client.emit(Events.CommandPreconditionPass, payload, result);
        else {
            this.container.client.emit(Events.CommandPreconditionFail, payload, result);
            return;
        }

        if (typeof this.onUserMenu === 'function') return this.onUserMenu(menu);
        throw new Error(`Command "${this.name}" is missing its "onUserMenu" handler.`);
    }
}

export namespace Command {
    /** @internal */
    export enum Variety {
        Group = 1,
        Command,
    }

    /**
     * Enum to represent the type of command.
     * @since 1.0.0
     */
    export enum Type {
        ChatInput = 1,
        ContextMenu,
    }

    /**
     * Enum to represent the kind of command.
     * @since 1.0.0
     */
    export enum Kind {
        Slash = 1,
        Prefix,
        Message,
        User,
    }

    export interface Options<
        T extends Type,
        K extends T extends Type.ChatInput
            ? (Kind.Prefix | Kind.Slash)[]
            : (Kind.Message | Kind.User)[]
    > {
        /**
         * The category this command might belong to.
         * @since 1.0.0
         */
        category?: string;

        /**
         * The category localization dictionary for the command.
         * @since 1.0.0
         */
        categoryLocalizations?: Discord.LocalizationMap;

        /**
         * The default bitfield used to determine whether this
         * command can be used in a guild.
         * @since 1.0.0
         */
        defaultMemberPermissions?: Discord.PermissionsBitField;

        /**
         * 1-100 character description for the command.
         * @since 1.0.0
         */
        description: string;

        /**
         * The description localization dictionary for the command.
         * Values follow the same restrictions as description.
         * @since 1.0.0
         */
        descriptionLocalizations?: Discord.LocalizationMap;

        /**
         * Indicates whether the command is available in DMs with the
         * app, only for globally-scoped commands.
         * @default true
         * @since 1.0.0
         */
        dmPermission?: boolean;

        /**
         * What kinds of command this is, sets whether this command is:
         * ChatInput: a slash, a prefix, or both.
         * ContextMenu: a message, a user, or both.
         * @see {@link Command.Kind}
         * @since 1.0.0
         */
        kinds: K;

        /**
         * The name of the command.
         * @since 1.0.0
         */
        name: string;

        /**
         * The name localization dictionary for the command.
         * @since 1.0.0
         */
        nameLocalizations?: Discord.LocalizationMap;

        /**
         * The options for the command.
         * @since 1.0.0
         */
        options?: T extends Type.ChatInput ? OptionData[] : never;

        /**
         * The preconditions for the command.
         * @since 1.0.0
         */
        preconditions?: typeof Precondition[];

        /**
         * The type of command this is.
         * @see {@link Command.Type}
         * @since 1.0.0
         */
        type: T;
    }

    export type GroupOptions = Partial<
        Pick<
            Options<any, any>,
            'description' | 'descriptionLocalizations' | 'name' | 'nameLocalizations'
        >
    >;
    export type CategoryOptions = Partial<
        Pick<Options<any, any>, 'category' | 'categoryLocalizations'>
    >;

    export type Arguments = Lexure.Arguments;
    export const Arguments = Lexure.Arguments;

    export type Message = Discord.Message;
    export const Message = Discord.Message;

    export type ChatInput = Discord.ChatInputCommandInteraction;
    export const ChatInput = Discord.ChatInputCommandInteraction;

    export type Autocomplete = Discord.AutocompleteInteraction;
    export const Autocomplete = Discord.AutocompleteInteraction;

    export type OptionType = Discord.ApplicationCommandOptionType;
    export const OptionType = Discord.ApplicationCommandOptionType;
    export type OptionData = Discord.ApplicationCommandOptionData;

    export type UserContextMenu = Discord.UserContextMenuCommandInteraction;
    export const UserContextMenu = Discord.UserContextMenuCommandInteraction;

    export type MessageContextMenu = Discord.MessageContextMenuCommandInteraction;
    export const MessageContextMenu = Discord.MessageContextMenuCommandInteraction;

    export type ContextMenu = Discord.ContextMenuCommandInteraction;
    export const ContextMenu = Discord.ContextMenuCommandInteraction;

    export type AnyInteraction = ChatInput | ContextMenu;
}
