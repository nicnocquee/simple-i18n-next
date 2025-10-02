export type SupportedLanguage = 'de' | 'fr';
export const defaultLanguage: SupportedLanguage = 'de';
export const supportedLanguages: SupportedLanguage[] = ['de', 'fr'];
export type youReceivedProps = {
  points: string;
  maxPoints: string;
}
export type StringKeys = 'wrong' | 'youReceived'
export type ArgsProps = youReceivedProps