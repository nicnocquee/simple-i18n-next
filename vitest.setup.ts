import path from 'node:path'
import { generateLocale } from './source/generate-locale.js'

// Generate locale files before all tests
generateLocale({
  localesDir: path.resolve(process.cwd(), './test/locales-with-plurals-vitest'),
  outputDir: path.resolve(process.cwd(), './test/locales-with-plurals-vitest/.generated-vitest'),
  defaultLanguage: 'en',
  silent: true,
} as const)
