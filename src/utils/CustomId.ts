import { SlashCommandAssertions } from '@discordjs/builders';

const CustomIdDivider = '🎗🎞🖼';

export class CustomId extends null {
    public static create(commandNames: [], options: Record<string, unknown> = {}): string {
        commandNames.some((c) => SlashCommandAssertions.validateName(c));

        const commandsString = JSON.stringify(commandNames);
        const optionsString = JSON.stringify(options);

        if (commandsString.includes(CustomIdDivider) || optionsString.includes(CustomIdDivider)) {
            throw new Error(`Custom ID cannot contain ${CustomIdDivider}`);
        }

        return `${commandsString}${CustomIdDivider}${optionsString}`;
    }

    public static parse(customId: string): [string[], Record<string, unknown>] {
        const [commandsString, optionsString] = customId.split(CustomIdDivider);
        return [JSON.parse(commandsString), JSON.parse(optionsString)];
    }
}
