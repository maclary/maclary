import { Events as DJSEvents } from 'discord.js';

export const Events = {
    ...DJSEvents,

    /**
     * Emitted when an interaction is received that doesn't have a handler.
     * @type {'unknownInteraction'}
     * @param {Interaction} interaction The interaction that wasn't handled.
     */
    UnknownInteraction: 'unknownInteraction',

    /**
     * Emitted when a message contains only the client as a mention.
     * @param {Message} message The message that was sent.
     */
    ClientMention: 'clientMention',

    /**
     * Emitted when debug.
     * @param {string} message The debug message.
     */
    MaclaryDebug: 'maclaryDebug',
};
