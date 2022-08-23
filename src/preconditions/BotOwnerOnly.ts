import { Precondition, type Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';
import { User, Team } from 'discord.js';

export class BotOwnerOnly extends Precondition {
    public override messageRun(message: Command.Message): Result {
        return this.sharedRun(message.author.id);
    }

    public override chatInputRun(interaction: Command.ChatInput): Result {
        return this.sharedRun(interaction.user.id);
    }

    public override contextMenuRun(
        interaction: Command.MessageContextMenu | Command.UserContextMenu,
    ): Result {
        return this.sharedRun(interaction.user.id);
    }

    private sharedRun(userId: string): Result {
        const owner = this.container.client.application?.owner;
        if (!owner) return this.error('Failed to determine the bot owner!');

        let ownerIds: string[] = [];
        if (owner instanceof Team) ownerIds = Array.from(owner.members.keys());
        else if (owner instanceof User) ownerIds = [owner.id];

        if (ownerIds.includes(userId)) return this.ok();
        return this.error('This command is limited to the bot owner!');
    }
}
