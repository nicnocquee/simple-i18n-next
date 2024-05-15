
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
              const importedModule = await import(`./${memoizedLang}/${key}.tsx`);
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
  
