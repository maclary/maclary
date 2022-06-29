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
        void button;
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onButton');
    }

    /**
     * When a select menu interaction is received with this components ID.
     * @param menu The modal submit interaction
     */
    public onSelectMenu(menu: Component.SelectMenu): void {
        void menu;
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onSelectMenu');
    }

    /**
     * When a modal submit interaction is received with this components ID.
     * @param modal The modal submit interaction
     */
    public onModalSubmit(modal: Component.ModalSubmit | Component.MessageModalSubmit): void {
        void modal;
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onModalSubmit');
    }

    /**
     * When an autocomplete interaction is received with this components ID.
     * @param autocomplete The autocomplete interaction
     */
    public onAutocomplete(autocomplete: Component.Autocomplete): void {
        void autocomplete;
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onAutocomplete');
    }
}

export namespace Component {
    export type Button = Discord.ButtonInteraction;
    export type SelectMenu = Discord.SelectMenuInteraction;
    export type ModalSubmit = Discord.ModalSubmitInteraction;
    export type MessageModalSubmit = Discord.ModalMessageModalSubmitInteraction;
    export type Autocomplete = Discord.AutocompleteInteraction;
}
