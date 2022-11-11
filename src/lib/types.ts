import type EventEmitter from 'node:events';

export type Awaitable<T> = Promise<T> | T;

export type If<T extends boolean, Truthy, Falsy = null> = T extends true
    ? Truthy
    : T extends false
    ? Falsy
    : Falsy | Truthy;

export type Like<T, P extends keyof T = keyof T> = Pick<T, P>;

export type EventEmitterLike = Like<EventEmitter, 'listeners' | 'off' | 'on' | 'once'>;

export type ConsoleLike = Like<typeof console, 'error' | 'info' | 'warn'>;
