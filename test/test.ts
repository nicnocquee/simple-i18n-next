/* eslint-disable no-await-in-loop */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import test from 'ava'
import { generateLocale } from '../source/generate-locale.js'

test('generateLocale', async (t) => {
  generateLocale({ localesDir: path.resolve(process.cwd(), './locales'), defaultLanguage: 'en' })
  const identical = await compareDirectories(
    './locales/.generated',
    './locales/.expected-generated-dir'
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
