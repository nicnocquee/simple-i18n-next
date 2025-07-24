export type SupportedLanguage = 'en';
export const defaultLanguage: SupportedLanguage = 'en';
export const supportedLanguages: SupportedLanguage[] = ['en'];
export type greetingProps = {
  name: string;
}
export type StringKeys = 'hello' | 'greeting' | 'home'
export type ArgsProps = greetingProps