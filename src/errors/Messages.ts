import { register } from './MaclaryError';

const Messages = {
    INVALID_TOKEN: 'An invalid token was provided.',
    INVALID_PLUGIN: 'An invalid plugin was provided.',
    UNSUPPORTED_DJS_VERSION: 'The version of Discord.js you are using is not supported.',
    FAILED_APPLICATION: 'Failed to load application.',

    COMMAND_MISSING_METHOD: (name: string, method: string) =>
        `Command ${name} is missing its ${method} method.`,
    EVENT_MISSING_METHOD: (name: string, method: string) =>
        `Event ${name} is missing its ${method} method.`,
};

for (const [key, val] of Object.entries(Messages)) {
    register(key, val);
}
