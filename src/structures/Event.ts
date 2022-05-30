import { Base } from './Base';
import { Error } from '../errors';

import Joi from 'joi';
import { EventEmitter } from 'node:events';

export interface EventOptions {
    /**
     * The name of the event.
     */
    name: string;

    /**
     * The event emitter to listen for this event on.
     */
    emitter: EventEmitter;

    /**
     * Whether ot not this handler will be unloaded after it has been called.
     * @default false
     */
    once?: boolean;
}

/**
 * All events must extend this class and implement its abstract methods.
 */
export abstract class Event extends Base {
    /**
     * The name of the event.
     */
    public name: string;

    /**
     * The event emitter to listen for this event on.
     */
    public emitter: EventEmitter;

    /**
     * Whether ot not this handler will be unloaded after it has been called.
     * @default false
     */
    public once: boolean;

    public constructor(options: EventOptions) {
        super();

        const schema = Joi.object({
            name: Joi.string().required(),
            emitter: Joi.object().instance(EventEmitter).required(),
            once: Joi.boolean().default(false),
        });

        const { error, value } = schema.validate(options);
        if (error !== undefined) throw error;

        this.name = value.name;
        this.emitter = value.emitter;
        this.once = value.once;
    }

    /**
     * The handler for the event.
     * @abstract
     */
    public handle(..._: any[]): unknown | Promise<unknown> {
        throw new Error('EVENT_MISSING_METHOD', this.name, 'handle');
    }
}
