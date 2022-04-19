import { Base } from './Base';
import { Error } from '../errors';

import { EventEmitter } from 'node:events';
import { z } from 'zod';

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

        const parsed = z
            .object({
                name: z.string(),
                emitter: z.instanceof(EventEmitter),
                once: z.boolean().default(false),
            })
            .parse(options);

        this.name = parsed.name;
        this.emitter = parsed.emitter;
        this.once = parsed.once;
    }

    /**
     * The handler for the event.
     * @abstract
     */
    public handle(..._: any[]): unknown | Promise<unknown> {
        throw new Error('EVENT_MISSING_METHOD', this.name, 'handle');
    }
}
