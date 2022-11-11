import type { Snowflake } from 'discord.js';
import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Precondition } from '#/structures/Precondition';

/**
 * Precondition that ensures that the user is the owner of the guild this is used in.
 * @since 1.0.0
 */
export class GuildOwnerOnly extends Precondition {
    public async prefixRun(message: Command.Message) {
        return this._sharedRun(message.author.id, message.guildId);
    }

    public slashRun = this._interactionRun;

    public contextMenuRun = this._interactionRun;

    public actionRun = this._interactionRun;

    private async _interactionRun(interaction: Action.AnyInteraction | Command.AnyInteraction) {
        return this._sharedRun(interaction.user.id, interaction.guildId);
    }

    private async _sharedRun(userId: Snowflake, guildId: Snowflake | null) {
        if (!guildId) return this.error('GuildOnly');
        const guild = await this.container.client.guilds.fetch(guildId);
        if (!guild) return this.error('GuildOnly');

        if (guild.ownerId === userId) return this.ok();
        return this.error('GuildOwnerOnly');
    }
}
