import type { Snowflake } from 'discord.js';
import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Precondition } from '#/structures/Precondition';

/**
 * Precondition that ensures that the user of this is the bot owner.
 * @since 1.0.0
 */
export class BotOwnerOnly extends Precondition {
    public prefixRun(message: Command.Message) {
        return this._sharedRun(message.author.id);
    }

    public slashRun = this._interactionRun;

    public contextMenuRun = this._interactionRun;

    public actionRun = this._interactionRun;

    private _interactionRun(interaction: Action.AnyInteraction | Command.AnyInteraction) {
        return this._sharedRun(interaction.user.id);
    }

    private _sharedRun(userId: Snowflake) {
        const owner = this.container.client.application.owner;

        if (owner !== null) {
            if ('members' in owner) {
                const ownerIds = Array.from(owner.members.keys());
                if (ownerIds.includes(userId)) return this.ok();
            } else if ('id' in owner && owner.id === userId) return this.ok();
        }

        return this.error('BotOwnerOnly');
    }
}
