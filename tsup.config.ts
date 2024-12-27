import { solidPlugin } from 'esbuild-plugin-solid'
import { defineConfig } from 'tsup'

export default defineConfig({
    target: 'esnext',
    platform: 'browser',
    format: 'esm',
    clean: true,
    entry: ['./src/**/*.ts', './src/**/*.tsx'],
    treeshake: { preset: 'smallest' },
    dts: true,
    external: ['solid-js'],
    esbuildPlugins: [solidPlugin({ solid: { generate: 'dom' } })],
    esbuildOptions(options) {
        options.chunkNames = '[name]/[hash]'
        options.drop = ['console', 'debugger']
    },
})
