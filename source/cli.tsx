#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import meow from 'meow'
import { generateLocale } from './generate-locale.js'

const cli = meow(
  `
  Usage
    $ simple-i18n-next [input]

  Options
    --input, -i <type> The path to the locales directory.  [Default: ./locales]
    --default-language, -l <type> The default language to use.  [Default: the first directory in the locales directory]
    --output, -o <type> The path to the output directory.  [Default: <input>/.generated]

  Examples
    $ simple-i18n-next -i ./locales
`,
  {
    importMeta: import.meta,
    flags: {
      input: { type: 'string', shortFlag: 'i', default: './locales' },
      defaultLanguage: {
        aliases: ['default-language'],
        type: 'string',
        shortFlag: 'l',
      },
      output: { type: 'string', shortFlag: 'o' },
      silent: { type: 'boolean', shortFlag: 's', default: false },
    },
  }
)
const localeDirPath = path.resolve(process.cwd(), cli.flags.input)
if (!fs.existsSync(localeDirPath)) {
  console.error(
    `The directory that contains the locale files are not found at at ${localeDirPath}. Please provide a valid path to the locale directory.`
  )
  process.exit(1)
}

generateLocale({
  localesDir: localeDirPath,
  defaultLanguage: cli.flags.defaultLanguage,
  outputDir: cli.flags.output,
  silent: cli.flags.silent,
})
