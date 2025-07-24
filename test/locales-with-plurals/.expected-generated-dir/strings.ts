import catWithOrdinalCountEn from './client/en/catWithOrdinalCount'
import appleWithCountEn from './client/en/appleWithCount'
import catWithOrdinalCountDe from './client/de/catWithOrdinalCount'
import appleWithCountDe from './client/de/appleWithCount'
import { interpolateTemplate } from './common';
import { SupportedLanguage } from './types';
const deHello = "Hallo Welt!"
const deGreeting = "Hallo {{name}}!"
const deHome = "Startseite"
const enHello = "Hello world!"
const enGreeting = "Hello {{name}}!"
const enHome = "Home"
export const hello = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deHello;
case 'en': return enHello;
        default:
            return enHello
        }
    }

    type greetingProps = {
  name: string;
}
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
export const home = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deHome;
case 'en': return enHome;
        default:
            return enHome
        }
    }

    export function appleWithCount(lang: SupportedLanguage, count: number) {
      let text = "";
  
      switch (lang) {
         case "de": text = appleWithCountDe(count); break;
case "en": text = appleWithCountEn(count); break;
          default:
            break;
      }

      return interpolateTemplate(text, { count: `${count}` });
  }
    

    export function catWithOrdinalCount(lang: SupportedLanguage, count: number) {
      let text = "";
  
      switch (lang) {
         case "de": text = catWithOrdinalCountDe(count); break;
case "en": text = catWithOrdinalCountEn(count); break;
          default:
            break;
      }

      return interpolateTemplate(text, { count: `${count}` });
  }
    