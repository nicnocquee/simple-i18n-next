export type SupportedLanguage = 'de' | 'en';
export const defaultLanguage: SupportedLanguage = 'en';
export const supportedLanguages: SupportedLanguage[] = ['de', 'en'];
export type greetingProps = {
  name: string;
}
export type StringKeys = 'hello' | 'greeting' | 'home' | 'pageTitle' | 'pageSectionTitle'
export type ArgsProps = greetingProps