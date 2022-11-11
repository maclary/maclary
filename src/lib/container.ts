import type { Client } from 'discord.js';
import type { Maclary } from './structures/Maclary';
import type { Like } from './types';

export interface Container<Ready extends boolean = true> {
    client: Client<Ready>;
    logger: Like<typeof console>;
    maclary: Maclary;
}

/**
 * A container that can be used values that are
 * accessible anywhere in the project.
 * @since 1.0.0
 */
// @ts-expect-error 2739 Produces error due to missing properties.
export const container: Container<true> = {
    logger: console,
};
