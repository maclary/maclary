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
    public onButton(_: Component.Button): void {
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onButton');
    }

    /**
     * When a select menu interaction is received with this components ID.
     * @param menu The modal submit interaction
     */
    public onSelectMenu(_: Component.SelectMenu): void {
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onSelectMenu');
    }

    /**
     * When a modal submit interaction is received with this components ID.
     * @param modal The modal submit interaction
     */
    public onModalSubmit(_: Component.ModalSubmit): void {
        throw new Error('COMPONENT_MISSING_METHOD', this.id, 'onModalSubmit');
    }
}

export namespace Component {
    export type Button = Discord.ButtonInteraction;
    export type SelectMenu = Discord.SelectMenuInteraction;
    export type ModalSubmit = Discord.ModalSubmitInteraction;
}
