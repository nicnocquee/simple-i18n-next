/* eslint-disable no-await-in-loop */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import test from 'ava'
import { generateLocale } from '../source/generate-locale.js'

test.before(async () => {
  try {
    await Promise.allSettled([
      fs.rm('./test/locales/.generated', { recursive: true }),
      fs.rm('./test/locales/.generated2', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated2', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated3', { recursive: true }),
    ])
  } catch (error) {
    console.log(error)
  }
})

test.after(async () => {
  try {
    await Promise.allSettled([
      fs.rm('./test/locales/.generated', { recursive: true }),
      fs.rm('./test/locales/.generated2', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated2', { recursive: true }),
      fs.rm('./test/locales-invalid-dir/.generated3', { recursive: true }),
    ])
  } catch (error) {
    console.log(error)
  }
})

test('generateLocale without output directory', async (t) => {
  generateLocale({
    localesDir: path.resolve(process.cwd(), './test/locales'),
    defaultLanguage: 'en',
    silent: true,
  })
  const identical = await compareDirectories(
    './test/locales/.generated',
    './test/locales/.expected-generated-dir'
  )
  t.true(identical)
})

test('generateLocale with output directory', async (t) => {
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
  t.true(identical)
})

test("generateLocale with defaultLanguage but doesn't exist in localesDir", (t) => {
  const error = t.throws(() => {
    generateLocale({
      localesDir: path.resolve(process.cwd(), './test/locales-invalid-dir'),
      defaultLanguage: 'de',
      outputDir: './test/locales-invalid-dir/.generated2',
      silent: true,
    })
  })
  t.truthy(error)
})

test('generateLocale with invalid language code directory', async (t) => {
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
  t.true(identical)
})

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
      return false
    }
  }

  return true
}
