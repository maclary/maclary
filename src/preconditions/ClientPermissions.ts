import type { PermissionResolvable, Snowflake } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { container } from '#/container';
import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Precondition } from '#/structures/Precondition';

const dmChannelPermissions = new PermissionsBitField([
    'SendMessages',
    // 'PinMessages',
    'EmbedLinks',
    'AttachFiles',
    'ReadMessageHistory',
    'MentionEveryone',
    'UseExternalEmojis',
    'UseExternalStickers',
    'AddReactions',
]);

/**
 * Precondition that ensures that the client has the required permissions.
 * @param permissions The permissions that the client needs to have.
 */
export function ClientPermissions(permissions: PermissionResolvable) {
    const required = new PermissionsBitField(permissions);

    async function sharedRun(
        parent: Action.AnyInteraction | Command.AnyInteraction | Command.Message
    ) {
        const permissions = await permissionsIn(parent.channelId);
        return checkPermissions(required, permissions);
    }

    return class ClientPermissions extends Precondition {
        public prefixRun = sharedRun;

        public slashRun = sharedRun;

        public contextMenuRun = sharedRun;

        public actionRun = sharedRun;
    };
}

async function permissionsIn(channelId: Snowflake | null) {
    if (!channelId) return dmChannelPermissions;

    const channel = await container.client.channels.fetch(channelId);
    if (!channel || channel.isDMBased()) return dmChannelPermissions;

    const clientId = container.client.user.id;
    return channel.permissionsFor(clientId);
}

async function checkPermissions(
    required: PermissionsBitField,
    permissions: PermissionsBitField | null
) {
    if (!permissions) return Precondition.Result.error('CouldNotDetermineClientPermissions');

    const missing = permissions.missing(required);
    if (missing.length === 0) return Precondition.Result.ok();

    const missingField = new PermissionsBitField(missing);
    return Precondition.Result.error('ClientPermissions', missingField);
}
