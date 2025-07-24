export type SupportedLanguage = 'de' | 'en';
export const defaultLanguage: SupportedLanguage = 'en';
export const supportedLanguages: SupportedLanguage[] = ['de', 'en'];
export type anotherFileGreetingProps = {
  name: string;
}
export type anotherFileClientAnotherByeProps = {
  name: string;
}
export type greetingProps = {
  name: string;
}
export type somethingGreetingProps = {
  name: string;
}
export type StringKeys = 'anotherFileHello' | 'anotherFileGreeting' | 'anotherFileHome' | 'anotherFileClientHello' | 'anotherFileClientAnotherBye' | 'hello' | 'greeting' | 'home' | 'somethingHello' | 'somethingGreeting' | 'somethingHome' | 'anotherFileCounterWithCount'
export type ArgsProps = anotherFileGreetingProps | anotherFileClientAnotherByeProps | greetingProps | somethingGreetingProps