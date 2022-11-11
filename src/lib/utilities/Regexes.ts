/**
 * Regex that matches prefixes.
 * @raw `/^([$-/:-?{-~!"^_`\[\]\w]{1,10})$/`
 * @remark Capture group 1 is the prefix, named `prefix`.
 * @since 1.0.0
 */
export const Prefix = /^(?<prefix>[\w!"$-/:-?[\]^`{-~]{1,10})$/;

/**
 * Regex that can capture any Discord Snowflake ID.
 * @raw `/^(?<id>\d{17,19})$/`
 * @remark Capture group 1 is the Snowflake ID, named `id`.
 * @since 1.0.0
 */
export const Snowflake = /^(?<id>\d{17,19})$/;

/**
 * Regex that matches any Discord channel mention.
 * @raw `/^<#(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the channel ID, named `id`.
 * @since 1.0.0
 */
export const ChannelMention = /^<#(?<id>\d{17,19})>$/;

/**
 * Regex that matches any Discord user mention.
 * @raw `/^<@(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the user ID, named `id`.
 * @since 1.0.0
 */
export const UserMention = /^<@(?<id>\d{17,19})>$/;

/**
 * Regex that matches any Discord role mention.
 * @raw `/^<@&(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the role ID, named `id`.
 * @since 1.0.0
 */
export const RoleMention = /^<@&(?<id>\d{17,19})>$/;

/**
 * Regex that matches any custom Discord emoji.
 * @raw `/^(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?$/`
 * @remark Capture group 1 is whether the emoji is animated, named `animated`.
 * @remark Capture group 2 is the emoji name, named `name`.
 * @remark Capture group 3 is the emoji ID, named `id`.
 * @since 1.0.0
 */
export const CustomEmoji = /^(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?$/;

/**
 * Regex that matches any Discord guild invite link.
 * @raw `/^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i`
 * @remark Capture group 1 is the invite code, named `code`.
 * @since 1.0.0
 */
export const GuildInviteLink =
    /^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)?(?<code>[\w-]{2,})$/i;

/**
 * Regex that matches any Discord message link.
 * @raw `/^(?:https:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guildId>(?:\d{17,19}|@me))\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})$/`
 * @remark Capture group 1 is the guild ID, named `guildId`.
 * @remark Capture group 2 is the channel ID, named `channelId`.
 * @remark Capture group 3 is the message ID, named `messageId`.
 * @since 1.0.0
 */
export const MessageLink =
    /^(?:https:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guildId>(?:\d{17,19}|@me))\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})$/;

/**
 * Regex that matches any Discord context menu command name.
 * @raw `/^[\w -]{3,32}$/`
 * @remark Capture group 1 is the name.
 * @since 1.0.0
 */
export const ContextMenuCommandName = /^(?<name>[\w -]{3,32})$/;

/**
 * Regex that matches any Discord chat input name.
 * @raw `/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u`
 * @remark Capture group 1 is the name.
 * @since 1.0.0
 */
export const ChatInputCommandName = /^(?<name>[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$)/u;

/**
 * Combine a list of string and regexes into a single regex.
 * @param list Array of strings and regexes.
 * @since 1.0.0
 */
export function combineRegexes(list: ((RegExp | string)[] | RegExp | string | undefined)[]) {
    const filteredList = list
        .flat()
        .filter((e, i, s): e is RegExp | string => Boolean(e) && s.indexOf(e) === i);
    const stringChunk = filteredList
        .filter((e): e is string => typeof e === 'string')
        .map(e => e.replace(/(?<an>[^\dA-Za-z])/g, '\\$1'));
    const regexChunk = filteredList
        .filter((e): e is RegExp => e instanceof RegExp)
        .map(e => e.source);
    return [...stringChunk, ...regexChunk] //
        .sort((a, b) => b.length - a.length)
        .join('|');
}
