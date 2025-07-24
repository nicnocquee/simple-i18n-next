import { interpolateTemplate } from "../common";
import {
  type SupportedLanguage,
  defaultLanguage,
  type StringKeys,
  type ArgsProps,
} from "../types";
import { useState, useMemo, useEffect } from "react";

type Identity<T> = T extends object ? { [K in keyof T]: T[K] } : T;
type StringKeysWithoutCount<T> = Exclude<
  T,
  `${string}WithCount` | `${string}WithOrdinalCount`
>;
type StringKeysWithCount<T> = Extract<
  T,
  `${string}WithCount` | `${string}WithOrdinalCount`
>;
type WithCountFunc = (count: number) => string;
type WithArgsFunc = (args: ArgsProps) => string;
export const useStrings = <T extends StringKeys>(
  keys: T[],
  lang: SupportedLanguage = defaultLanguage
): [
  Record<Identity<StringKeysWithoutCount<T>>, string> | null,
  Record<StringKeysWithCount<T>, WithCountFunc> | null,
  Record<Identity<StringKeysWithoutCount<T>>, WithArgsFunc> | null
] => {
  const [strings, setStrings] = useState<Record<
    Identity<StringKeysWithoutCount<T>>,
    string
  > | null>(null);
  const [stringsWithArgs, setStringsWithArgs] = useState<Record<
    Identity<StringKeysWithoutCount<T>>,
    WithArgsFunc
  > | null>(null);
  const [plurals, setPlurals] = useState<Record<
    StringKeysWithCount<T>,
    WithCountFunc
  > | null>(null);

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
            const importedModule = await import(`./${memoizedLang}/${key}.tsx`);
            if (signal.aborted && !isCleanedup) return null;
            return {
              key,
              data: importedModule.default,
              args: importedModule.args,
            };
          })
        );

        if (signal.aborted) return;

        const strings = data.reduce((acc, cur) => {
          if (
            !(
              cur &&
              !cur.key.endsWith("WithCount") &&
              !cur.key.endsWith("WithOrdinalCount") &&
              !cur.args
            )
          )
            return acc;
          return cur ? { ...acc, [cur.key]: cur.data } : acc;
        }, {} as Record<Identity<StringKeysWithoutCount<T>>, string>);

        const stringsWithArgs = data.reduce((acc, cur) => {
          if (
            !(
              cur &&
              !cur.key.endsWith("WithCount") &&
              !cur.key.endsWith("WithOrdinalCount") &&
              cur.args
            )
          )
            return acc;
          return cur
            ? {
                ...acc,
                [cur.key]: (args: Record<(typeof cur.args)[number], string>) =>
                  interpolateTemplate(cur.data, args),
              }
            : acc;
        }, {} as Record<Identity<StringKeysWithoutCount<T>>, WithArgsFunc>);

        const plurals = data.reduce((acc, cur) => {
          if (
            !(
              cur &&
              (cur.key.endsWith("WithCount") ||
                cur.key.endsWith("WithOrdinalCount"))
            )
          )
            return acc;
          return cur
            ? {
                ...acc,
                [cur.key]: (count: number): string => {
                  return interpolateTemplate(cur.data(count), {
                    count: `${count}`,
                  });
                },
              }
            : acc;
        }, {} as Record<StringKeysWithCount<T>, WithCountFunc>);

        setStrings(strings);
        setStringsWithArgs(stringsWithArgs);
        setPlurals(plurals);
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

  return [strings, plurals, stringsWithArgs] as const;
};
