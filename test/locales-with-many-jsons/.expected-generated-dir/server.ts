import anotherFileCounterWithCountEn from './client/en/anotherFileCounterWithCount'
import anotherFileCounterWithCountDe from './client/de/anotherFileCounterWithCount'
import { type somethingGreetingProps } from './types'
import { type greetingProps } from './types'
import { type anotherFileClientAnotherByeProps } from './types'
import { type anotherFileGreetingProps } from './types'
import { interpolateTemplate } from './common';
import { type SupportedLanguage } from './types';
const deAnotherFileHello = "Hallo Welt in anderes Datei!"
const deAnotherFileGreeting = "Hallo, anderes Datei {{name}}!"
const deAnotherFileHome = "Startseite anderes Datei"
const deAnotherFileClientHello = "Hallo Welt in einer anderen Client-Datei!"
const deAnotherFileClientAnotherBye = "auf Wiedersehen, {{name}}"
const deHello = "Hallo Welt!"
const deGreeting = "Hallo {{name}}!"
const deHome = "Startseite"
const deSomethingHello = "Hallo Welt in etwas!"
const deSomethingGreeting = "Hallo, etwas {name}!"
const deSomethingHome = "Startseite etwas"
const enAnotherFileHello = "Hello world in another file!"
const enAnotherFileGreeting = "Hello, another file {{name}}!"
const enAnotherFileHome = "Home another file"
const enAnotherFileClientHello = "Hello world in another client file!"
const enAnotherFileClientAnotherBye = "bye, {{name}}"
const enHello = "Hello world!"
const enGreeting = "Hello {{name}}!"
const enHome = "Home"
const enSomethingHello = "Hello world in something!"
const enSomethingGreeting = "Hello, something {{name}}!"
const enSomethingHome = "Home something"
/**
 * @deprecated Import from './strings' instead.
 */
export const anotherFileHello = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deAnotherFileHello;
case 'en': return enAnotherFileHello;
        default:
            return enAnotherFileHello
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */

    export const anotherFileGreeting = (lang: SupportedLanguage, data: anotherFileGreetingProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deAnotherFileGreeting; break;
case 'en': text = enAnotherFileGreeting; break;
        default:
            text = enAnotherFileGreeting
        }

      return interpolateTemplate(text, data)
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const anotherFileHome = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deAnotherFileHome;
case 'en': return enAnotherFileHome;
        default:
            return enAnotherFileHome
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const anotherFileClientHello = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deAnotherFileClientHello;
case 'en': return enAnotherFileClientHello;
        default:
            return enAnotherFileClientHello
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */

    export const anotherFileClientAnotherBye = (lang: SupportedLanguage, data: anotherFileClientAnotherByeProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deAnotherFileClientAnotherBye; break;
case 'en': text = enAnotherFileClientAnotherBye; break;
        default:
            text = enAnotherFileClientAnotherBye
        }

      return interpolateTemplate(text, data)
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const hello = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deHello;
case 'en': return enHello;
        default:
            return enHello
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */

    export const greeting = (lang: SupportedLanguage, data: greetingProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deGreeting; break;
case 'en': text = enGreeting; break;
        default:
            text = enGreeting
        }

      return interpolateTemplate(text, data)
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const home = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deHome;
case 'en': return enHome;
        default:
            return enHome
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const somethingHello = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deSomethingHello;
case 'en': return enSomethingHello;
        default:
            return enSomethingHello
        }
    }
/**
 * @deprecated Import from './strings' instead.
 */

    export const somethingGreeting = (lang: SupportedLanguage, data: somethingGreetingProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deSomethingGreeting; break;
case 'en': text = enSomethingGreeting; break;
        default:
            text = enSomethingGreeting
        }

      return interpolateTemplate(text, data)
    }
/**
 * @deprecated Import from './strings' instead.
 */
export const somethingHome = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deSomethingHome;
case 'en': return enSomethingHome;
        default:
            return enSomethingHome
        }
    }

    export function anotherFileCounterWithCount(lang: SupportedLanguage, count: number) {
      let text = "";
  
      switch (lang) {
         case "de": text = anotherFileCounterWithCountDe(count); break;
case "en": text = anotherFileCounterWithCountEn(count); break;
          default:
            break;
      }

      return interpolateTemplate(text, { count: `${count}` });
  }
    