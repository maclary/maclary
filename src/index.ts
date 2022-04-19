// Check for Discord.js version 14
import { version } from 'discord.js';
const major = Number.parseInt(version.split('.')[0], 10);
import { Error } from './errors';
if (major !== 14) throw new Error('UNSUPPORTED_DJS_VERSION');
export { container } from './container';

// Structures
export * from './structures/Client';
export * from './structures/Command';
export * from './structures/Event';
export * from './structures/Plugin';
export * from './structures/Args';
export * from './structures/Precondition';
export * as Preconditions from './preconditions/index';

// Managers
export type { Container } from './container';
export type { CommandManager } from './managers/CommandManager';
export type { EventManager } from './managers/EventManager';
export type { PluginManager } from './managers/PluginManager';

// Errors
export * from './errors/ReplyError';

// Types
export { Events } from './types/Events';

// Util
export * from './utils/CustomId';
export * as Regexes from './utils/Regexes';
