import { Precondition, Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';

export class GuildOnly extends Precondition {
    public override messageRun(message: Command.Message): Result {
        if (message.guildId !== null) return this.ok();
        return this.error('You cannot run this command in DMs.');
    }

    public override chatInputRun(interaction: Command.ChatInput): Result {
        if (interaction.guildId !== null) return this.ok();
        return this.error('You cannot run this command in DMs.');
    }

    public override contextMenuRun(
        interaction: Command.MessageContextMenu | Command.UserContextMenu,
    ): Result {
        if (interaction.guildId !== null) return this.ok();
        return this.error('You cannot run this command in DMs.');
    }
}
