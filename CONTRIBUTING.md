If you change the output of the CLI, you need to update the expected output in the test files.

For example, to update the expected output for the `generateLocale without output directory` test, you need to run the following command:

```bash
npx tsx source/cli.tsx -i ./test/locales -o ./test/locales/.expected-generated-dir -l en
```

Run the command above for all tests that you changed.
