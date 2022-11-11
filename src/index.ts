// Root
export * from './lib/container';
export * from './lib/types';

// Managers
export * from './lib/managers/ActionManager';
export * from './lib/managers/BaseManager';
export * from './lib/managers/CommandManager';
export * from './lib/managers/ListenerManager';
export * from './lib/managers/PluginManager';

// Preconditions
export * from './lib/structures/Precondition';
export * as Preconditions from './preconditions';

// Structures
export * from './lib/structures/Action';
export * from './lib/structures/Arguments';
export * from './lib/structures/Base';
export * from './lib/structures/Command';
export * from './lib/structures/Listener';
export * from './lib/structures/Maclary';
export * from './lib/structures/Plugin';

// Utilities
export * from './lib/utilities/Events';
export * as Regexes from './lib/utilities/Regexes';

/**
 * The current version that you are currently using.
 * @since 1.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = '[VI]{{inject}}[/VI]';
