
export default function anotherFileCounterWithCount(count: number) {
    const category = new Intl.PluralRules('de').select(count);

    switch (category) {
       case 'one': return "Ein Zähler";
case 'other': return "{{count}} Zähler";
        default:
            return "";
    }
}
    