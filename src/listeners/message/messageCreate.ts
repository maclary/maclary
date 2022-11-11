import type { Message } from 'discord.js';
import { Listener } from '#/structures/Listener';
import { Events } from '#/utilities/Events';

export class OnMessageCreate extends Listener<typeof Events.MessageCreate> {
    public constructor() {
        super({ event: Events.MessageCreate });
    }

    public override run(message: Message<boolean>) {
        if (!message.client.isReady()) return;

        if (message.author.bot || message.system || message.webhookId) return;

        this.container.client.emit(Events.UserMessage, message);
    }
}
