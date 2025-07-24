
export default function catWithOrdinalCount(count: number) {
    const category = new Intl.PluralRules('en',  { type: 'ordinal' }).select(count);

    switch (category) {
       case 'one': return "1st cat";
case 'two': return "2nd cat";
case 'few': return "3rd cat";
case 'other': return "{{count}}th cat";
        default:
            return "";
    }
}
    