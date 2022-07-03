import { Precondition, Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';
import { PermissionsBitField, PermissionResolvable, TextChannel, NewsChannel } from 'discord.js';

const dmChannelPermissions = new PermissionsBitField(
    new PermissionsBitField([
        'AddReactions',
        'AttachFiles',
        'EmbedLinks',
        'ReadMessageHistory',
        'SendMessages',
        'UseExternalEmojis',
        'ViewChannel',
        'UseExternalStickers',
        'MentionEveryone',
    ]).bitfield & PermissionsBitField.All,
);

export function UserPermissions(permissions: PermissionResolvable): typeof Precondition {
    const required = new PermissionsBitField(permissions);

    return class UserPermissions extends Precondition {
        public override messageRun(message: Command.Message): Result {
            const channel = message.channel as TextChannel | NewsChannel;
            const permissions = message.guild
                ? channel.permissionsFor(message.author)
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public override chatInputRun(interaction: Command.ChatInput): Result {
            const permissions = interaction.inGuild()
                ? interaction.memberPermissions
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public override contextMenuRun(
            interaction: Command.MessageContextMenu | Command.UserContextMenu,
        ): Result {
            const permissions = interaction.inGuild()
                ? interaction.memberPermissions
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public sharedRun(permissions: PermissionsBitField | null): Result {
            if (!permissions) return this.error('I was unable to determind your permissions.');

            const missing = permissions.missing(required);
            if (missing.length < 1) return this.ok();
            return this.error(
                'You are missing the following permissions ' +
                    `to run this command: ${missing.join(', ')}`,
            );
        }
    };
}

/*
import {
    BaseGuildTextChannel,
    CommandInteraction,
    ContextMenuInteraction,
    GuildTextBasedChannel,
    Message,
    Permissions,
    PermissionString
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition, PreconditionContext } from '../lib/structures/Precondition';

export interface PermissionPreconditionContext extends PreconditionContext {
    permissions?: Permissions;
}

export class CorePrecondition extends AllFlowsPrecondition {
    private readonly dmChannelPermissions = new Permissions(
        ~new Permissions([
            //
            'ADD_REACTIONS',
            'ATTACH_FILES',
            'EMBED_LINKS',
            'READ_MESSAGE_HISTORY',
            'SEND_MESSAGES',
            'USE_EXTERNAL_EMOJIS',
            'VIEW_CHANNEL'
        ]).bitfield & Permissions.ALL
    ).freeze();

    public messageRun(message: Message, _: Command, context: PermissionPreconditionContext) {
        const required = context.permissions ?? new Permissions();
        const channel = message.channel as BaseGuildTextChannel;

        if (!message.client.id) {
            return this.error({
                identifier: Identifiers.PreconditionClientPermissionsNoClient,
                message: 'There was no client to validate the permissions for.'
            });
        }

        const permissions = message.guild ? channel.permissionsFor(message.client.id) : this.dmChannelPermissions;

        return this.sharedRun(required, permissions, 'message');
    }

    public async chatInputRun(interaction: CommandInteraction, _: Command, context: PermissionPreconditionContext) {
        const required = context.permissions ?? new Permissions();

        const channel = (await this.fetchChannelFromInteraction(interaction)) as GuildTextBasedChannel;

        const permissions = interaction.inGuild() ? channel.permissionsFor(interaction.applicationId) : this.dmChannelPermissions;

        return this.sharedRun(required, permissions, 'chat input');
    }

    public async contextMenuRun(interaction: ContextMenuInteraction, _: Command, context: PermissionPreconditionContext) {
        const required = context.permissions ?? new Permissions();
        const channel = (await this.fetchChannelFromInteraction(interaction)) as GuildTextBasedChannel;

        const permissions = interaction.inGuild() ? channel.permissionsFor(interaction.applicationId) : this.dmChannelPermissions;

        return this.sharedRun(required, permissions, 'context menu');
    }

    private sharedRun(requiredPermissions: Permissions, availablePermissions: Permissions | null, commandType: string) {
        if (!availablePermissions) {
            return this.error({
                identifier: Identifiers.PreconditionClientPermissionsNoPermissions,
                message: `I was unable to resolve my permissions in the ${commandType} command invocation channel.`
            });
        }

        const missing = availablePermissions.missing(requiredPermissions);
        return missing.length === 0
            ? this.ok()
            : this.error({
                    identifier: Identifiers.PreconditionClientPermissions,
                    message: `I am missing the following permissions to run this command: ${missing
                        .map((perm) => CorePrecondition.readablePermissions[perm])
                        .join(', ')}`,
                    context: { missing }
              });
    }
*/
