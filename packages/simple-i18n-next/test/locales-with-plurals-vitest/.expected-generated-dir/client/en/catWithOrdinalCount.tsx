
export default function catWithOrdinalCount(count: number) {
    const category = new Intl.PluralRules('en',  { type: 'ordinal' }).select(count);

    switch (category) {
       case 'other': return "{{count}}th cat";
        default:
            return "";
    }
}
    