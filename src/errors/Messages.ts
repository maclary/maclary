import { register } from './MaclaryError';

const Messages = {
    INVALID_TOKEN: 'An invalid token was provided.',
    INVALID_PLUGIN: 'An invalid plugin was provided.',
    UNSUPPORTED_DJS_VERSION: 'The version of Discord.js you are using is not supported.',
    FAILED_APPLICATION: 'Failed to load application.',
    DEVELOPMENT_ON_SHARD: 'Development mode is not supported when sharding.',

    COMMAND_MISSING_METHOD: (name: string, method: string) =>
        `Command ${name} is missing its ${method} method.`,
    COMPONENT_MISSING_METHOD: (name: string, method: string) =>
        `Component ${name} is missing its ${method} method.`,
    EVENT_MISSING_METHOD: (name: string, method: string) =>
        `Event ${name} is missing its ${method} method.`,

    COMMAND_NOT_IMPLEMENTED: (name: string) => `Command ${name} has not been implemented yet.`,
};

for (const [key, val] of Object.entries(Messages)) {
    register(key, val);
}
