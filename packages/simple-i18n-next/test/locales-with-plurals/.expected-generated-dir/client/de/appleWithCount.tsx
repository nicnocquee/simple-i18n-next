
export default function appleWithCount(count: number) {
    const category = new Intl.PluralRules('de').select(count);

    switch (category) {
       case 'one': return "Ein Apfel";
case 'other': return "{{count}} Äpfel";
        default:
            return "";
    }
}
    