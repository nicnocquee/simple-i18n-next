export type SupportedLanguage = 'de' | 'en';
export const defaultLanguage: SupportedLanguage = 'de';
export const supportedLanguages: SupportedLanguage[] = ['de', 'en'];
export type greetingProps = {
  name: string;
}
export type welcomeProps = {
  country: string;
  time: string;
}
export type StringKeys = 'hello' | 'greeting' | 'home' | 'welcome' | 'appleWithCount' | 'catWithOrdinalCount'
export type ArgsProps = greetingProps | welcomeProps