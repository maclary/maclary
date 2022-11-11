import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';

let data: RootData | null = null;

/** Get information about the root of the project. */
export function getRootData() {
    if (data) return data;

    const workingDir = process.cwd();

    try {
        const packagePath = join(workingDir, 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

        return (data = {
            root: dirname(join(workingDir, packageJson.main)),
            type: packageJson.type === 'module' ? 'ESM' : 'CommonJS',
        });
    } catch {
        return (data = {
            root: workingDir,
            type: 'CommonJS',
        });
    }
}

export interface RootData {
    root: string;
    type: 'CommonJS' | 'ESM';
}
