/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import fs from 'node:fs'
import path from 'node:path'

// Capitalize the first letter of a string
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

function getDirectories(currentPath: string): string[] {
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
function arrayToCamelCase(arr: string[]): string {
  const expand = arr.flatMap((item) => {
    const makeItSafe = item.replace(/[^a-zA-Z\d]+/g, ' ')
    const split = makeItSafe.split(' ')
    const capitalized = split.map((word) => capitalize(word.toLowerCase()))
    return capitalized
  })
  const camelCase = expand.join('')
  return camelCase.charAt(0).toLowerCase() + camelCase.slice(1)
}

// Generate TypeScript prop types from a template string
function generatePropTypes(template: string, functionName: string) {
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
function componentNameFromFilepath(filepath: string) {
  const parts = filepath
    .split('/')
    .filter((p) => p.trim() !== '.')
    .map((p) => p.replace('.mdx', ''))
  const cameledCase = arrayToCamelCase(parts)
  return cameledCase.charAt(0).toUpperCase() + cameledCase.slice(1)
}

// Find all .mdx files recursively in a directory
function findMdxFiles(dir: string): string[] {
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
const generateComponent = (markdownContent: string, filepath: string, localesDir: string) => {
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
  const baseMessagesString = fs.readFileSync(
    path.join(localesDir, baseLang, 'messages.json'),
    'utf8'
  )
  const baseMessagesJson = JSON.parse(baseMessagesString)

  // Define the output directories and files
  const outputDir = outputDirPath
    ? path.resolve(outputDirPath)
    : path.resolve(localesDir, '.generated')

  const clientOutputDir = path.join(outputDir, 'client')
  const outputFile = path.join(outputDir, 'server.ts')
  const markdownOutputFile = path.join(outputDir, 'locales-markdown.tsx')
  const messagesFilename = 'messages.json'

  // Create output directories if they don't exist
  fs.mkdirSync(outputDir, { recursive: true })
  fs.mkdirSync(clientOutputDir, { recursive: true })
  langs.forEach((lang) => {
    fs.mkdirSync(path.join(clientOutputDir, lang), { recursive: true })
  })

  // Shared content for generated files
  const shared: string[] = [
    '// This file is auto-generated by generate-locale.ts\n',
    `export const interpolateTemplate = (text: string, data: Record<string, string>): string => {
    let theText = text
  
    theText = theText.replace(/{{\\s*(\\w+)\\s*}}/g, (match, key) => {
      return key in data ? data[key] : match
    })
  
    return theText
  }`,
    `export type SupportedLanguage = ${langs.map((lang) => `'${lang}'`).join(' | ')};
  export const defaultLanguage: SupportedLanguage = '${baseLang}';
  `,
  ]
  const localeFunctions: string[] = [...shared]

  const baseKeys = Object.keys(baseMessagesJson)
  const errors: string[] = []
  const langFunctions: Record<string, Record<string, string>> = {}
  const propTypes: Record<string, ReturnType<typeof generatePropTypes>> = {}
  const stringKeys: string[] = []

  // Process each language and generate corresponding functions
  langs.forEach((lang) => {
    const messagesString = fs.readFileSync(path.join(localesDir, lang, messagesFilename), 'utf8')
    const messagesJson = JSON.parse(messagesString)

    baseKeys.forEach((key) => {
      const functionName = arrayToCamelCase([lang, ...key.split(' ')])
      const value = messagesJson[key]
      if (!value) {
        errors.push(`Missing value for "${key}" in ${lang}`)
      }

      const content = `export const ${functionName} = ${JSON.stringify(value)}`
      localeFunctions.push(content)

      const genericFunctionName = arrayToCamelCase(key.split(' '))
      stringKeys.push(genericFunctionName)
      const clientContent = `export default ${JSON.stringify(value)}`
      fs.writeFileSync(
        path.join(clientOutputDir, lang, `${genericFunctionName}.tsx`),
        clientContent
      )

      const propType = generatePropTypes(value, genericFunctionName)
      if (propType && !propTypes[genericFunctionName]) {
        propTypes[genericFunctionName] = propType
      }

      langFunctions[genericFunctionName] ||= {}
      ;(langFunctions[genericFunctionName] as Record<string, string>)[lang] = functionName
    })
  })

  if (errors.length > 0) {
    throw new Error(errors.join('\n') || 'Something wrong')
  }

  // Generate locale functions
  Object.keys(langFunctions).forEach((key) => {
    const propType = propTypes[key]
    if (propType) {
      const functionBody = `
    ${propType.content}
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

  localeFunctions.push(`export type StringKeys = ${stringKeys.map((k) => `'${k}'`).join(' | ')}`)

  // Write the server locale functions to a file
  fs.writeFileSync(outputFile, localeFunctions.join('\n'))

  const mdxFiles = findMdxFiles(path.join(localesDir, '.'))
  const localesMarkdownContent: string[] = [`import { ComponentProps } from 'react';`]

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

  const importStatements: string[] = [...shared]
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
  const { lang, ...rest } = props
  switch (lang) {${langs
    .map(
      (lang) => `
    case '${lang}':
      return <${component?.[lang]} {...rest} />;`
    )
    .join('')}
    default:
      return <${defaultComponent} {...rest} />
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

  const hooksOutputFile = path.join(clientOutputDir, 'hooks.tsx')
  fs.writeFileSync(hooksOutputFile, hooks)
}

const hooks = `
import { StringKeys, SupportedLanguage, defaultLanguage } from "../server";
import { useState, useMemo, useEffect } from "react";

export const useStrings = <T extends StringKeys>(
  keys: T[],
  lang: SupportedLanguage = defaultLanguage
): Record<T, string> | null => {
  const [strings, setStrings] = useState<Record<T, string> | null>(null);

  const memoizedKeys = useMemo(() => keys, [...keys]);
  const memoizedLang = useMemo(() => lang, [lang]);

  useEffect(() => {
    let isCleanedup = false;
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadLocale() {
      try {
        const data = await Promise.all(
          memoizedKeys.map(async (key) => {
            const importedModule = await import(\`./\${memoizedLang}/\${key}.tsx\`);
            if (signal.aborted && !isCleanedup) return null;
            return { key, data: importedModule.default };
          })
        );

        if (!signal.aborted) {
          setStrings(
            data.reduce(
              (acc, cur) => (cur ? { ...acc, [cur.key]: cur.data } : acc),
              {} as Record<T, string>
            )
          );
        }
      } catch (error) {
        if (!isCleanedup) {
          if (signal.aborted) {
            console.log("Fetch aborted");
          } else {
            console.error("Error loading locale", error);
          }
        }
      }
    }

    loadLocale();

    return () => {
      isCleanedup = true;
      controller.abort();
    };
  }, [memoizedLang, memoizedKeys]);

  return strings;
};

`
