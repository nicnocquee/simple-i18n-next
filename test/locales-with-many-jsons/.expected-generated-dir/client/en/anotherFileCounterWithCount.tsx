
export default function anotherFileCounterWithCount(count: number) {
    const category = new Intl.PluralRules('en').select(count);

    switch (category) {
       case 'one': return "One counter";
case 'other': return "{{count}} counters";
        default:
            return "";
    }
}
    