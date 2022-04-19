import { DMChannel } from 'discord.js';
import { Precondition, Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';

export class NSFW extends Precondition {
    public override messageRun(message: Command.Message): Result {
        if (message.channel instanceof DMChannel) return this.ok();
        if (Reflect.get(message.channel, 'nsfw') === true) return this.ok();
        return this.error('You cannot run this message command outside of NSFW channels.');
    }

    public override chatInputRun(interaction: Command.ChatInput): Result {
        if (interaction.channel instanceof DMChannel) return this.ok();
        if (Reflect.get(interaction.channel || {}, 'nsfw') === true) return this.ok();
        return this.error('You cannot run this chat input command outside of NSFW channels.');
    }

    public override contextMenuRun(
        interaction: Command.UserContextMenu | Command.MessageContextMenu,
    ): Result {
        if (interaction.channel instanceof DMChannel) return this.ok();
        if (Reflect.get(interaction.channel || {}, 'nsfw') === true) return this.ok();
        return this.error('You cannot run this context menu command outside of NSFW channels.');
    }
}
