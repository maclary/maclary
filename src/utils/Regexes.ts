// @ts-ignore Missing declaration file
import TwitterEmoji from 'twemoji-parser/dist/lib/regex.js';

/**
 * Regex that can capture any Discord Snowflake ID.
 * @raw `/^(?<id>\d{17,19})$/`
 * @remark Capture group 1 is the Snowflake ID, named `id`
 */
export const Snowflake = /^(?<id>\d{17,19})$/;

/**
 * Regex that matches any Discord channel mention.
 * @raw `/^<#(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the channel ID, named `id`
 */
export const ChannelMention = /^<#(?<id>\d{17,19})>$/;

/**
 * Regex that matches any Discord user mention.
 * @raw `/^<@(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the user ID, named `id`
 */
export const UserMention = /^<@(?<id>\d{17,19})>$/;

/**
 * Regex that matches any Discord role mention.
 * @raw `/^<@&(?<id>\d{17,19})>$/`
 * @remark Capture group 1 is the role ID, named `id`
 */
export const RoleMention = /^<@&(?<id>\d{17,19})>$/;

/**
 * Regex that matches any Twemoji.
 * @raw {@linkplain https://github.com/twitter/twemoji-parser/blob/master/src/lib/regex.js Twemoji}
 */
export const Twemoji = TwitterEmoji as RegExp;

/**
 * Regex that matches any custom Discord emoji.
 * @raw `/^(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?$/`
 * @remark Capture group 1 is whether the emoji is animated, named `animated`
 * @remark Capture group 2 is the emoji name, named `name`
 * @remark Capture group 3 is the emoji ID, named `id`
 */
export const CustomEmoji = /^(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?$/;

/**
 * Regex that matches any Discord guild invite link.
 * @raw `/^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i`
 * @remark Capture group 1 is the invite code, named `code`
 */
export const GuildInviteLink =
    /^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

/**
 * Regex that matches any Discord message link.
 * @raw `/^(?:https:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guildId>(?:\d{17,19}|@me))\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})$/`
 * @remark Capture group 1 is the guild ID, named `guildId`
 * @remark Capture group 2 is the channel ID, named `channelId`
 * @remark Capture group 3 is the message ID, named `messageId`
 */
export const MessageLink =
    /^(?:https:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(?<guildId>(?:\d{17,19}|@me))\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})$/;
