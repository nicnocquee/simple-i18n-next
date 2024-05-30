import { ComponentProps } from 'react';
import { SupportedLanguage } from './types';
import DedIndexMarkdown from '../ded/index.mdx';
import EnIndexMarkdown from '../en/index.mdx';
const DedIndex = (props: ComponentProps<typeof DedIndexMarkdown>) => <DedIndexMarkdown {...props} />;
const EnIndex = (props: ComponentProps<typeof EnIndexMarkdown>) => <EnIndexMarkdown {...props} />;
export const Index = (props: {lang: SupportedLanguage } & ComponentProps<typeof EnIndex>) => {
  const { lang } = props
  switch (lang) {
    case 'en':
      return <EnIndex {...props} />;
    default:
      return <EnIndex {...props} />
  }
}
