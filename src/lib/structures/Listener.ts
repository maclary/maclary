import type EventEmitter from 'node:events';
import { s } from '@sapphire/shapeshift';
import type { ClientEvents } from 'discord.js';
import { Base } from './Base';
import type { Awaitable, Like } from '#/types';
import { Events } from '#/utilities/Events';

/**
 * All event listeners must extend this class and omplement its handler.
 * @typeparam E The event this listener is for.
 * @since 1.0.0
 */
export abstract class Listener<E extends keyof ClientEvents>
    extends Base
    implements Listener.Options<E>
{
    public readonly emitter: Like<EventEmitter>;

    public readonly event: E;

    public readonly once: boolean;

    /**
     * @param options Options for this listener.
     * @since 1.0.0
     */
    public constructor(options: Listener.Options<E>) {
        super();

        const results = this._schema.parse(options);
        this.emitter = results.emitter;
        this.event = results.event as any;
        this.once = results.once;
    }

    private get _schema() {
        return s.object({
            emitter: s.any.default(() => this.container.client),
            event: s.string,
            once: s.boolean.default(false),
        });
    }

    /**
     * The handler for this event.
     * @param ...args The args this event passes.
     * @since 1.0.0
     */
    public abstract run(...args: ClientEvents[E]): Awaitable<unknown>;

    /** @internal */ public _handleRun(...args: ClientEvents[E]) {
        try {
            if (typeof this.run !== 'undefined') return this.run(...args);
            throw new Error(`Listener "${this.event}" is missing its "run" handler.`);
        } catch (error) {
            let typedError = error as Error;
            if (!(error instanceof Error)) typedError = new Error(String(error));
            this.container.client.emit(Events.ListenerError, { listener: this }, typedError);
        }
    }
}

export namespace Listener {
    export interface Options<E extends keyof ClientEvents> {
        /**
         * The emitter to attach this listener to.
         * @default container.client
         * @since 1.0.0
         */
        emitter?: Like<EventEmitter>;

        /**
         * The event name that this listener should listen on.
         * @since 1.0.0
         */
        event: E;

        /**
         * Whether to remove this listener after its first execution.
         * @default false
         * @since 1.0.0
         */
        once?: boolean;
    }
}
