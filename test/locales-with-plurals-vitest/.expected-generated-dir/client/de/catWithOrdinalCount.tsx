
export default function catWithOrdinalCount(count: number) {
    const category = new Intl.PluralRules('de',  { type: 'ordinal' }).select(count);

    switch (category) {
       case 'other': return "{{count}}. Katze";
        default:
            return "";
    }
}
    