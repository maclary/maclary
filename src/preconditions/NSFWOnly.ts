import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Precondition } from '#/structures/Precondition';

/**
 * Precondition that ensures that this is only used in NSFW channels.
 * @since 1.0.0
 */
export class NSFWOnly extends Precondition {
    public prefixRun = this._sharedRun;

    public slashRun = this._sharedRun;

    public contextMenuRun = this._sharedRun;

    public actionRun = this._sharedRun;

    private async _sharedRun(
        parent: Action.AnyInteraction | Command.AnyInteraction | Command.Message
    ) {
        if (parent.channelId !== null) {
            const channel = await parent.client.channels.fetch(parent.channelId);
            if (channel && Reflect.get(channel, 'nsfw')) return this.ok();
        }

        return this.error('NSFWOnly');
    }
}
