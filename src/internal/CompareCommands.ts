/* eslint no-negated-condition: "off" */

import { Command } from '../structures/Command';

function compareContextMenus(external: any, local: any): [string, any, any][] {
    const differences: [string, any, any][] = [];

    // Base properties
    if (external.name !== local.name) differences.push(['name', external.name, local.name]);
    if (external.description !== local.description)
        differences.push(['description', external.description, local.description]);

    return differences;
}

function compareChatInputs(external: any, local: any, prefix = ''): [string, any, any][] {
    const differences: [string, any, any][] = [];

    // Base properties
    if (external.name !== local.name)
        differences.push([`${prefix}name`, external.name, local.name]);
    if (external.description !== local.description)
        differences.push([`${prefix}description`, external.description, local.description]);

    // Options
    if ((external.options?.length ?? 0) !== (local.options?.length ?? 0)) {
        differences.push([
            `${prefix}options length`,
            external.options?.length ?? 0,
            local.options.length,
        ]);
    } else if (local.options.length > 0) {
        const externalOptions = external.options.sort((a: any, b: any) =>
            a.name.localeCompare(b.name),
        );
        const localOptions = local.options.sort((a: any, b: any) => a.name.localeCompare(b.name));

        for (let i = 0; i < externalOptions.length; i++) {
            const [externalOption, localOption] = [externalOptions[i], localOptions[i]];
            const differencesInOption = compareChatInputOptions(
                externalOption,
                localOption,
                `${prefix}${localOption.name}`,
            );
            differences.push(...differencesInOption);
        }
    }

    return differences;
}

function compareChatInputOptions(external: any, local: any, prefix = ''): [string, any, any][] {
    const differences: [string, any, any][] = [];

    // Base properties
    if (external.type !== local.type)
        differences.push([`${prefix}type`, external.type, local.type]);
    if (external.name !== local.name)
        differences.push([`${prefix}name`, external.name, local.name]);
    if (external.description !== local.description)
        differences.push([`${prefix}description`, external.description, local.description]);
    if (external.required !== local.required)
        differences.push([`${prefix}required`, external.required, local.required]);

    // Option type properties
    if (external.minValue !== local.minValue)
        differences.push([`${prefix}minValue`, external.minValue, local.minValue]);
    if (external.maxValue !== local.maxValue)
        differences.push([`${prefix}maxValue`, external.maxValue, local.maxValue]);

    if (external.autocomplete !== local.autocomplete)
        differences.push([`${prefix}autocomplete`, external.autocomplete, local.autocomplete]);
    if ((external.channelTypes?.length ?? 0) !== (local.channelTypes?.length ?? 0))
        differences.push([
            `${prefix}channelTypes length`,
            external.channelTypes?.length ?? 0,
            local.channelTypes?.length ?? 0,
        ]);
    if (local.channelTypes?.length > 0) {
        const externalChannelTypes = external.channelTypes.sort();
        const localChannelTypes = local.channelTypes.sort();
        for (let i = 0; i < externalChannelTypes.length; i++) {
            const [externalChannelType, localChannelType] = [
                externalChannelTypes[i],
                localChannelTypes[i],
            ];
            if (externalChannelType !== localChannelType)
                differences.push([`${prefix}channelType`, externalChannelType, localChannelType]);
        }
    }

    // Subcommand group
    if ([external.type, local.type].includes(Command.OptionType.SubcommandGroup)) {
        if ((external.options?.length ?? 0) !== (local.options?.length ?? 0)) {
            differences.push([
                `${prefix}options length`,
                external.options?.length ?? 0,
                local.options.length,
            ]);
        } else if (local.options.length > 0) {
            const externalOptions = external.options.sort((a: any, b: any) =>
                a.name.localeCompare(b.name),
            );
            const localOptions = local.options.sort((a: any, b: any) =>
                a.name.localeCompare(b.name),
            );

            for (let i = 0; i < externalOptions.length; i++) {
                const [externalOption, localOption] = [externalOptions[i], localOptions[i]];
                const differencesInOption = compareChatInputs(
                    externalOption,
                    localOption,
                    `${prefix}${localOption.name}`,
                );
                differences.push(...differencesInOption);
            }
        }
    }

    // Option choices
    if ((external.choices?.length ?? 0) !== (local.choices?.length ?? 0)) {
        differences.push([
            `${prefix}choices length`,
            external.choices?.length ?? 0,
            local.choices?.length ?? 0,
        ]);
    } else if (local.choices?.length > 0) {
        const externalChoices = external.choices.sort((a: any, b: any) =>
            a.name.localeCompare(b.name),
        );
        const localChoices = local.choices.sort((a: any, b: any) => a.name.localeCompare(b.name));

        for (let i = 0; i < externalChoices.length; i++) {
            const [externalChoice, localChoice] = [externalChoices[i], localChoices[i]];
            const differencesInChoice = compareChatInputOptionChoices(
                externalChoice,
                localChoice,
                `${prefix}${localChoice.name}`,
            );
            differences.push(...differencesInChoice);
        }
    }

    return differences;
}

function compareChatInputOptionChoices(old: any, now: any, prefix = ''): [string, any, any][] {
    const differences: [string, any, any][] = [];
    if (old.name !== now.name)
        differences.push([`${prefix}option choice name`, old.name, now.name]);
    if (old.value !== now.value)
        differences.push([`${prefix}option choice value`, old.value, now.value]);
    return differences;
}

export function compareCommands(external: any, local: any): [string, any, any][] {
    if (external.type === Command.Type.ChatInput) {
        return compareChatInputs(external, local);
    }
    return compareContextMenus(external, local);
}
