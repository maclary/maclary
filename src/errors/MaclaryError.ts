// Inspired by discord.js errors

const kCode = Symbol('code');
const messages = new Map();

function makeMaclaryError(Base: any) {
    return class MaclaryError extends Base {
        public constructor(key: string, ...args: any[]) {
            super(message(key, args));
            this[kCode as any] = key;
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, MaclaryError);
            }
        }

        public get name() {
            return `${super.name} [${this[kCode as any]}]`;
        }

        public get code() {
            return this[kCode as any];
        }
    };
}

function message(key: string, args: any[]): string {
    if (typeof key !== 'string') throw new Error('Error message key must be a string');
    const msg = messages.get(key);
    if (!msg) throw new Error(`An invalid error message key was used: ${key}.`);
    if (typeof msg === 'function') return msg(...args);
    if (!args?.length) return msg;
    args.unshift(msg);
    return String(...args);
}

function register(sym: string, val: any): void {
    messages.set(sym, typeof val === 'function' ? val : String(val));
}

const MaclaryError = makeMaclaryError(Error);
const MaclaryTypeError = makeMaclaryError(TypeError);
const MaclaryRangeError = makeMaclaryError(RangeError);

export {
    register,
    MaclaryError as Error,
    MaclaryTypeError as TypeError,
    MaclaryRangeError as RangeError,
};
