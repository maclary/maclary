import type { InteractionReplyOptions, MessagePayload, ReplyMessageOptions } from 'discord.js';

/**
 * When a ReplyError is thrown anywhere within a command,
 * it will be caught and send to the user.
 */
export class ReplyError extends Error {
    public options: InteractionReplyOptions | ReplyMessageOptions | MessagePayload | string;

    public override readonly name = 'ReplyError';

    public constructor(
        options: InteractionReplyOptions | ReplyMessageOptions | MessagePayload | string,
    ) {
        super((typeof options === 'string' ? options : Reflect.get(options, 'content')) as string);
        this.options = options;
    }
}
