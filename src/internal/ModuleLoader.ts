import { getRootData } from './RootScanner';
import { extname, basename } from 'path';

const usingESM = getRootData().type === 'ESM';
const supportedExtensions = new Set(['.js', '.cjs', '.mjs']);
let filterDtsFiles = false;

const hasSymbol = Reflect.has(process, Symbol.for('ts-node.register.instance'));
const hasEnvVar = ![undefined, null].includes(process.env.TS_NODE_DEV as any);
if (hasSymbol || hasEnvVar) {
    supportedExtensions.add('.ts');
    filterDtsFiles = true;
}

export function isClass(value: unknown): boolean {
    return typeof value === 'function' && typeof value.prototype === 'object';
}

export interface ModuleData {
    path: string;
    extension: string;
    name: string;
}

export function getModuleInformation(path: string, allowFolders = false): ModuleData | null {
    const extension = extname(path);
    if (!(allowFolders && extension === '') && !supportedExtensions.has(extension)) return null;
    if (filterDtsFiles && path.endsWith('.d.ts')) return null;

    const name = basename(path, extension);
    if (name === '') return null;
    return { extension, path, name };
}

export async function requireModule(file: ModuleData): Promise<any> {
    const mjs = file.extension === '.mjs' || (file.extension === '.js' && usingESM);
    if (mjs) return import(file.path);

    const mod = require(file.path);
    delete require.cache[require.resolve(file.path)];
    return mod;
}

export async function loadModule(file: ModuleData): Promise<any> {
    const mod = await requireModule(file);
    if (isClass(mod.default)) return mod.default;
    if (isClass(mod)) return mod;
    return null;
}
