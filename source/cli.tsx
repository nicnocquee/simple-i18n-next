#!/usr/bin/env node
import meow from 'meow'
import fs from 'fs'
import path from 'path'
import { generateLocale } from './generate-locale.js'

const cli = meow(
  `
  Usage
    $ next-i18n [input]

  Options
    --input, -i <type> The path to the locales directory.  [Default: ./locales]
    
  Examples
    $ next-i18n -i ./locales
`,
  {
    importMeta: import.meta,
    flags: {
      input: { type: 'string', shortFlag: 'i', default: './locales' },
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

generateLocale({ localesDir: localeDirPath })
