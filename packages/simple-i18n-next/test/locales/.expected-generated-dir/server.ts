import { type welcomeProps } from './types'
import { type greetingProps } from './types'
import { interpolateTemplate } from './common';
import { type SupportedLanguage } from './types';
const deHello = "Hallo Welt!"
const deGreeting = "Hallo {{name}}!"
const deHome = "Startseite"
const deWelcome = "Willkommen in {{country}}! Es ist {{time}} jetzt."
const enHello = "Hello world!"
const enGreeting = "Hello {{name}}!"
const enHome = "Home"
const enWelcome = "Welcome to {{country}}! It's {{time}} now."
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

    export const welcome = (lang: SupportedLanguage, data: welcomeProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deWelcome; break;
case 'en': text = enWelcome; break;
        default:
            text = enWelcome
        }

      return interpolateTemplate(text, data)
    }