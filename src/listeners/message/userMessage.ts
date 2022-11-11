import { type Message, PermissionsBitField } from 'discord.js';
import { Listener } from '#/structures/Listener';
import { Events } from '#/utilities/Events';

const requiredPermissions = new PermissionsBitField(['ViewChannel', 'SendMessages']).freeze();

export class OnUserMessage extends Listener<typeof Events.UserMessage> {
    public constructor() {
        super({ event: Events.UserMessage });
    }

    public override async run(message: Message<boolean>) {
        const canRun = await this._canRunInChannel(message);
        if (!canRun) return;

        const { client, maclary } = this.container;
        const mentionPrefix = this._getMentionPrefix(message);

        let prefix: RegExp | string | null = null;
        if (mentionPrefix) {
            if (message.content.length === mentionPrefix.length) {
                client.emit(Events.ClientMention, message);
                return;
            }

            prefix = mentionPrefix;
        } else if (maclary.options.regexPrefix?.test(message.content)) {
            prefix = maclary.options.regexPrefix;
        } else {
            const prefixes = (await maclary.options.fetchPrefix(message)) ?? null;
            const parsed = this._getPrefix(message.content, prefixes);
            if (parsed !== null) prefix = parsed;
        }

        if (prefix === null) client.emit(Events.NonPrefixedMessage, message);
        else client.emit(Events.PrefixedMessage, message, prefix);
    }

    private async _canRunInChannel(message: Message<boolean>) {
        if (!message.inGuild()) return true;

        const me = await message.guild.members.fetchMe();
        if (!me) return false;

        const permissions = message.channel.permissionsFor(me);
        return permissions.has(requiredPermissions);
    }

    private _getMentionPrefix(message: Message<boolean>) {
        if (this.container.maclary.options.disableMentionPrefix) return null;
        if (message.content.length < 20 || !message.content.startsWith('<@')) return null;

        const botId = message.client.user.id;
        const roleId = message.inGuild() && message.guild.roles.botRoleFor(message.client.user)?.id;

        const mentionPrefix = new RegExp(`^<@(?:!|&)?(${botId}|${roleId})>`);
        const match = message.content.match(mentionPrefix);
        if (!match) return null;

        return match[0];
    }

    private _getPrefix(content: string, prefixes: string[] | string | null) {
        if (prefixes === null) return null;

        const { caseInsensitivePrefixes } = this.container.maclary.options;
        if (caseInsensitivePrefixes) content = content.toLowerCase();

        function getStringPrefix(prefix: string) {
            if (caseInsensitivePrefixes) prefix = prefix.toLowerCase();
            return content.startsWith(prefix) ? prefix : null;
        }

        if (typeof prefixes === 'string') return getStringPrefix(prefixes);
        return prefixes.find(prefix => getStringPrefix(prefix) !== null) ?? null;
    }
}
