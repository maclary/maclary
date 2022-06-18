import { container } from '../../container';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';
import { Command } from '../../structures/Command';
import { Args } from '../../structures/Args';
import { ReplyError } from '../../errors/ReplyError';

import * as Lexure from 'lexure';
import type { Message, ReplyMessageOptions } from 'discord.js';

const lexer = new Lexure.Lexer();
lexer.setQuotes([
    ['"', '"'],
    ['“', '”'],
    ['「', '」'],
    ['«', '»'],
]);

export default class OnMessageCreate extends Event {
    public constructor() {
        super({
            name: Events.MessageCreate,
            emitter: container.client,
            once: false,
        });
    }

    public override async handle(message: Message): Promise<void> {
        const { client } = container;

        // Basic checks that throw away this function
        if (message.author.bot || message.system) return;
        if (!client.isReady()) return;

        const MentionRegex = new RegExp(`^<@!?${client.user.id}>$`, 'g');
        if (message.content.match(MentionRegex)) client.emit(Events.ClientMention, message);

        // Format all prefixes for regex
        const prefixes = [
            [client.options.defaultPrefix].flat().map((p) => p.replace(/([^a-zA-Z0-9])/g, '\\$1')),
            MentionRegex.source.slice(1, -1) + ' ?',
        ].flat();

        // Verify the message starts with one of the prefixes
        const PrefixRegex = new RegExp(`^(${prefixes.join('|')})`, 'g');
        const prefixArray = message.content.match(PrefixRegex);
        if (!prefixArray) return;
        const prefix = prefixArray[0].trim();

        // Parse the command name and args
        lexer.setInput(message.content);
        const lexOut = lexer.lexCommand((s) => (s.startsWith(prefix) ? prefix.length : null));
        if (!lexOut) return;
        const [commandName, commandTokens] = [lexOut[0].value, lexOut[1]()];

        // Find the command
        const fn = (c: Command) => [c.name, ...c.aliases].includes(commandName);
        const command = client.commands.cache.find(fn);
        if (!command) return;
        if (!command.kinds.includes(Command.Kind.Prefix)) return;

        // Run the preconditions
        const preOut = await command.preconditions.messageRun(message, command);
        if (preOut.error !== undefined && !preOut.success) {
            await message.reply(preOut.error.options as ReplyMessageOptions | string);
            return void 0;
        }

        // Parse the command args into a Lexure Args object
        const parser = new Lexure.Parser(commandTokens).setUnorderedStrategy(
            Lexure.longShortStrategy(),
        );
        const commandArgs = new Args(parser.parse());

        await command.onMessage(message, commandArgs).catch((err) => {
            if (err instanceof ReplyError) {
                void message.reply(err.options as ReplyMessageOptions | string);
            } else {
                void message.reply(`An unknown error occurred while running this command.`);
            }
        });
    }
}
