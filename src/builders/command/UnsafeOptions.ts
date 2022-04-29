import { Base } from '../../structures/Base';
import { Command, CommandOptions } from '../../structures/Command';
import type { Precondition } from '../../structures/Precondition';

export class UnsafeCommandOptionsBuilder extends Base {
    public readonly data: Partial<CommandOptions> = {
        type: Command.Type.ChatInput,
        kinds: [Command.Kind.Prefix],
        aliases: [],
        description: '-',
        category: '',
        options: [],
    };

    /**
     * Sets the command type.
     * @param type The type.
     */
    public setType(type: Command.Type | Command.OptionType): UnsafeCommandOptionsBuilder {
        this.data.type = type;
        return this;
    }

    /**
     * Sets the command kinds.
     * @param kinds Array of command kinds.
     */
    public setKinds(kinds: Command.Kind[]): UnsafeCommandOptionsBuilder {
        this.data.kinds = kinds;
        return this;
    }

    /**
     * Sets the name of this command.
     * @param name The name.
     */
    public setName(name: string): UnsafeCommandOptionsBuilder {
        this.data.name = name;
        return this;
    }

    /**
     * Sets the command name aliases.
     * @param aliases Array of command aliases.
     */
    public setAliases(aliases: string[]): UnsafeCommandOptionsBuilder {
        this.data.aliases = aliases;
        return this;
    }

    /**
     * Sets the description of this command.
     * @param description The descrption.
     * @returns
     */
    public setDescription(description: string): UnsafeCommandOptionsBuilder {
        this.data.description = description;
        return this;
    }

    /**
     * Sets the category of this command.
     * @param category The category.
     */
    public setCategory(category: string): UnsafeCommandOptionsBuilder {
        this.data.category = category;
        return this;
    }

    /**
     * Sets the commands options.
     * @param options Array of command options.
     * @returns
     */
    public setOptions(options: any[]): UnsafeCommandOptionsBuilder {
        this.data.options = options;
        return this;
    }

    /**
     * Sets the command preconditions.
     * @param preconditions Array of preconditions.
     */
    public setPreconditions(preconditions: typeof Precondition[]): UnsafeCommandOptionsBuilder {
        this.data.preconditions = preconditions;
        return this;
    }

    /**
     * Transform the builder into a plain object.
     */
    public toJSON(): CommandOptions {
        return { ...this.data } as CommandOptions;
    }
}
