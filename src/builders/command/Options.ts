import { UnsafeCommandOptionsBuilder } from './UnsafeOptions';
import {
    validateType,
    validateKind,
    validateName,
    validateAlias,
    validateDescription,
    validateCategory,
    validatePrecondition,
} from './Assertions';
import type { Command } from '../../structures/Command';
import type { Precondition } from '../../structures/Precondition';

export class CommandOptionsBuilder extends UnsafeCommandOptionsBuilder {
    public override setType(type: Command.Type | Command.OptionType): CommandOptionsBuilder {
        validateType(type);
        this.data.type = type;
        return this;
    }

    public override setKinds(kinds: Command.Kind[]): CommandOptionsBuilder {
        kinds.forEach(validateKind);
        this.data.kinds = kinds;
        return this;
    }

    public override setName(name: string): CommandOptionsBuilder {
        validateName(name);
        this.data.name = name;
        return this;
    }

    public override setAliases(aliases: string[]): CommandOptionsBuilder {
        aliases.forEach(validateAlias);
        this.data.aliases = aliases;
        return this;
    }

    public override setDescription(description: string): CommandOptionsBuilder {
        validateDescription(description);
        this.data.description = description;
        return this;
    }

    public override setCategory(category: string): CommandOptionsBuilder {
        validateCategory(category);
        this.data.category = category;
        return this;
    }

    public override setPreconditions(preconditions: typeof Precondition[]): CommandOptionsBuilder {
        preconditions.forEach(validatePrecondition);
        this.data.preconditions = preconditions;
        return this;
    }
}
