
export default function appleWithCount(count: number) {
    const category = new Intl.PluralRules('en').select(count);

    switch (category) {
       case 'one': return "An apple";
case 'other': return "{{count}} apples";
        default:
            return "";
    }
}
    