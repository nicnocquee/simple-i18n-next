import path from 'node:path'
import { generateLocale } from './source/generate-locale.js'

// Generate locale files before all tests. This is needed for the useStrings hook test.
// If not here, vitest will fail because it cannot import the useStrings hook since it's not yet generated.
// Even putting it in beforeAll didn't work. Only here.
generateLocale({
  localesDir: path.resolve(process.cwd(), './test/locales-with-plurals-vitest'),
  outputDir: path.resolve(process.cwd(), './test/locales-with-plurals-vitest/.generated-vitest'),
  defaultLanguage: 'en',
  silent: true,
} as const)
