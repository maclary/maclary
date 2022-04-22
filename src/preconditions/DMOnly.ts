import { Precondition, Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';

export class DMOnly extends Precondition {
    public override messageRun(message: Command.Message): Result {
        if (message.guildId === null) return this.ok();
        return this.error('You cannot run this command outside of DMs.');
    }

    public override chatInputRun(interaction: Command.ChatInput): Result {
        if (interaction.guildId === null) return this.ok();
        return this.error('You cannot run this command outside of DMs.');
    }

    public override contextMenuRun(interaction: Command.ContextMenu): Result {
        if (interaction.guildId === null) return this.ok();
        return this.error('You cannot run this command outside of DMs.');
    }
}
