import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { mjsImport } from './MJSImport';
import { getRootData } from './RootScanner';

const usingESM = getRootData().type === 'ESM';
export const supportedExtensions = ['.js', '.cjs', '.mjs'];

const hasSymbol = Reflect.has(process, Symbol.for('ts-node.register.instance'));
const hasEnvVar = !process.env['TS_NODE_DEV'];
if (hasSymbol || !hasEnvVar) supportedExtensions.push('.ts', '.cts', '.mts');

/** Get information about a file or directory. */
export function getModuleData(path: string, allowFolders = false) {
    const type = existsSync(path) && lstatSync(path).isFile() ? 'file' : 'directory';
    if (!type) return null;

    const allowedExtensions = new Set(supportedExtensions);
    if (allowFolders) allowedExtensions.add('');

    if (!allowFolders && type === 'directory') return null;
    if (path.endsWith('.d.ts')) return null;
    const extension = extname(path);
    if (!allowedExtensions.has(extension)) return null;

    const name = basename(path, extension);
    if (name === '') return null;

    return { type, name, extension, path: resolve(path) } as ModuleData;
}

/** Load the contents of a file or directory. */
export function loadModule(data: ModuleData) {
    if (data.type === 'directory')
        return readdirSync(data.path).reduce(async (objPromise, path) => {
            const obj = await objPromise;
            const info = getModuleData(join(data.path, path), true);
            if (info) obj[path] = await loadModule(info);
            return obj;
        }, Promise.resolve({} as Record<string, unknown>));

    if (data.extension === '.mjs' || (usingESM && data.extension === '.js')) {
        const url = pathToFileURL(data.path);
        url.searchParams.append('d', Date.now().toString());
        url.searchParams.append('name', data.name);
        url.searchParams.append('extension', data.extension);
        return mjsImport(url.toString());
    }

    const mod = require(data.path);
    delete require.cache[require.resolve(data.path)];
    return mod;
}

export interface ModuleData {
    extension: string;
    name: string;
    path: string;
    type: 'directory' | 'file';
}
