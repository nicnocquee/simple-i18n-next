import { type youReceivedProps } from './types'
import { interpolateTemplate } from './common';
import { type SupportedLanguage } from './types';
const deWrong = "Falsch !"
const deYouReceived = "Du erhälst <strong>{{points}}</strong> / <strong>{{maxPoints}}</strong> Punkten"
const frWrong = "Faux !"
const frYouReceived = "Tu as reçu <strong>{{points}}</strong> / <strong>{{maxPoints}}</strong> points"
export const wrong = (lang: SupportedLanguage) => {
      switch (lang) {
    case 'de': return deWrong;
case 'fr': return frWrong;
        default:
            return deWrong
        }
    }

    export const youReceived = (lang: SupportedLanguage, data: youReceivedProps) => {
      let text = ''
      switch (lang) {
    case 'de': text = deYouReceived; break;
case 'fr': text = frYouReceived; break;
        default:
            text = deYouReceived
        }

      return interpolateTemplate(text, data)
    }