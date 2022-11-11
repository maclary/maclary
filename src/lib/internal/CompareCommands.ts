import { ApplicationCommandType } from 'discord.js';

export type Differences = [string, any, any][];

/** Compare two command objects. */
export function compareCommands(a: any, b: any, prefix = ''): Differences {
    if (!a || !b) return [`${prefix} missing`, a, b];

    const differences: Differences = [];

    if (typeof a !== typeof b) return [`${prefix}type`, a, b];

    if (a.type === ApplicationCommandType.ChatInput)
        differences.push(...compareChatInputs(a, b, prefix));
    else differences.push(...compareContextMenus(a, b, prefix));

    return differences;
}

/** Compare two context menu command objects. */
export function compareContextMenus(
    a: any,
    b: any,
    prefix = `${a.name || b.name} context menu command `
) {
    return compareBases(a, b, prefix);
}

/** Compare two chat input command objects. */
export function compareChatInputs(
    a: any,
    b: any,
    prefix = `${a.name || b.name} chat input command `
) {
    const differences = compareBases(a, b, prefix);

    // Compare description
    if (a.description !== b.description) differences.push([`${prefix}name`, a.name, b.name]);
    differences.push(
        ...compareLocalizations(
            a.descriptionLocalizations,
            b.descriptionLocalizations,
            `${prefix}description locales`
        )
    );

    // Compare options
    if ((a.options?.length ?? 0) !== (b.options?.length ?? 0))
        differences.push([`${prefix}options.length`, a.options?.length, b.options?.length]);
    if (b.options?.length > 0)
        for (let i = 0; i < b.options.length; i++)
            differences.push(
                ...compareOptions(b.options[i], a.options[i], `${prefix} option ${i} `)
            );

    return differences;
}

/** Compare the base of two command objects. */
export function compareBases(a: any, b: any, prefix = ''): Differences {
    const differences: Differences = [];

    // Compare name
    if (a.name !== b.name) differences.push([`${prefix}name`, a.name, b.name]);
    differences.push(
        ...compareLocalizations(a.nameLocalizations, b.nameLocalizations, `${prefix}name locales `)
    );

    // Compare dm permission
    if ((a.dmPermission ?? true) !== b.dmPermission)
        differences.push([`${prefix}dmPermission`, a.dmPermission, b.dmPermission]);

    // Compare default member permissions
    if (!a.defaultMemberPermissions.equals(b.defaultMemberPermissions))
        differences.push([
            `${prefix}defaultMemberPermissions`,
            a.defaultMemberPermissions,
            b.defaultMemberPermissions,
        ]);

    return differences;
}

/** Compare two chat input option objects. */
export function compareOptions(a: any, b: any, prefix = ''): Differences {
    if (!a || !b) return [[`${prefix}option missing`, a, b]];

    const differences: Differences = [];

    // Compare type
    if (a.type !== b.type) differences.push([`${prefix}type`, a.type, b.type]);

    // Compare name
    if (a.name !== b.name) differences.push([`${prefix}name`, a.name, b.name]);
    differences.push(
        ...compareLocalizations(a.nameLocalizations, b.nameLocalizations, `${prefix}name locales `)
    );

    // Compare description
    if (a.description !== b.description)
        differences.push([`${prefix}description`, a.description, b.description]);
    differences.push(
        ...compareLocalizations(
            a.descriptionLocalizations,
            b.descriptionLocalizations,
            `${prefix}description locales `
        )
    );

    // Compare required
    if (a.required !== b.required) differences.push([`${prefix}required`, a.required, b.required]);

    // Compare min and max values
    if ((a.minValue ?? 0) !== (b.minValue ?? 0))
        differences.push([`${prefix}minValue`, a.minValue, b.minValue]);
    if ((a.maxValue ?? Number.POSITIVE_INFINITY) !== (b.maxValue ?? Number.POSITIVE_INFINITY))
        differences.push([`${prefix}maxValue`, a.maxValue, b.maxValue]);

    // Compare autocomplete
    if (a.autocomplete !== b.autocomplete)
        differences.push([`${prefix}autocomplete`, a.autocomplete, b.autocomplete]);

    // Compare choices
    if ((a.choices?.length ?? 0) !== (b.choices?.length ?? 0))
        differences.push([`${prefix}choices.length`, a.choices?.length, b.choices?.length]);
    if (b.choices?.length > 0)
        for (let i = 0; i < b.choices.length; i++)
            differences.push(
                ...compareOptions(b.choices[i], a.choices[i], `${prefix}choices[${i}].`)
            );

    // Compare options
    if ((a.options?.length ?? 0) !== (b.options?.length ?? 0))
        differences.push([`${prefix}options.length`, a.options?.length, b.options?.length]);
    if (b.options?.length > 0)
        for (let i = 0; i < b.options.length; i++)
            differences.push(
                ...compareOptions(b.options[i], a.options[i], `${prefix}options[${i}] `)
            );

    return differences;
}

/** Compare two option choice objects. */
export function compareChoices(a: any, b: any, prefix = ''): Differences {
    if (!a || !b) return [[`${prefix}choice missing`, a, b]];

    const differences: Differences = [];

    // Compare name
    if (a.name !== b.name) differences.push([`${prefix}name`, a.name, b.name]);
    differences.push(
        ...compareLocalizations(a.nameLocalizations, b.nameLocalizations, `${prefix}name locales `)
    );

    // Compare value
    if (a.value !== b.value) differences.push([`${prefix}value`, a.value, b.value]);

    return differences;
}

export function compareLocalizations(a: any, b: any, prefix = ''): Differences {
    if (!a && !b) return [];
    if (!a || !b) return [[`${prefix}missing`, a, b]];

    const differences: Differences = [];

    // Compare locales
    const locales = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const locale of locales) {
        if (a[locale] !== b[locale]) differences.push([`${prefix}${locale}`, a[locale], b[locale]]);
    }

    return differences;
}
