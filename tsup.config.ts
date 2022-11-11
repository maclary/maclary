import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    dts: true,
    entry: ['src/**/*.ts'],
    format: ['cjs'],
    minify: false,
    skipNodeModulesBundle: true,
    sourcemap: true,
    target: 'es2020',
    keepNames: true,
    esbuildPlugins: [esbuildPluginVersionInjector()],
    treeshake: true,
    bundle: false,
    splitting: false,
});
