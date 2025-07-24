import { interpolateTemplate } from './common';
import { SupportedLanguage } from './types';
const deHello = "Hallo Welt!"
const deGreeting = "Hallo {{name}}!"
const deHome = "Startseite"
const dePageTitle = "Seitentitel"
const dePageSectionTitle = "Sektionentitel"
const enHello = "Hello world!"
const enGreeting = "Hello {{name}}!"
const enHome = "Home"
const enPageTitle = "Page title"
const enPageSectionTitle = "Section title"
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
export const pageTitle = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return dePageTitle;
case 'en': return enPageTitle;
        default:
            return enPageTitle
        }
    }
export const pageSectionTitle = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return dePageSectionTitle;
case 'en': return enPageSectionTitle;
        default:
            return enPageSectionTitle
        }
    }