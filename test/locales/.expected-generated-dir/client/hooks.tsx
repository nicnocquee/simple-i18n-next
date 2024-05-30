import { interpolateTemplate } from "../common";
import { SupportedLanguage, defaultLanguage, StringKeys } from '../types';
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
export const useStrings = <T extends StringKeys>(
  keys: T[],
  lang: SupportedLanguage = defaultLanguage
): [
  Record<Identity<StringKeysWithoutCount<T>>, string> | null,
  Record<StringKeysWithCount<T>, WithCountFunc> | null
] => {
  const [strings, setStrings] = useState<Record<
    Identity<StringKeysWithoutCount<T>>,
    string
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
            return { key, data: importedModule.default };
          })
        );

        if (signal.aborted) return;

        const strings = data
          .filter(
            (d) =>
              d &&
              !d.key.endsWith("WithCount") &&
              !d.key.endsWith("WithOrdinalCount")
          )
          .reduce(
            (acc, cur) => (cur ? { ...acc, [cur.key]: cur.data } : acc),
            {} as Record<Identity<StringKeysWithoutCount<T>>, string>
          );

        const plurals = data
          .filter(
            (d) =>
              d &&
              (d.key.endsWith("WithCount") ||
                d.key.endsWith("WithOrdinalCount"))
          )
          .reduce(
            (acc, cur) =>
              cur
                ? {
                    ...acc,
                    [cur.key]: (count: number): string => {
                      return interpolateTemplate(cur.data(count), {
                        count: `${count}`,
                      });
                    },
                  }
                : acc,
            {} as Record<StringKeysWithCount<T>, WithCountFunc>
          );

        setStrings(strings);
        setPlurals(plurals);
      } catch (error) {
        if (!isCleanedup) {
          signal.aborted
            ? console.log("Fetch aborted")
            : console.error("Error loading locale", error);
        }
      }
    }

    loadLocale();

    return () => {
      isCleanedup = true;
      controller.abort();
    };
  }, [memoizedLang, memoizedKeys]);

  return [strings, plurals] as const;
};
