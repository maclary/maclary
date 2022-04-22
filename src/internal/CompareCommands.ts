import { Command } from '../structures/Command';

export type Differences = [string, any, any][];

export function compareCommands(existing: any, local: any): Differences {
    if (existing.type === Command.Type.ChatInput) {
        return compareChatInputs(existing, local);
    }
    return compareContextMenus(existing, local);
}

export function compareContextMenus(existing: any, local: any): Differences {
    const differences: Differences = [];

    // Compare name
    if (existing.name.toLowerCase() !== local.name.toLowerCase()) {
        differences.push(['name', existing.name, local.name]);
    }

    // Compare description
    if (existing.description !== local.description) {
        differences.push(['description', existing.description, local.description]);
    }

    return differences;
}

export function compareChatInputs(existing: any, local: any, prefix = ''): Differences {
    const differences: Differences = [];

    // Compare name
    if (existing.name.toLowerCase() !== local.name.toLowerCase()) {
        differences.push([`${prefix}name`, existing.name, local.name]);
    }

    // Compare description
    if (existing.description !== local.description) {
        differences.push([`${prefix}description`, existing.description, local.description]);
    }

    // Compare options length
    if ((existing.options?.length ?? 0) !== (local.options?.length ?? 0)) {
        differences.push([
            `${prefix}options length`,
            existing.options?.length ?? 0,
            local.options?.length ?? 0,
        ]);
    }

    // Compare options
    if (local.options?.length > 0) {
        for (let i = 0; i < local.options.length; i++) {
            differences.push(
                ...compareOptions(
                    existing.options?.[i],
                    local.options[i],
                    `${prefix + local.options[i].name} `,
                ),
            );
        }
    }

    return differences;
}

function compareOptions(existing: any, local: any, prefix = ''): Differences {
    const differences: Differences = [];

    // Existing option
    if (!existing) {
        return [`${prefix}option does not exist`, undefined, local];
    }

    // Compare type
    if (existing.type !== local.type) {
        differences.push([`${prefix}type`, existing.type, local.type]);
    }

    // Compare name
    if (existing.name.toLowerCase() !== local.name.toLowerCase()) {
        differences.push([`${prefix}name`, existing.name, local.name]);
    }

    // Compare description
    if (existing.description !== local.description) {
        differences.push([`${prefix}description`, existing.description, local.description]);
    }

    // Compare required
    if ((existing.required ?? false) !== local.required) {
        differences.push([`${prefix}required`, existing.required, local.required]);
    }

    // Compare min and max values
    if ((existing.minValue ?? 0) !== (local.minValue ?? 0)) {
        differences.push([`${prefix}minValue`, existing.minValue, local.minValue]);
    }
    if ((existing.maxValue ?? Infinity) !== (local.maxValue ?? Infinity)) {
        differences.push([`${prefix}maxValue`, existing.maxValue, local.maxValue]);
    }

    // Compare autocomplete
    if ((existing.autocomplete ?? false) !== (local.autocomplete ?? false)) {
        differences.push([`${prefix}autocomplete`, existing.autocomplete, local.autocomplete]);
    }

    // Compare choices length
    if ((existing.choices?.length ?? 0) !== (local.choices?.length ?? 0)) {
        differences.push([
            `${prefix}choices length`,
            existing.choices?.length ?? 0,
            local.choices?.length ?? 0,
        ]);
    }

    // Compare choices
    if (local.choices?.length > 0) {
        for (let i = 0; i < local.choices.length; i++) {
            differences.push(
                ...compareChoice(
                    existing.choices?.[i],
                    local.choices[i],
                    `${prefix + local.choices[i].name} `,
                ),
            );
        }
    }

    // Compare options length
    if ((existing.options?.length ?? 0) !== (local.options?.length ?? 0)) {
        differences.push([
            `${prefix}options length`,
            existing.options?.length ?? 0,
            local.options?.length ?? 0,
        ]);
    }

    // Compare options
    if (local.options?.length > 0) {
        for (let i = 0; i < local.options.length; i++) {
            differences.push(
                ...compareOptions(
                    existing.options?.[i],
                    local.options[i],
                    `${prefix + local.options[i].name} `,
                ),
            );
        }
    }

    return differences;
}

function compareChoice(existing: any, local: any, prefix = ''): Differences {
    const differences: Differences = [];

    // Existing option
    if (!existing) {
        return [`${prefix}choice does not exist`, undefined, local];
    }

    // Compare name
    if (existing.name.toLowerCase() !== local.name.toLowerCase()) {
        differences.push([`${prefix}option choice name`, existing.name, local.name]);
    }

    // Compare value
    if (existing.value !== local.value) {
        differences.push([`${prefix}option choice value`, existing.value, local.value]);
    }

    return differences;
}
