import type { Message } from 'discord.js';
import { Lexer, Parser, longShortStrategy } from 'lexure';
import { Arguments } from '#/structures/Arguments';
import { Listener } from '#/structures/Listener';
import { Events } from '#/utilities/Events';

const lexer = new Lexer();
const strategy = longShortStrategy();
lexer.setQuotes([
    ['"', '"'],
    ['“', '”'],
    ['「', '」'],
    ['«', '»'],
]);

export class OnPrefixedMessage extends Listener<typeof Events.PrefixedMessage> {
    public constructor() {
        super({ event: Events.PrefixedMessage });
    }

    public override async run(message: Message<boolean>, prefix: RegExp | string) {
        const { client, maclary } = this.container;

        const commandPrefix = this._getCommandPrefix(message.content, prefix);
        const prefixLess = message.content.slice(commandPrefix.length).trim();

        const spaceIndex = prefixLess.indexOf(' ');
        const commandName = spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
        if (commandName.length === 0) return;

        const command = maclary.commands.resolve(commandName);
        if (!command) {
            client.emit(Events.UnknownPrefixCommand, message, commandName);
            return;
        }

        lexer.setInput(prefixLess);
        const tokens = lexer.lexCommand(() => 0)?.[1]() ?? [];
        const parser = new Parser(tokens).setUnorderedStrategy(strategy);
        const args = new Arguments(parser.parse());

        const payload = { from: message, command, args };

        try {
            await command._handlePrefix(message, args);
            client.emit(Events.CommandSuccess, payload);
        } catch (error) {
            let typedError = error as Error;
            if (!(error instanceof Error)) typedError = new Error(String(error));
            client.emit(Events.CommandError, payload, typedError);
        }
    }

    private _getCommandPrefix(content: string, prefix: RegExp | string) {
        return typeof prefix === 'string' ? prefix : (prefix.exec(content)?.[0] as string);
    }
}
