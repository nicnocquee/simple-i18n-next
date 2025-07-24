/* eslint-disable logical-assignment-operators */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const dirName = path.dirname(__filename)
// Capitalize the first letter of a string
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function getDirectories(currentPath: string): string[] {
  return fs.readdirSync(currentPath).filter((file) => {
    return fs.statSync(path.join(currentPath, file)).isDirectory() && !file.startsWith('.')
  })
}

function showLog(message: string, silent: boolean) {
  if (!silent) {
    console.log(message)
  }
}

// Convert an array of strings to camelCase
export function arrayToCamelCase(arr: string[]): string {
  const expand = arr.flatMap((item) => {
    const makeItSafe = item.replace(/[^a-zA-Z\d]+/g, ' ')
    const split = makeItSafe.split(' ')
    const capitalized = split.map((word) => capitalize(word))
    return capitalized
  })
  const camelCase = expand.join('')
  return camelCase.charAt(0).toLowerCase() + camelCase.slice(1)
}

// Generate TypeScript prop types from a template string
export function generatePropTypes(template: string, functionName: string) {
  const regex = /{{\s*(\w+)\s*}}/g
  const props = new Set<string>()

  let match
  while ((match = regex.exec(template)) !== null) {
    if (match[1]) {
      props.add(match[1])
    }
  }

  if (props.size === 0) {
    return null
  }

  const typeProps = [...props].map((prop) => `  ${prop}: string;`).join('\n')

  return {
    name: `${functionName}Props`,
    content: `type ${functionName}Props = {\n${typeProps}\n}`,
  }
}

// Generate component name from file path
export function componentNameFromFilepath(filepath: string) {
  const parts = filepath
    .split('/')
    .filter((p) => p.trim() !== '.')
    .map((p) => p.replace('.mdx', ''))
  const cameledCase = arrayToCamelCase(parts)
  return cameledCase.charAt(0).toUpperCase() + cameledCase.slice(1)
}

// Find all .mdx files recursively in a directory
export function findMdxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.map((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return findMdxFiles(entryPath)
    }

    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      return [entryPath]
    }

    return []
  })
  return files.flat()
}

// Generate a React component from markdown content and file path
export const generateComponent = (
  markdownContent: string,
  filepath: string,
  localesDir: string
) => {
  // Regular expression to find {props.something}
  const propMatches = markdownContent.match(/{props\.(\w+)}/g)

  // If propMatches is null, set uniqueProps to an empty array
  const uniqueProps = propMatches
    ? [...new Set(propMatches.map((m) => /props\.(\w+)/.exec(m)?.[1]))]
    : []

  const componentName = componentNameFromFilepath(filepath.replace(localesDir, ''))
  const imports = `import ${componentName}Markdown from '${filepath.replace(localesDir, '..')}';\n`
  let typeDefs = ''
  const component = `const ${componentName} = (props: ComponentProps<typeof ${componentName}Markdown>${uniqueProps.length > 0 ? ' & ' + componentName + 'Props' : ''}) => <${componentName}Markdown {...props} />;`

  if (uniqueProps.length > 0) {
    typeDefs = `type ${componentName}Props = {\n  ${uniqueProps.map((prop) => `${prop}: string;`).join('\n  ')}\n}\n`
  }

  return {
    componentName,
    componentString: `${imports}${typeDefs}${component}`,
  }
}

export function findCaseInsensitiveDuplicates(json: Record<string, any>): string[] {
  const lowerCaseKeys = new Set<string>()
  const duplicates = new Set<string>()

  for (const key in json) {
    if (Object.hasOwn(json, key)) {
      const lowerKey = key.toLowerCase()
      if (lowerCaseKeys.has(lowerKey)) {
        duplicates.add(key)
      } else {
        lowerCaseKeys.add(lowerKey)
      }
    }
  }

  return [...duplicates]
}

export function getLanguages(localesDir: string): { langs: string[]; invalidLangs: string[] } {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
  const dirNames: string[] = getDirectories(localesDir)
  const invalidLangs: string[] = []
  const langs: string[] = []
  for (const dirName of dirNames) {
    const name = displayNames.of(dirName)
    if (name === dirName) {
      invalidLangs.push(dirName)
    } else {
      langs.push(dirName)
    }
  }

  return { langs, invalidLangs }
}

export const getJsonFileNames = (dir: string): string[] => {
  try {
    const files = fs.readdirSync(dir)
    return files.filter((file) => path.extname(file) === '.json')
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export function generateLocale({
  localesDir = path.join(process.cwd(), 'locales'),
  defaultLanguage,
  outputDir: outputDirPath,
  silent,
}: {
  localesDir: string
  defaultLanguage?: string
  outputDir?: string
  silent: boolean
}) {
  // Define the locales directory and supported languages
  const { langs, invalidLangs } = getLanguages(localesDir)

  if (invalidLangs.length > 0) {
    showLog(
      `Ignoring directory names that are not valid language codes: ${invalidLangs.join(', ')}`,
      silent
    )
  }

  if (langs.length === 0) {
    throw new Error(`No valid language directories found in the ${localesDir} directory`)
  }

  showLog(`Found ${langs.length} valid language directories in the ${localesDir} directory`, silent)

  if (defaultLanguage && !langs.includes(defaultLanguage)) {
    throw new Error(
      `You specified a default language of ${defaultLanguage} but it does not exist in the ${localesDir} directory`
    )
  }

  const baseLang = defaultLanguage ?? (langs[0] as (typeof langs)[number])

  // Read and parse the base language messages
  let baseMessagesJson = {}
  const jsonFiles = getJsonFileNames(path.join(localesDir, baseLang))

  for (const file of jsonFiles) {
    const filePath = path.join(localesDir, baseLang, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const fileName = file.replace('.json', '')
    baseMessagesJson = {
      ...baseMessagesJson,
      ...flattenObjectToCamelCase(JSON.parse(content), '', fileName === 'messages' ? '' : fileName),
    }
  }

  // Define the output directories and files
  const outputDir = outputDirPath
    ? path.resolve(outputDirPath)
    : path.resolve(localesDir, '.generated')

  const clientOutputDir = path.join(outputDir, 'client')
  const outputFile = path.join(outputDir, 'server.ts')
  const markdownOutputFile = path.join(outputDir, 'locales-markdown.tsx')
  const typeDefsOutputFile = path.join(outputDir, 'types.ts')
  const commonOutputFile = path.join(outputDir, 'common.ts')
  const hooksOutputFile = path.join(clientOutputDir, 'hooks.tsx')
  const stringsOutputFile = path.join(outputDir, 'strings.ts')

  // Create output directories if they don't exist
  fs.mkdirSync(outputDir, { recursive: true })
  fs.mkdirSync(clientOutputDir, { recursive: true })
  langs.forEach((lang) => {
    fs.mkdirSync(path.join(clientOutputDir, lang), { recursive: true })
  })

  // Shared content for generated files
  const common: string[] = [
    '// This file is auto-generated by generate-locale.ts\n',
    `export const interpolateTemplate = (text: string, data: Record<string, string>): string => {
    let theText = text
  
    theText = theText.replace(/{{\\s*(\\w+)\\s*}}/g, (match, key) => {
      return key in data ? data[key] : match
    })
  
    return theText
  }`,
  ]

  const typeDefs: string[] = [
    `export type SupportedLanguage = ${langs.map((lang) => `'${lang}'`).join(' | ')};`,
    `export const defaultLanguage: SupportedLanguage = '${baseLang}';`,
    `export const supportedLanguages: SupportedLanguage[] = [${langs.map((lang) => `'${lang}'`).join(', ')}];`,
  ]

  const localeFunctions: string[] = [
    `import { SupportedLanguage } from './types';`,
    `import { interpolateTemplate } from './common';`,
  ]

  const baseKeys = Object.keys(baseMessagesJson)
  const duplicates = findCaseInsensitiveDuplicates(baseMessagesJson)

  if (duplicates.length > 0) {
    throw new Error(`Duplicated keys found in base messages: ${duplicates.join(', ')}`)
  }

  const invalidKeywords = baseKeys.filter((key) => isReservedKeyword(key))
  if (invalidKeywords.length > 0) {
    throw new Error(
      `Keys in base messages cannot be reserved keywords: ${invalidKeywords.join(', ')}`
    )
  }

  const errors: string[] = []
  const langFunctions: Record<string, Record<string, string>> = {}
  const propTypes: Record<string, ReturnType<typeof generatePropTypes>> = {}
  const stringKeys: string[] = []

  const pluralLangKeys: Record<string, ReturnType<Plurals['getPluralKeys']>> = {}

  // Process each language and generate individual functions for each key
  langs.forEach((lang) => {
    const pluralLang = new Plurals(lang)

    const jsonFiles = getJsonFileNames(path.join(localesDir, lang))
    let messagesJson: Record<string, string> = {}
    for (const file of jsonFiles) {
      const filePath = path.join(localesDir, lang, file)
      const content = fs.readFileSync(filePath, 'utf8')
      const fileName = file.replace('.json', '')
      messagesJson = {
        ...messagesJson,
        ...flattenObjectToCamelCase(
          JSON.parse(content),
          '',
          fileName === 'messages' ? '' : fileName
        ),
      }
    }

    baseKeys.forEach((key) => {
      const functionName = arrayToCamelCase([lang, ...key.split(' ')])
      const isPlural = pluralLang.isPluralKey(key)

      if (isPlural) {
        const value = messagesJson[key]
        if (value) {
          pluralLang.storePluralKeyIfNeeded(key, value)
        }

        return
      }

      const value = messagesJson[key]
      if (!value) {
        errors.push(`Missing value for "${key}" in ${lang}`)
      }

      const content = `const ${functionName} = ${JSON.stringify(value)}`
      localeFunctions.push(content)

      const genericFunctionName = arrayToCamelCase(key.split(' '))
      stringKeys.push(genericFunctionName)
      const clientContentDefaultExport = `export default ${JSON.stringify(value)}`

      const propType = value ? generatePropTypes(value, genericFunctionName) : null
      if (propType && !propTypes[genericFunctionName]) {
        propTypes[genericFunctionName] = propType
        typeDefs.push(`export ${propType.content}`)
        localeFunctions.push(`import { ${propType.name} } from './types'`)
      }

      const hasProps = propType && genericFunctionName in propTypes
      const clientContent = `${clientContentDefaultExport}\n\nexport const args = ${
        hasProps
          ? `[${Object.keys(propType)
              .map((key) => `"${key}"`)
              .join(', ')}] as const`
          : 'null'
      }`

      fs.writeFileSync(
        path.join(clientOutputDir, lang, `${genericFunctionName}.tsx`),
        clientContent
      )

      langFunctions[genericFunctionName] ||= {}
      ;(langFunctions[genericFunctionName] as Record<string, string>)[lang] = functionName
    })

    const pluralKeysForLang = pluralLang.getPluralKeys()
    pluralLangKeys[lang] = pluralKeysForLang
  })

  if (errors.length > 0) {
    throw new Error(errors.join('\n') || 'Something wrong')
  }

  for (const lang of langs) {
    const {
      incompletePluralKeys,
      incompletePluralOrdinalKeys,
      unnecessaryPluralKeys,
      unnecessaryPluralOrdinalKeys,
    } = pluralLangKeys[lang as any]!

    Object.keys(incompletePluralKeys).forEach((key) => {
      const missingKeys = incompletePluralKeys[key]!
      console.warn(
        `WARNING: Missing plural rule keys for cardinal number in language "${lang}": ${missingKeys.map((m) => `${key}_${m}`).join(', ')}`
      )
    })

    Object.keys(incompletePluralOrdinalKeys).forEach((key) => {
      const missingKeys = incompletePluralOrdinalKeys[key]!
      console.warn(
        `WARNING: Missing plural rule keys for ordinal number in language "${lang}": ${missingKeys.map((m) => `${key}_ordinal_${m}`).join(', ')}`
      )
    })

    if (unnecessaryPluralKeys.length > 0) {
      console.warn(
        `WARNING: Unnecessary plural rule keys for cardinal number in language "${lang}": ${unnecessaryPluralKeys.join(', ')}`
      )
    }

    if (unnecessaryPluralOrdinalKeys.length > 0) {
      console.warn(
        `WARNING: Unnecessary plural rule keys for ordinal number in language "${lang}": ${unnecessaryPluralOrdinalKeys.join(', ')}`
      )
    }
  }

  // Generate locale functions
  Object.keys(langFunctions).forEach((key) => {
    const propType = propTypes[key]
    if (propType) {
      const functionBody = `
    export const ${key} = (lang: SupportedLanguage, data: ${propType.name}) => {
      let text = ''
      switch (lang) {
    ${langs.map((lang) => `case '${lang}': text = ${langFunctions[key]?.[lang]}; break;`).join('\n')}
        default:
            text = ${langFunctions[key]?.['en']}
        }

      return interpolateTemplate(text, data)
    }`

      localeFunctions.push(functionBody)
    } else {
      const functionBody = `export const ${key} = (lang: SupportedLanguage) => {
      switch (lang) {
    ${langs.map((lang) => `case '${lang}': return ${langFunctions[key]?.[lang]};`).join('\n')}
        default:
            return ${langFunctions[key]?.['en']}
        }
    }`

      localeFunctions.push(functionBody)
    }
  })

  // Handle plurals
  Object.keys(pluralLangKeys).forEach((lang) => {
    const { pluralKeys, pluralOrdinalKeys } = pluralLangKeys[lang as any]!

    const cardinalFunctionTemplate = `
export default function <<key>>WithCount(count: number) {
    const category = new Intl.PluralRules('<<lang>>').select(count);

    switch (category) {
       <<cases>>
        default:
            return "";
    }
}
    `

    const cardinalFunctionServerTemplate = `
    export function <<key>>WithCount(lang: SupportedLanguage, count: number) {
      let text = "";
  
      switch (lang) {
         <<cases>>
          default:
            break;
      }

      return interpolateTemplate(text, { count: \`$\{count}\` });
  }
    `

    Object.keys(pluralKeys).forEach((key) => {
      const functionBody = cardinalFunctionTemplate
        .replace(/<<key>>/g, key)
        .replace(/<<lang>>/g, lang)
        .replace(
          /<<cases>>/g,
          pluralKeys[key]!.map(([pluralRuleCat, value]) => {
            const valueToUse = `"${value}"`

            return `case '${pluralRuleCat}': return ${valueToUse};`
          }).join('\n')
        )

      fs.writeFileSync(path.join(clientOutputDir, lang, `${key}WithCount.tsx`), functionBody)
      stringKeys.push(`${key}WithCount`)

      const serverFunctionBody = cardinalFunctionServerTemplate
        .replace(/<<key>>/g, key)
        .replace(/<<lang>>/g, lang)
        .replace(
          /<<cases>>/g,
          langs
            .map((lang) => {
              const valueToUse = `${key}WithCount${capitalize(lang)}`

              return `case "${lang}": text = ${valueToUse}(count); break;`
            })
            .join('\n')
        )

      localeFunctions.push(
        `import ${key}WithCount${capitalize(lang)} from './client/${lang}/${key}WithCount'`,
        serverFunctionBody
      )
    })

    const ordinalFunctionTemplate = `
export default function <<key>>WithOrdinalCount(count: number) {
    const category = new Intl.PluralRules('<<lang>>',  { type: 'ordinal' }).select(count);

    switch (category) {
       <<cases>>
        default:
            return "";
    }
}
    `

    const ordinalFunctionServerTemplate = `
    export function <<key>>WithOrdinalCount(lang: SupportedLanguage, count: number) {
      let text = "";
  
      switch (lang) {
         <<cases>>
          default:
            break;
      }

      return interpolateTemplate(text, { count: \`$\{count}\` });
  }
    `

    Object.keys(pluralOrdinalKeys).forEach((key) => {
      const functionBody = ordinalFunctionTemplate
        .replace(/<<key>>/g, key)
        .replace(/<<lang>>/g, lang)
        .replace(
          /<<cases>>/g,
          pluralOrdinalKeys[key]!.map(([pluralRuleCat, value]) => {
            const valueToUse = `"${value}"`

            return `case '${pluralRuleCat}': return ${valueToUse};`
          }).join('\n')
        )

      fs.writeFileSync(path.join(clientOutputDir, lang, `${key}WithOrdinalCount.tsx`), functionBody)
      stringKeys.push(`${key}WithOrdinalCount`)

      const serverFunctionBody = ordinalFunctionServerTemplate
        .replace(/<<key>>/g, key)
        .replace(/<<lang>>/g, lang)
        .replace(
          /<<cases>>/g,
          langs
            .map((lang) => {
              const valueToUse = `${key}WithOrdinalCount${capitalize(lang)}`

              return `case "${lang}": text = ${valueToUse}(count); break;`
            })
            .join('\n')
        )

      localeFunctions.push(
        `import ${key}WithOrdinalCount${capitalize(lang)} from './client/${lang}/${key}WithOrdinalCount'`,
        serverFunctionBody
      )
    })
  })

  const uniqueStringKeys = [...new Set(stringKeys)]

  typeDefs.push(`export type StringKeys = ${uniqueStringKeys.map((k) => `'${k}'`).join(' | ')}`)

  if (Object.keys(propTypes).length > 0) {
    let argsProps = 'export type ArgsProps = '
    const x = Object.keys(propTypes)
      .map((key) => {
        return `${key}Props`
      })
      .join(' | ')

    argsProps += `${x}`

    typeDefs.push(argsProps)
  }

  const reorderedLocaleFunctions = localeFunctions.sort((a, b) => {
    return a.startsWith('import') ? -1 : b.startsWith('import') ? 1 : 0
  })
  // Write the server locale functions to a file (new: strings.ts)
  fs.writeFileSync(stringsOutputFile, [...new Set(reorderedLocaleFunctions)].join('\n'))
  // Write the server locale functions to a file (legacy: server.ts)
  // Add deprecation comments to every exported function in server.ts
  const deprecatedLocaleFunctions = [...new Set(reorderedLocaleFunctions)].map((line) => {
    if (line.trim().startsWith('export const ')) {
      const fnNameMatch = line.match(/export const (\w+)/)
      if (fnNameMatch) {
        return `/**\n * @deprecated Import from './strings' instead.\n */\n${line}`
      }
    }

    return line
  })
  fs.writeFileSync(outputFile, deprecatedLocaleFunctions.join('\n'))

  // Handle markdown files
  const mdxFiles = findMdxFiles(path.join(localesDir, '.'))
  const localesMarkdownContent: string[] = [
    `import { ComponentProps } from 'react';`,
    `import { SupportedLanguage } from './types';`,
  ]

  const langComponents: Record<string, Record<string, string>> = {}
  mdxFiles.forEach((filepath) => {
    const content = fs.readFileSync(filepath, 'utf8')
    const [lang, ...rest] = filepath
      .replace(localesDir, '')
      .split('/')
      .filter((p) => p.trim() !== '')
    const { componentName, componentString } = generateComponent(content, filepath, localesDir)

    const baseComponentName = componentNameFromFilepath(rest.join('/'))

    langComponents[baseComponentName] ||= {}
    ;(langComponents[baseComponentName] as Record<string, any>)[lang as string] = componentName
    localesMarkdownContent.push(componentString)
  })

  const importStatements: string[] = []
  const nonImportStatements: string[] = []

  localesMarkdownContent
    .join('\n')
    .split('\n')
    .forEach((content) => {
      if (content.startsWith('import')) {
        importStatements.push(content)
      } else {
        nonImportStatements.push(content)
      }
    })

  const baseComponents: string[] = []
  Object.keys(langComponents).forEach((componentName) => {
    const component = langComponents[componentName]
    const defaultComponent = langComponents[componentName]?.[baseLang]

    const text = `export const ${componentName} = (props: {lang: SupportedLanguage } & ComponentProps<typeof ${defaultComponent}>) => {
  const { lang } = props
  switch (lang) {${langs
    .map(
      (lang) => `
    case '${lang}':
      return <${component?.[lang]} {...props} />;`
    )
    .join('')}
    default:
      return <${defaultComponent} {...props} />
  }
}
`
    baseComponents.push(text)
  })

  const markdownComponentContent = [
    ...importStatements,
    ...nonImportStatements,
    ...baseComponents,
  ].join('\n')

  // Write the markdown components to a file
  fs.writeFileSync(markdownOutputFile, markdownComponentContent)

  // Generate hooks for using strings
  fs.writeFileSync(hooksOutputFile, hooks)

  // Write the type definitions to a file
  fs.writeFileSync(typeDefsOutputFile, typeDefs.join('\n'))

  // Write the common code to a file
  fs.writeFileSync(commonOutputFile, common.join('\n'))
}

const hooks = fs.readFileSync(path.join(dirName, 'hooks.template'), 'utf8')

export class Plurals {
  validCategories = ['few', 'many', 'one', 'two', 'zero', 'other']
  pluralRulesCategories = ['few', 'many', 'one', 'two', 'zero', 'other']
  pluralOrdinalRulesCategories = ['one', 'two', 'few', 'many', 'other']
  pluralRules
  pluralOrdinalRules
  pluralKeys: Record<string, Array<[string, string]>> = {}
  pluralOrdinalKeys: Record<string, Array<[string, string]>> = {}
  unnecessaryPluralKeys: string[] = []
  unnecessaryPluralOrdinalKeys: string[] = []

  constructor(lang: string) {
    this.pluralRules = new Intl.PluralRules(lang)
    this.pluralRulesCategories = this.pluralRules.resolvedOptions().pluralCategories
    this.pluralOrdinalRules = new Intl.PluralRules(lang, { type: 'ordinal' })
    this.pluralOrdinalRulesCategories = this.pluralOrdinalRules.resolvedOptions().pluralCategories
  }

  isPluralKey(key: string): boolean {
    const thePluralCat = key.split('_').at(-1)

    return Boolean(thePluralCat) && this.validCategories.includes(thePluralCat!)
  }

  storePluralKeyIfNeeded(key: string, value: string) {
    let pluralCat = null
    let baseKey = key
    const thePluralCat = key.split('_').at(-1)

    const isOrdinal = key.split('_').at(-2) === 'ordinal'

    if (isOrdinal) {
      for (const pluralRuleCat of this.pluralOrdinalRulesCategories) {
        if (thePluralCat === pluralRuleCat) {
          pluralCat = pluralRuleCat
          baseKey = key.split('_').slice(0, -2).join('_')
          break
        }
      }

      if (pluralCat) {
        if (!this.pluralOrdinalKeys[baseKey]) {
          this.pluralOrdinalKeys[baseKey] = []
        }

        this.pluralOrdinalKeys[baseKey]!.push([pluralCat, value])

        return true
      }

      if (thePluralCat && thePluralCat !== key) {
        this.unnecessaryPluralOrdinalKeys.push(key)
      }
    } else {
      for (const pluralRuleCat of this.pluralRulesCategories) {
        if (thePluralCat === pluralRuleCat) {
          pluralCat = pluralRuleCat
          baseKey = key.split('_').slice(0, -1).join('_')
          break
        }
      }

      if (pluralCat) {
        if (!this.pluralKeys[baseKey]) {
          this.pluralKeys[baseKey] = []
        }

        this.pluralKeys[baseKey]!.push([pluralCat, value])

        return true
      }

      if (thePluralCat && thePluralCat !== key) {
        this.unnecessaryPluralKeys.push(key)
      }
    }

    return false
  }

  getPluralKeys = () => {
    const pluralKeysWithMissingPluralRuleCategories: Record<string, string[]> = {}

    for (const key in this.pluralKeys) {
      if (Object.hasOwn(this.pluralKeys, key)) {
        const userProvidedPluralCategories = this.pluralKeys[key]!.flatMap(([a]) => a)
        const missing = []
        for (const pluralRuleCat of this.pluralRulesCategories) {
          if (
            userProvidedPluralCategories &&
            !userProvidedPluralCategories.includes(pluralRuleCat)
          ) {
            missing.push(pluralRuleCat)
          }
        }

        if (missing.length > 0) {
          pluralKeysWithMissingPluralRuleCategories[key] = missing
        }
      }
    }

    const pluralOrdinalKeysWithMissingPluralRuleCategories: Record<string, string[]> = {}

    for (const key in this.pluralOrdinalKeys) {
      if (Object.hasOwn(this.pluralOrdinalKeys, key)) {
        const userProvidedPluralCategories = this.pluralOrdinalKeys[key]!.flatMap(([a]) => a)
        const missing = []
        for (const pluralRuleCat of this.pluralOrdinalRulesCategories) {
          if (
            userProvidedPluralCategories &&
            !userProvidedPluralCategories.includes(pluralRuleCat)
          ) {
            missing.push(pluralRuleCat)
          }
        }

        if (missing.length > 0) {
          pluralOrdinalKeysWithMissingPluralRuleCategories[key] = missing
        }
      }
    }

    return {
      pluralKeys: this.pluralKeys,
      pluralOrdinalKeys: this.pluralOrdinalKeys,
      incompletePluralKeys: pluralKeysWithMissingPluralRuleCategories,
      unnecessaryPluralKeys: this.unnecessaryPluralKeys,
      incompletePluralOrdinalKeys: pluralOrdinalKeysWithMissingPluralRuleCategories,
      unnecessaryPluralOrdinalKeys: this.unnecessaryPluralOrdinalKeys,
    }
  }
}

function flattenObjectToCamelCase(obj: any, prefix = '', fileName = ''): Record<string, string> {
  const flattened: Record<string, string> = {}

  const toCamelCase = (str: string): string => {
    return str.replace(/[^a-zA-Z\d]+(.)/g, (_, chr: string) => chr.toUpperCase())
  }

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      if (
        key.endsWith('_ordinal_one') ||
        key.endsWith('_ordinal_two') ||
        key.endsWith('_ordinal_few') ||
        key.endsWith('_ordinal_other') ||
        key.endsWith('_ordinal_zero') ||
        key.endsWith('_one') ||
        key.endsWith('_two') ||
        key.endsWith('_few') ||
        key.endsWith('_other') ||
        key.endsWith('_zero')
      ) {
        const keyToUse =
          fileName.trim().length > 0
            ? `${toCamelCase(fileName)}${key.charAt(0).toUpperCase() + key.slice(1)}`
            : key
        flattened[keyToUse] = obj[key]
        continue
      }

      const camelCaseKey = toCamelCase(key)
      const prefixedKey =
        prefix.length > 0
          ? `${prefix}${camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1)}`
          : camelCaseKey

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObjectToCamelCase(obj[key], prefixedKey, fileName))
      } else {
        const keyToUse =
          fileName.trim().length > 0
            ? `${fileName}${prefixedKey.charAt(0).toUpperCase() + prefixedKey.slice(1)}`
            : prefixedKey
        flattened[keyToUse] = obj[key]
      }
    }
  }

  return flattened
}

const reservedKeywords = new Set<string>([
  // ECMAScript reserved keywords
  'abstract',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
  // TypeScript reserved keywords
  'any',
  'declare',
  'get',
  'module',
  'require',
  'number',
  'set',
  'string',
  'symbol',
  'type',
  'from',
  'of',
  // Other keywords
  'arguments',
  'eval',
  'undefined',
  'NaN',
  'Infinity',
])

function isReservedKeyword(word: string): boolean {
  return reservedKeywords.has(word)
}
