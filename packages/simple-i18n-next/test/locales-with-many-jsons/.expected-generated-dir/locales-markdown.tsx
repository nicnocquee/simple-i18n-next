import { type ComponentProps } from 'react';
import { type SupportedLanguage } from './types';
import DeIndexMarkdown from '../de/index.mdx';
import EnIndexMarkdown from '../en/index.mdx';
const DeIndex = (props: ComponentProps<typeof DeIndexMarkdown>) => <DeIndexMarkdown {...props} />;
const EnIndex = (props: ComponentProps<typeof EnIndexMarkdown>) => <EnIndexMarkdown {...props} />;
export const Index = (props: {lang: SupportedLanguage } & ComponentProps<typeof EnIndex>) => {
  const { lang } = props
  switch (lang) {
    case 'de':
      return <DeIndex {...props} />;
    case 'en':
      return <EnIndex {...props} />;
    default:
      return <EnIndex {...props} />
  }
}
