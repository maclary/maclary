import { Precondition, Result } from '../structures/Precondition';
import type { Command } from '../structures/Command';
import {
    PermissionsBitField,
    PermissionResolvable,
    BaseGuildTextChannel,
    GuildTextBasedChannel,
} from 'discord.js';

const dmChannelPermissions = new PermissionsBitField(
    new PermissionsBitField([
        'AddReactions',
        'AttachFiles',
        'EmbedLinks',
        'ReadMessageHistory',
        'SendMessages',
        'UseExternalEmojis',
        'ViewChannel',
    ]).bitfield & PermissionsBitField.All,
);

export function ClientPermissions(permissions: PermissionResolvable): typeof Precondition {
    const required = new PermissionsBitField(permissions);

    return class ClientPrecondition extends Precondition {
        public override messageRun(message: Command.Message): Result {
            const channel = message.channel as BaseGuildTextChannel;
            const userId = message.client?.application?.id;
            if (!userId) return this.error('I was unable to determine my own permissions.');
            const permissions = message.guildId
                ? channel.permissionsFor(userId)
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public override async chatInputRun(interaction: Command.ChatInput): Promise<Result> {
            const channel = await this.fetchChannelFromId(interaction.channelId);
            const permissions = interaction.inGuild()
                ? channel.permissionsFor(interaction.applicationId)
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public override async contextMenuRun(interaction: Command.ContextMenu): Promise<Result> {
            const channel = await this.fetchChannelFromId(interaction.channelId);
            const permissions = interaction.inGuild()
                ? channel.permissionsFor(interaction.applicationId)
                : dmChannelPermissions;
            return this.sharedRun(permissions);
        }

        public sharedRun(permissions: PermissionsBitField | null): Result {
            if (!permissions) return this.error('I was unable to determind my own permissions.');

            const missing = permissions.missing(required);
            if (missing.length < 1) return this.ok();
            return this.error(
                'I require, yet am missing, the following permissions ' +
                    `to run this command: ${missing.join(', ')}`,
            );
        }

        private async fetchChannelFromId(channelId: string): Promise<GuildTextBasedChannel> {
            return (await this.container.client.channels.fetch(channelId)) as GuildTextBasedChannel;
        }
    };
}
