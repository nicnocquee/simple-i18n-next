import { greetingProps } from './types'
import { interpolateTemplate } from './common';
import { SupportedLanguage } from './types';
const enHello = "Hello world!"
const enGreeting = "Hello {{name}}!"
const enHome = "Home"
/**
 * @deprecated Import from './strings' instead.
 */
export const hello = (lang: SupportedLanguage) => {
      switch (lang) {
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
    case 'en': return enHome;
        default:
            return enHome
        }
    }