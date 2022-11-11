import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Precondition } from '#/structures/Precondition';

/**
 * Precondition that ensure that this is only used in DM channels.
 * @since 1.0.0
 */
export class DMOnly extends Precondition {
    public prefixRun = this._sharedRun;

    public slashRun = this._sharedRun;

    public contextMenuRun = this._sharedRun;

    public actionRun = this._sharedRun;

    private _sharedRun(parent: Action.AnyInteraction | Command.AnyInteraction | Command.Message) {
        if (!parent.inGuild()) return this.ok();
        return this.error('DMOnly');
    }
}
