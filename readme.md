# next-i18n

This is a CLI to generate TypeScript code from translation files in JSON format and Markdown files for [Next.js](https://nextjs.org/) projects.

## Why?

The existing solutions for internationalization (i18n) in Next.js are too complicated for my taste. There are too many things to set up, and many are not type-safe.

## Features

- The translations are type-safe. That means there will be build-time errors if you use a translation key that does not exist in a specific language.
- The translation keys are available for all languages. That means you will get an error message if you forget to add a translation for a specific language.
- In RSC, the translations are generated inline, so no JS code is sent to the client.
- In client components, if you use the generated `useStrings` hook, only the translation strings that you need will be sent to the client. There will be no unused translations sent to the client.
- You can use markdown files and use them as React components.

## How to use

To get started:

1. Create a `locales` directory in your Next.js project. This directory will contain the translation files in JSON format and Markdown files.
2. For each language you want to support, create a new directory in the `locales` directory. The name of the directory will be the language code. For example, if you want to support English, French, and Italian, you will create the following directories: `en`, `fr`, and `it`.
3. In each language directory, create a `messages.json` file. This file will contain the translations for the language. For example, you can create a `locales/en/messages.json` file that contains the following content:

```json
{
  "hello": "Hello",
  "welcome": "Welcome to {name}",
  "about": "About",
  "contact": "Contact",
  "coming_soon": "Coming soon"
}
```

and a `locales/de/messages.json` file that contains the following content:

```json
{
  "hello": "Hallo",
  "welcome": "Willkommen bei {name}",
  "about": "Über",
  "contact": "Kontakt",
  "coming_soon": "Bald kommen"
}
```

4. Inside each language directory, you can also add several markdown files. For example, you can create a `locales/en/about.mdx` file that contains the following content:

```mdx
# About

This is the about page.
```

and a `locales/de/about.mdx` file that contains the following content:

```mdx
# Über

Diese Seite ist die Übersicht.
```

5. Finally, run the `npx next-i18n` command in your project directory. This command will generate TypeScript code inside the `locales/.generated` directory that you can use in your Next.js project.

6. You might need to add the generated directory to your `tsconfig.json` file:

```json
{
  "include": ["locales/.generated/**/*"]
}
```

7. Add the generated directory to your `.gitignore` file:

```gitignore
locales/.generated
```

8. Update the package.json scripts to include the `next-i18n` command:

```json
{
  "scripts": {
    "generate-locales": "next-i18n -i ./locales",
    "dev": "npm run generate-locales && next dev",
    "build": "npm run generate-locales && next build",
    "start": "next start"
  }
}
```

## How to use the generated code

### In React Server Components (RSC)

You can use the generated code in your `page.tsx` by simply importing the generated function which corresponds to the key you want to use in your translation.

```tsx
import { hello, SupportedLanguage } from 'locales/.generated/server'

export default function HomePage({ params: { lang } }: { params: { lang: SupportedLanguage } }) {
  return <div>{hello(lang)}</div>
}
```

### In Client Components

There are two ways to use the translations in your client components:

1. Pass the required translations [from the server component to the client component as props](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#passing-props-from-server-to-client-components-serialization).

```tsx
// app/[lang]/comingsoon/coming-soon.tsx
'use client'

import { StringKeys, SupportedLanguage } from '@/locales/.generated/server'

export function ComingSoon({
  strings,
}: {
  strings: Pick<Record<StringKeys, string>, 'comingSoon' | 'hello'>
}) {
  return (
    <div>
      <h1>{strings.comingSoon}</h1>
      <p>{strings.hello}</p>
    </div>
  )
}

// app/[lang]/comingsoon/page.tsx
export default function ComingSoonPage({
  params: { lang },
}: {
  params: { lang: SupportedLanguage }
}) {
  return (
    <ComingSoon
      strings={{
        comingSoon: comingSoon(lang),
        hello: submitMessage(lang),
      }}
    />
  )
}
```

2. Or, you can also use the generated `useStrings` hook to get the translations in the client component.

```tsx
'use client'
import { useStrings } from '@/locales/.generated/client/hooks'

export default function HomePage() {
  const { hello, comingSoon } = useStrings(['hello', 'comingSoon']) // the keys are typed! You cannot pass an invalid key.

  return (
    <div>
      <h1>{comingSoon}</h1>
      <p>{hello}</p>
    </div>
  )
}
```

### The Markdown files

Let's say you have a `locales/en/index/section1.mdx` file that contains the following content:

```mdx
# Section 1

This is the first section.
```

And a `locales/de/index/section1.mdx` file that contains the following content:

```mdx
# Sektion 1

Dies ist die erste Sektion.
```

You can use the generated markdown component in your `page.tsx` file like this:

```tsx
// app/[lang]/page.tsx
import { SupportedLanguage } from '@/locales/.generated/server'
import { IndexSection1 } from 'locales/.generated/locales-markdown'

export default function HomePage({ params: { lang } }: { params: { lang: SupportedLanguage } }) {
  return (
    <div>
      <IndexSection1 lang={lang} />
    </div>
  )
}
```

Please make sure that you have set up your Next.js project to use Markdown and MDX by following the [official documentation](https://nextjs.org/docs/app/building-your-application/configuring/mdx).

## Install

```bash
npm i -g next-i18n
```

Or you can run the command directly:

```shell
npx next-i18n -i ./locales
```

## CLI

```
  Usage
    $ next-i18n [input]

  Options
    --input, -i <type> The path to the locales directory.  [Default: ./locales]

  Examples
    $ next-i18n -i ./locales
```

## Development

Run

```bash
npx tsx source/cli.tsx -i "./__tests__/.env"
```

## License

MIT

## Contact

[Nico Prananta](https://twitter.com/2co_p)
