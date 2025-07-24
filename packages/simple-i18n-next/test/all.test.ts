/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-await-in-loop */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { it, beforeAll, afterAll, expect } from 'vitest'
import { glob } from 'glob'
import { generateLocale, Plurals } from '../source/generate-locale.js'

const getDirectories = async (pattern: string) => {
  return glob(pattern)
}

beforeAll(async () => {
  try {
    const files = await getDirectories('./test/**/.generated*')
    await Promise.allSettled(
      files
        // Exclude the generated files for the useStrings hook test
        .filter((file) => !file.includes('locales-with-plurals-vitest/.generated-vitest'))
        .map(async (file) => fs.rm(file, { recursive: true }))
    )
  } catch (error) {
    console.log(error)
  }
})

afterAll(async () => {
  try {
    const files = await getDirectories('./test/**/.generated*')
    await Promise.allSettled(
      files
        .filter((file) => !file.includes('locales-with-plurals-vitest/.generated-vitest'))
        .map(async (file) => fs.rm(file, { recursive: true }))
    )
  } catch (error) {
    console.log(error)
  }
})

it('generateLocale without output directory', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales'),
    defaultLanguage: 'en',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales/.generated',
    './test/locales/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it('generateLocale with output directory', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales'),
    defaultLanguage: 'en',
    outputDir: './test/locales/.generated2',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales/.generated2',
    './test/locales/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it("generateLocale with defaultLanguage but doesn't exist in localesDir", () => {
  const error = expect(() => {
    generateLocale({
      localesDir: path.resolve(process.cwd(), './test/locales-invalid-dir'),
      defaultLanguage: 'de',
      outputDir: './test/locales-invalid-dir/.generated2',
      silent: true,
    })
  }).toThrow()
  expect(error).toBeTruthy()
})

it('generateLocale with invalid language code directory', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales-invalid-dir'),
    defaultLanguage: 'en',
    outputDir: './test/locales-invalid-dir/.generated3',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales-invalid-dir/.generated3',
    './test/locales-invalid-dir/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it('generateLocale with nested keys', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales-with-nested-keys'),
    defaultLanguage: 'en',
    outputDir: './test/locales-with-nested-keys/.generated3',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales-with-nested-keys/.generated3',
    './test/locales-with-nested-keys/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it('generateLocale with plurals', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales-with-plurals'),
    defaultLanguage: 'en',
    outputDir: './test/locales-with-plurals/.generated3',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales-with-plurals/.generated3',
    './test/locales-with-plurals/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it('generateLocale from multiple json files', async () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales-with-many-jsons'),
    defaultLanguage: 'en',
    outputDir: './test/locales-with-many-jsons/.generated',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales-with-many-jsons/.generated',
    './test/locales-with-many-jsons/.expected-generated-dir'
  )
  expect(identical).toBe(true)
})

it('getPluralKeys no missing', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_other', 'cat')
  plurals.storePluralKeyIfNeeded('cat_one', 'cat')

  const { pluralKeys, incompletePluralKeys } = plurals.getPluralKeys()

  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
      cat: [
        ['other', 'cat'],
        ['one', 'cat'],
      ],
    })
  ).toBe(true)
  expect(incompletePluralKeys).toEqual({})
})

it('getPluralKeys with missing english', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_one', 'cat')

  const { pluralKeys, incompletePluralKeys } = plurals.getPluralKeys()
  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
      cat: [['one', 'cat']],
    })
  ).toBe(true)
  expect(
    objectsEqualIgnoringOrder(incompletePluralKeys, {
      cat: ['other'],
    })
  ).toBe(true)
})

it('getPluralKeys with missing arabic', () => {
  const plurals = new Plurals('ar')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_one', 'cat')

  const { pluralKeys, incompletePluralKeys } = plurals.getPluralKeys()

  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
      cat: [['one', 'cat']],
    })
  ).toBe(true)
  expect(
    objectsEqualIgnoringOrder(incompletePluralKeys, {
      item: ['few', 'many', 'two', 'zero'],
      cat: ['few', 'many', 'two', 'zero', 'other'],
    })
  ).toBe(true)
})

it('getPluralKeys with unnecessary categories english', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_one', 'cat')
  plurals.storePluralKeyIfNeeded('cat_other', 'cat')
  plurals.storePluralKeyIfNeeded('cat_few', 'cat')

  const { pluralKeys, unnecessaryPluralKeys } = plurals.getPluralKeys()

  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
      cat: [
        ['one', 'cat'],
        ['other', 'cat'],
      ],
    })
  ).toBe(true)

  expect(arraysEqualIgnoringOrder(unnecessaryPluralKeys, ['cat_few'])).toBe(true)
})

it('getPluralKeys with ordinal english', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_ordinal_one', 'cat')
  plurals.storePluralKeyIfNeeded('cat_ordinal_other', 'cat')

  const { pluralKeys, pluralOrdinalKeys } = plurals.getPluralKeys()
  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
    })
  ).toBe(true)

  expect(
    objectsEqualIgnoringOrder(pluralOrdinalKeys, {
      cat: [
        ['other', 'cat'],
        ['one', 'cat'],
      ],
    })
  ).toBe(true)
})

it('getPluralKeys with ordinal missing english', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_ordinal_one', 'cat')

  const { pluralKeys, pluralOrdinalKeys, incompletePluralOrdinalKeys } = plurals.getPluralKeys()
  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
    })
  ).toBe(true)

  expect(
    objectsEqualIgnoringOrder(pluralOrdinalKeys, {
      cat: [['one', 'cat']],
    })
  ).toBe(true)

  expect(
    objectsEqualIgnoringOrder(incompletePluralOrdinalKeys, {
      cat: ['few', 'two', 'other'],
    })
  ).toBe(true)
})

it('getPluralKeys with ordinal unnecessary english', () => {
  const plurals = new Plurals('en')

  plurals.storePluralKeyIfNeeded('hello', 'hello')
  plurals.storePluralKeyIfNeeded('item_other', 'item')
  plurals.storePluralKeyIfNeeded('item_one', 'item')
  plurals.storePluralKeyIfNeeded('cat_ordinal_one', 'cat')
  plurals.storePluralKeyIfNeeded('cat_ordinal_many', 'cat') // This is unnecessary for english// This is unnecessary for english

  const {
    pluralKeys,
    pluralOrdinalKeys,
    incompletePluralOrdinalKeys,
    unnecessaryPluralOrdinalKeys,
  } = plurals.getPluralKeys()
  expect(
    objectsEqualIgnoringOrder(pluralKeys, {
      item: [
        ['other', 'item'],
        ['one', 'item'],
      ],
    })
  ).toBe(true)

  expect(
    objectsEqualIgnoringOrder(pluralOrdinalKeys, {
      cat: [['one', 'cat']],
    })
  ).toBe(true)

  expect(
    objectsEqualIgnoringOrder(incompletePluralOrdinalKeys, {
      cat: ['few', 'two', 'other'],
    })
  ).toBe(true)

  expect(arraysEqualIgnoringOrder(unnecessaryPluralOrdinalKeys, ['cat_ordinal_many'])).toBe(true)
})

it('interpolation', () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales'),
    defaultLanguage: 'en',
    outputDir: './test/locales/.generated3',
    silent: true,
  })

  const jiti = require('jiti')(__filename)
  const { greeting } = jiti('./locales/.generated3/strings')

  expect(greeting('en', { name: 'Nico' })).toBe('Hello Nico!')
})

it('interpolation with multiple variables', () => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales'),
    defaultLanguage: 'en',
    outputDir: './test/locales/.generated4',
    silent: true,
  })

  const jiti = require('jiti')(__filename)
  const { welcome } = jiti('./locales/.generated4/strings')

  expect(welcome('en', { country: 'Switzerland', time: '4AM' })).toBe(
    "Welcome to Switzerland! It's 4AM now."
  )
})

it('case insensitive key', () => {
  const error = expect(() => {
    generateLocale({
      localesDir: path.resolve(process.cwd(), './test/locales-with-case-insensitive-key'),
      defaultLanguage: 'en',
      outputDir: './test/locales-with-case-insensitive-key/.generated',
      silent: true,
    })
  }).toThrow()
  expect(error).toBeTruthy()
})

it('reserved keyword', () => {
  const error = expect(() => {
    generateLocale({
      localesDir: path.resolve(process.cwd(), './test/locales-with-reserved-keywords'),
      defaultLanguage: 'en',
      outputDir: './test/locales-with-reserved-keywords/.generated',
      silent: true,
    })
  }).toThrow()
  expect(error).toBeTruthy()
})

function arraysEqualIgnoringOrder<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false

  const sortedArr1 = deepSort(arr1)
  const sortedArr2 = deepSort(arr2)

  for (const [i, element] of sortedArr1.entries()) {
    if (Array.isArray(element) && Array.isArray(sortedArr2[i])) {
      if (!arraysEqualIgnoringOrder(element, sortedArr2[i])) return false
    } else if (element !== sortedArr2[i]) return false
  }

  return true
}

function deepSort<T>(arr: T[]): T[] {
  return arr
    .map((item) => {
      if (Array.isArray(item)) {
        return deepSort(item) as unknown as T
      }

      return item
    })
    .sort(compareElements)
}

function compareElements(a: any, b: any): number {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (arraysEqualIgnoringOrder(a, b)) return 0
    return a > b ? 1 : -1
  }

  return a > b ? 1 : -1
}

function objectsEqualIgnoringOrder(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  let equal = true

  if (keys1.length !== keys2.length) {
    console.log(`- Different number of keys: ${keys1.length} vs ${keys2.length}`)
    equal = false
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      console.log(`- Key '${key}' is missing in the second object.`)
      equal = false
    }
  }

  for (const key of keys2) {
    if (!keys1.includes(key)) {
      console.log(`+ Key '${key}' is missing in the first object.`)
      equal = false
    }
  }

  for (const key of keys1) {
    if (keys2.includes(key)) {
      const value1 = obj1[key]
      const value2 = obj2[key]

      if (Array.isArray(value1) && Array.isArray(value2)) {
        if (!arraysEqualIgnoringOrder(value1, value2)) {
          console.log(`@@ - Arrays at key '${key}' are different`)
          console.log(`- ${JSON.stringify(value1)}`)
          console.log(`+ ${JSON.stringify(value2)}`)
          equal = false
        }
      } else if (value1 !== value2) {
        console.log(`@@ - Values at key '${key}' are different`)
        console.log(`- ${value1}`)
        console.log(`+ ${value2}`)
        equal = false
      }
    }
  }

  return equal
}

async function getFilesInDirectory(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)
  const filePaths = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      return stat.isDirectory() ? getFilesInDirectory(filePath) : filePath
    })
  )
  return filePaths.flat()
}

async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath)
  const hash = crypto.createHash('sha256')
  hash.update(content)
  return hash.digest('hex')
}

async function compareDirectories(sourceDir: string, targetDir: string): Promise<boolean> {
  const sourceFiles = await getFilesInDirectory(sourceDir)
  const targetFiles = await getFilesInDirectory(targetDir)

  const sourceRelativePaths = new Set(sourceFiles.map((file) => path.relative(sourceDir, file)))
  const targetRelativePaths = new Set(targetFiles.map((file) => path.relative(targetDir, file)))

  if (sourceRelativePaths.size !== targetRelativePaths.size) {
    console.log(
      `Source directory has ${sourceRelativePaths.size} files, target directory has ${targetRelativePaths.size} files`
    )
    return false
  }

  for (const filePath of sourceRelativePaths) {
    if (!targetRelativePaths.has(filePath)) {
      console.log(`File ${filePath} is missing in target directory`)
      return false
    }

    const sourceFilePath = path.join(sourceDir, filePath)
    const targetFilePath = path.join(targetDir, filePath)

    const sourceFileHash = await hashFile(sourceFilePath)
    const targetFileHash = await hashFile(targetFilePath)

    if (sourceFileHash !== targetFileHash) {
      console.log(`File ${filePath} has different hash in source and target directory`)
      const sourceFileContent = await fs.readFile(sourceFilePath, 'utf8')
      const targetFileContent = await fs.readFile(targetFilePath, 'utf8')
      console.log('-------------- SOURCE ------------------')
      console.log(sourceFileContent)
      console.log('-------------- TARGET ------------------')
      console.log(targetFileContent)
      console.log('--------------------------------')
      return false
    }
  }

  return true
}
