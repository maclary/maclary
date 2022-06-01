import Joi from 'joi';
import type * as Discord from 'discord.js';
import { Base } from './Base';
import { Error } from '../errors';

export interface ComponentOptions {
    /**
     * The custom ID of the component.
     */
    id: string;
}

export class Component extends Base {
    /**
     * The custom ID of the component.
     */
    public id: string;

    public constructor(options: ComponentOptions) {
        super();

        const schema = Joi.object({
            id: Joi.string().max(100).required(),
        });

        const { error, value } = schema.validate(options);
        if (error !== undefined) throw error;

        this.id = value.id;
    }

    /**
     * When a button interaction is received with this components ID.
     * @param button The button interaction
     * @abstract
     */
    public onButton(button: Component.Button): void {
        return void setTimeout(async () => {
            // If the button has not been replied to, reply with an error
            if (button.deferred || button.replied) return;
            await button.reply({
                content: `Action ${this.id} has not implemented its button handler.`,
                ephemeral: true,
            });
            throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onButton');
        }, 2500);
        // TODO: Make the timeout configurable
    }

    /**
     * When a select menu interaction is received with this components ID.
     * @param menu The modal submit interaction
     */
    public onSelectMenu(menu: Component.SelectMenu): void {
        return void setTimeout(async () => {
            if (menu.deferred || menu.replied) return;
            await menu.reply({
                content: `Action ${this.id} has not implemented its menu handler.`,
                ephemeral: true,
            });
            throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onSelectMenu');
        }, 2500);
    }

    /**
     * When a modal submit interaction is received with this components ID.
     * @param modal The modal submit interaction
     */
    public onModalSubmit(modal: Component.ModalSubmit): void {
        return void setTimeout(async () => {
            if (modal.deferred || modal.replied) return;
            await modal.reply({
                content: `Action ${this.id} has not implemented its modal handler.`,
                ephemeral: true,
            });
            throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onModalSubmit');
        }, 2500);
    }
}

export namespace Component {
    export type Button = Discord.ButtonInteraction;
    export type SelectMenu = Discord.SelectMenuInteraction;
    export type ModalSubmit = Discord.ModalSubmitInteraction;
}
