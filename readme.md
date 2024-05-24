# simple-i18n-next [BETA]

This is a CLI to generate TypeScript code from translation files in JSON format and Markdown files for [Next.js](https://nextjs.org/) projects.

_Note that this CLI is still WIP. It means every update might break your project._

## Why?

The existing solutions for internationalization (i18n) in Next.js are too complicated for my taste. There are too many things to set up, and many are not type-safe.

## Features

- Type safe translation. That means there will be build-time errors if you use a translation key that does not exist in a specific language.
- Translation keys cover all languages. As a result, an error message will appear if a translation for a specific language is not added.
- In RSC, the translations are generated inline, so no JS code is sent to the client.
- Only necessary translations are sent. When using the generated `useStrings` hook in client components, only the required translation strings are sent, avoiding any unused translations.
- You can use markdown files for each language.
- Pluralization support.
- Nested keys are supported.
- Multiple JSON files are supported.

## Install

```bash
npm i -g simple-i18n-next
```

Or you can run the command directly:

```shell
npx simple-i18n-next -i ./locales
```

## CLI

```
  Usage
    $ simple-i18n-next [input]

  Options
    --input, -i <type> The path to the locales directory.  [Default: ./locales]
    --default-language, -l <type> The default language to use.  [Default: the first directory in the locales directory]
    --output, -o <type> The path to the output directory.  [Default: ./locales/.generated]
    --silent, -s <type> Do not show any output.  [Default: false]

  Examples
    $ simple-i18n-next -i ./locales
```

## How to use

To get started:

1. Create a `locales` directory in your Next.js project. This directory will contain the translation files in JSON format and Markdown files.
2. For each language you want to support, create a new directory in the `locales` directory. The name of the directory must be one of the [valid language codes](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry). For example, if you want to support English, French, and Italian, you will create the following directories: `en`, `fr`, and `it`.
3. In each language directory, create a `messages.json` file. This file will contain the translations for the language. For example, you can create a `locales/en/messages.json` file that contains the following content:

```json
{
  "hello": "Hello",
  "welcome": "Welcome to {{name}}",
  "about": "About",
  "contact": "Contact",
  "coming_soon": "Coming soon"
}
```

and a `locales/de/messages.json` file that contains the following content:

```json
{
  "hello": "Hallo",
  "welcome": "Willkommen bei {{name}}",
  "about": "Über",
  "contact": "Kontakt",
  "coming_soon": "Bald kommen"
}
```

You can also add multiple JSON files in the same directory. For example, you can also have a `locales/en/client.json` file that contains the following content:

```json
{
  "hello": "Hello",
  "welcome": "Welcome to {{name}}",
  "about": "About",
  "contact": "Contact",
  "coming_soon": "Coming soon"
}
```

If you do, you need to add the corresponding files in the other language directories.

Note that you can have the same keys in different JSON files.

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

5. Finally, run the `npx simple-i18n-next` command in your project directory. This command will generate TypeScript code inside the `locales/.generated` directory that you can use in your Next.js project.

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

8. Update the package.json scripts to include the `simple-i18n-next` command:

```json
{
  "scripts": {
    "generate-locales": "simple-i18n-next -i ./locales -l en",
    "dev": "npm run generate-locales && next dev",
    "build": "npm run generate-locales && next build",
    "start": "next start"
  }
}
```

Note that if you don't specify the default language with the `-l` flag, the first directory in the `locales` directory will be used as the default language.

## How to use the generated code

### Camel case convention

Every key in the JSON files is converted to camel case convention. When the keys are from the default `messages.json` file, they are not prefixed with the file name. For example, if you have the following `locales/en/messages.json` file:

```json
{
  "hello": "Hello"
}
```

it will be converted to the following TypeScript code:

```typescript
export const hello = (lang: SupportedLanguage) => {
  // content
}
```

When the keys are from other JSON files, the file name is prefixed to the key. For example, if you have the following `locales/en/client.json` file:

```json
{
  "hello": "Hello"
}
```

it will be converted to the following TypeScript code:

```typescript
export const clientHello = (lang: SupportedLanguage) => {
  // content
}
```

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
  const [{ hello, comingSoon }] = useStrings(['hello', 'comingSoon']) // the keys are typed! You cannot pass an invalid key.

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

### Interpolation

In the `messages.json` file, you can use interpolation by using the `{{variable_name}}` syntax. For example, you can create a `locales/en/messages.json` file that contains the following content:

```json
{
  "hello": "Hello, {{name}}!"
}
```

In the `page.tsx` file, you can use the interpolated variable like this:

```tsx
// app/[lang]/page.tsx
import { hello, SupportedLanguage } from 'locales/.generated/server'

export default function HomePage({ params: { lang } }: { params: { lang: SupportedLanguage } }) {
  return <div>{hello(lang, { name: 'Nico' })}</div>
}
```

The generated function is fully typed so you have to pass the correct variable name to the function as shown above.

In a client component, you can use the interpolated variable like this:

```tsx
'use client'
import { interpolateTemplate } from '@/locales/.generated/server'

export default function ClientComponent() {
  const [strings] = useStrings(['bye', 'home'])
  if (!strings) return null
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>{interpolateTemplate(strings.bye, { name: 'John' })}</h1>
      <Link href={`/`}>{strings.home}</Link>
    </div>
  )
}
```

In the markdown file, you can use the interpolated variable like this:

```mdx
# About

This is the about page. My name is {props.name}
```

Then in the `page.tsx` file, you can use the markdown component like this:

```tsx
// app/[lang]/page.tsx
import { SupportedLanguage } from '@/locales/.generated/server'
import { About } from 'locales/.generated/locales-markdown'

export default function HomePage({ params: { lang } }: { params: { lang: SupportedLanguage } }) {
  return (
    <div>
      <About lang={lang} name="Nico" />
    </div>
  )
}
```

### Plurals

This CLI also generates code for plurals for both [ordinal and cardinal numbers](https://en.wikipedia.org/wiki/Ordinal_numeral). You need to add one of the following suffixes to let the script know that you want to use plurals: `_one`, `_two`, `_few`, `_many`, `_other`, or `_zero` for cardinal numbers, and `_ordinal_one`, `_ordinal_two`, `_ordinal_few`, `_ordinal_many`, `_ordinal_other`, or `_ordinal_zero` for ordinal numbers. You can read more about these plural rules from the [CLDR website](https://cldr.unicode.org/index/cldr-spec/plural-rules).

For example, you can create a `locales/en/messages.json` file that contains the following content:

```json:locales/en/messages.json
{
  "book_one": "One book",
  "book_other": "{{count}} books",
  "movie_ordinal_one": "1st movie",
  "movie_ordinal_two": "2nd movie",
  "movie_ordinal_few": "3rd movie",
  "movie_ordinal_other": "{{count}}th movie"
}
```

and a `locales/de/messages.json` file that contains the following content:

```json:locales/de/messages.json
{
  "book_one": "Ein Buch",
  "book_other": "{{count}} Bücher",
  "movie_ordinal_other": "{{count}}. Film"
}
```

Then in the RSC component like `page.tsx`, you can use the generated function like this:

```tsx:page.tsx
import {
  SupportedLanguage,
  bookWithCount,
  movieWithOrdinalCount,
} from "@/locales/.generated/server";
export default function Home({
  params: { lang },
}: Readonly<{ params: { lang: SupportedLanguage } }>) {
  return (
    <main>
      <div>
        <p>{movieWithOrdinalCount(lang, 1)}</p>
        <p>{movieWithOrdinalCount(lang, 2)}</p>
        <p>{movieWithOrdinalCount(lang, 3)}</p>
        <p>{movieWithOrdinalCount(lang, 4)}</p>
        <p>{movieWithOrdinalCount(lang, 5)}</p>
      </div>
      <div>
        <p>{bookWithCount(lang, 1)}</p>
        <p>{bookWithCount(lang, 2)}</p>
        <p>{bookWithCount(lang, 3)}</p>
        <p>{bookWithCount(lang, 4)}</p>
        <p>{bookWithCount(lang, 5)}</p>
      </div>
    </main>
  )
}
```

which will render the following HTML when the language is German (`de`):

```html
<main>
  <div>
    <p>1. Film</p>
    <p>2. Film</p>
    <p>3. Film</p>
    <p>4. Film</p>
    <p>5. Film</p>
  </div>
  <div>
    <p>1 Buch</p>
    <p>2 Bücher</p>
    <p>3 Bücher</p>
    <p>4 Bücher</p>
    <p>5 Bücher</p>
  </div>
</main>
```

and when the language is English (`en`):

```html
<main>
  <div>
    <p>1st movie</p>
    <p>2nd movie</p>
    <p>3rd movie</p>
    <p>4th movie</p>
    <p>5th movie</p>
  </div>
  <div>
    <p>One book</p>
    <p>2 books</p>
    <p>3 books</p>
    <p>4 books</p>
    <p>5 books</p>
  </div>
</main>
```

In a client component, you can use the generated function like this:

```tsx:client/page.tsx
"use client";

import { useStrings } from "@/locales/.generated/client/hooks";

export default function ClientComponent() {
  const lang = useSelectedLanguageFromPathname();
  const [, plurals] = useStrings(
    [
      "bookWithCount",
      "movieWithOrdinalCount",
    ],
    lang
  );
  if (!plurals) return null;
  return (
    <div>
      <div>
        <p>{plurals.bookWithCount(1)}</p>
        <p>{plurals.bookWithCount(2)}</p>
        <p>{plurals.bookWithCount(3)}</p>
        <p>{plurals.bookWithCount(4)}</p>
        <p>{plurals.bookWithCount(5)}</p>
      </div>

      <div>
        <p>{plurals.movieWithOrdinalCount(1)}</p>
        <p>{plurals.movieWithOrdinalCount(2)}</p>
        <p>{plurals.movieWithOrdinalCount(3)}</p>
        <p>{plurals.movieWithOrdinalCount(4)}</p>
        <p>{plurals.movieWithOrdinalCount(5)}</p>
      </div>
    </div>
  )
}
```

Note that the plural rules for cardinal and ordinal numbers for a given language can be different. For example, in English, the plural rule for cardinal numbers is `one` and `other`, while the plural rule for ordinal numbers is `one`, `two`, `few`, and `other`. On the other hand, in German, the plural rule for cardinal numbers is `one` and `other`, while the plural rule for ordinal numbers is only `other`.

You can find out the plural rules for a given language by executing the following statement in the Node.js REPL or browser console:

```javascript
// plural rules for ordinal numbers in German
new Intl.PluralRules('de', { type: 'ordinal' }).resolvedOptions().pluralCategories
// plural rules for cardinal numbers in German
new Intl.PluralRules('de').resolvedOptions().pluralCategories
```

### Nested keys

You can use nested keys in your `messages.json` file. The keys are converted to camelCase convention. For example, if you have the following `locales/en/messages.json` file:

```json
{
  "page": {
    "title": "Page title",
    "section": {
      "title": "Section title"
    }
  }
}
```

and a `locales/de/messages.json` file that contains the following content:

```json
{
  "page": {
    "title": "Seitentitel",
    "section": {
      "title": "Sektionentitel"
    }
  }
}
```

Then in your React component, you can use the nested key like this:

```tsx
import { pageTitle, pageSectionTitle } from 'locales/.generated/server'

export default function HomePage({ params: { lang } }: { params: { lang: SupportedLanguage } }) {
  return (
    <div>
      <h1>{pageTitle(lang)}</h1>
      <h2>{pageSectionTitle(lang)}</h2>
    </div>
  )
}
```

## Example

You can checkout the sample Next.js project that uses this CLI [in this repository](https://github.com/nicnocquee/simple-i18n-next-example).

## API

### Generated constants and functions

The generated constants and functions are using camelCase convention. For example, if you have the followng `locales/en/messages.json` file:

```json
{
  "hello": "Hello world!",
  "greeting": "Hello {name}!",
  "home": "Home",
  "world-cup": "World cup"
}
```

the CLI will generate the following:

```typescript
export type StringKeys = 'hello' | 'greeting' | 'home' | 'worldCup'

export const worldCup = (lang: SupportedLanguage) => {
  // content
}

export const hello = (lang: SupportedLanguage) => {
  // content
}

export const greeting = (lang: SupportedLanguage) => {
  // content
}

export const home = (lang: SupportedLanguage) => {
  // content
}
```

For the plural keys, the CLI will generate functions with the format: `<key>WithCount` for cardinal numbers and `<key>WithOrdinalCount` for ordinal numbers. For example, if you have the following `locales/en/messages.json` file:

```json
{
  "apple_one": "An apple",
  "apple_other": "{{count}} apples",
  "cat_ordinal_one": "1st cat",
  "cat_ordinal_two": "2nd cat",
  "cat_ordinal_few": "3rd cat",
  "cat_ordinal_other": "{{count}}th cat"
}
```

Then the CLI will generate the following:

```typescript
export const appleWithCount = (count: number) => {
  // content
}

export const catWithOrdinalCount = (count: number) => {
  // content
}
```

### useStrings

`useStrings` is a custom React hook so you can only use it in a client component.

Parameters:

- `keys`: An array of string keys to be used in the component. The keys can only be those defined in `StringKeys`. If you pass unknown keys, TypeScript will throw an error.
- `lang`: The language code to use for the translations. The value should be one of the supported language codes.

Returns a tuple:

- `strings`: An array of translated strings, excluding the plural keys.
- `plurals`: An array of functions that can be used to translate the plural keys.

Example:

You have `locales/en/messages.json` and `locales/de/messages.json` files that contain the translations for the language like this:

```json
{
  "hello": "Hello",
  "greeting": "Hello {name}!",
  "apple_one": "An apple",
  "apple_other": "{{count}} apples",
  "cat_ordinal_one": "1st cat",
  "cat_ordinal_two": "2nd cat",
  "cat_ordinal_few": "3rd cat",
  "cat_ordinal_other": "{{count}}th cat"
}
```

```json
{
  "hello": "Hallo",
  "greeting": "Hallo {name}!",
  "apple_one": "Ein Apfel",
  "apple_other": "{{count}} Äpfel",
  "cat_ordinal_other": "1. Katze"
}
```

Then in the client component, you can use the `useStrings` hook like this:

```tsx
import { useStrings } from '@/locales/.generated/client/hooks'

export default function ClientComponent() {
  const lang = useSelectedLanguageFromPathname()
  const [strings, plurals] = useStrings(
    [
      'hello',
      'greeting',
      'appleWithCount',
      'catWithOrdinalCount',
    ],
    lang
  )
  if (!strings) return null
  if (!plurals) return null
  return (
    <div>
      <h1>{strings.hello}</h1>
      <p>{strings.greeting({name: 'John'})}</p>
      <p>{plurals.appleWithCount(1)}</p>
      <p>{plurals.appleWithCount(2)}</p>
      <p>{plurals.appleWithCount(3)}</p>
      <p>{plurals.appleWithCount(4)}</p>
      <p>{plurals.appleWithCount(5)}</p>
      <p>{plurals.catWithOrdinalCount(1)}</p>
      <p>{plurals.catWithOrdinalCount(2)}</p>
      <p>{plurals.catWithOrdinalCount(3)}</p>
      <p>{plurals.catWithOrdinalCount(4)}</p>
      <p>{plurals.catWithOrdinalCount(5)}</p>
    </div>
  )
```

## Development

Run

```bash
npx tsx source/cli.tsx -i "./locales"
```

## License

MIT

## Contact

[Nico Prananta](https://twitter.com/2co_p)
