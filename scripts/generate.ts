import type { IconDefinition } from '@ant-design/icons-svg/es/types'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import * as allIconDefs from '@ant-design/icons-svg'

import { isNil, template } from 'lodash'
import pkgDir from 'pkg-dir'

const writeFile = promisify(fs.writeFile)

interface IconDefinitionWithIdentifier extends IconDefinition {
    svgIdentifier: string
    svgBase64: string | null
}

const svgPkg = require.resolve('@ant-design/icons-svg')
const svgPkgDir = pkgDir.sync(path.dirname(svgPkg))
const inlineSvgDir = path.join(svgPkgDir, 'inline-namespaced-svg')

function detectRealPath(icon: IconDefinition) {
    try {
        if ([icon, icon?.theme, icon?.name].some(isNil))
            return null

        const _path = path.join(inlineSvgDir, icon.theme, `${icon.name}.svg`)

        return fs.existsSync(_path) ? _path : null
    }
    catch (e) {
        return null
    }
}

function svg2base64(svgPath: string, size = 50) {
    const svg = fs.readFileSync(svgPath, 'utf-8')
    const svgWithStyle = svg
        .replace(/<svg/, `<svg width="${size}" height="${size}" fill="#cacaca"`)
    // https://github.com/ant-design/ant-design-icons/blob/a02cbf8/packages/icons-svg/templates/helpers.ts#L3-L6
        .replace(/#333/g, '#1677ff')
        .replace(/#E6E6E6/gi, '#e6f4ff')

    const base64 = Buffer.from(svgWithStyle).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
}

function walk<T>(
    fn: (iconDef: IconDefinitionWithIdentifier) => Promise<T>,
) {
    return Promise.all(
        Object.keys(allIconDefs)
            .map((svgIdentifier) => {
                const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
                    svgIdentifier
                ]

                const realSvgPath = detectRealPath(iconDef)
                let svgBase64 = null
                if (realSvgPath) {
                    try { svgBase64 = svg2base64(realSvgPath) }
                    catch (e) { /** nothing */ }
                }

                return fn({ svgIdentifier, svgBase64, ...iconDef })
            }),
    )
}

async function generateIcons() {
    const iconsDir = path.join(__dirname, '../src/icons')
    try {
        await promisify(fs.access)(iconsDir)
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (err) {
        await promisify(fs.mkdir)(iconsDir)
    }

    const render = template(`
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY

import type { Component } from 'solid-js'
import type { AntdIconProps } from '../components/AntdIcon'
import <%= svgIdentifier %>Svg from '@ant-design/icons-svg/lib/asn/<%= svgIdentifier %>';
import AntdIcon from '../components/AntdIcon'

function <%= svgIdentifier %>(props: AntdIconProps) {
    return <AntdIcon {...props} icon={<%= svgIdentifier %>Svg} />
}

<% if (svgBase64) { %> /**![<%= name %>](<%= svgBase64 %>) */ <% } %>
const RefIcon: Component<AntdIconProps> = <%= svgIdentifier %>

export default RefIcon;
`.trim())

    await walk(async (item) => {
    // generate icon file
        await writeFile(
            path.resolve(__dirname, `../src/icons/${item.svgIdentifier}.tsx`),
            render(item),
        )
    })

    // generate icon index
    const entryText = Object.keys(allIconDefs)
        .sort()
        .map(svgIdentifier => `export { default as ${svgIdentifier} } from './${svgIdentifier}';`)
        .join('\n')

    await promisify(fs.appendFile)(
        path.resolve(__dirname, '../src/icons/index.tsx'),
        `
// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY

${entryText}
    `.trim(),
    )
}

async function generateEntries() {
    const render = template(`
'use strict';
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const _<%= svgIdentifier %> = _interopRequireDefault(require('./lib/icons/<%= svgIdentifier %>'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const _default = _<%= svgIdentifier %>;
exports.default = _default;
module.exports = _default;
`.trim())

    await walk(async ({ svgIdentifier }) => {
    // generate `Icon.js` in root folder
        await writeFile(
            path.resolve(__dirname, `../${svgIdentifier}.js`),
            render({
                svgIdentifier,
            }),
        )

        // generate `Icon.d.ts` in root folder
        await writeFile(
            path.resolve(__dirname, `../${svgIdentifier}.d.ts`),
            `export { default } from './lib/icons/${svgIdentifier}';`,
        )
    })
}

if (process.argv[2] === '--target=icon') {
    generateIcons()
}

if (process.argv[2] === '--target=entry') {
    generateEntries()
}
