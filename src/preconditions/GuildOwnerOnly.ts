import { Precondition, type Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';
import { container } from '../container';

export class GuildOwnerOnly extends Precondition {
    public override messageRun(message: Command.Message): Promise<Result> {
        return this.sharedRun(message.guildId, message.author.id);
    }

    public override chatInputRun(interaction: Command.ChatInput): Promise<Result> {
        return this.sharedRun(interaction.guildId, interaction.user.id);
    }

    public override contextMenuRun(interaction: Command.ContextMenu): Promise<Result> {
        return this.sharedRun(interaction.guildId, interaction.user.id);
    }

    private async sharedRun(guildId: string | null, userId: string): Promise<Result> {
        if (!guildId) return this.error('You cannot use this command in DMs.');
        const guild = await container.client.guilds.fetch(guildId);
        if (!guild) return this.error('Unable to determine the server owner.');

        if (guild.ownerId === userId) return this.ok();
        return this.error('This command is limited to the server owner!');
    }
}
