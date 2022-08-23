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
