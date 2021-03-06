// Check for Discord.js version 14
import { version } from 'discord.js';
const major = Number.parseInt(version.split('.')[0], 10);
import { Error } from './errors';
if (major !== 14) throw new Error('UNSUPPORTED_DJS_VERSION');

export { container } from './container';
export type { Container } from './container';

// Structures
export * from './structures/Args';
export * from './structures/Base';
export * from './structures/Client';
export * from './structures/Command';
export * from './structures/Component';
export * from './structures/Event';
export * from './structures/Plugin';
export * from './structures/Precondition';
export * as Preconditions from './preconditions/index';

// Managers
export * from './managers/BaseManager';
export * from './managers/CommandManager';
export * from './managers/ComponentManager';
export * from './managers/EventManager';
export * from './managers/MapManager';
export * from './managers/PluginManager';
export * from './managers/SetManager';

// Errors
export * from './errors';

// Types
export { Events } from './types/Events';

// Utils
export * as Regexes from './utils/Regexes';
