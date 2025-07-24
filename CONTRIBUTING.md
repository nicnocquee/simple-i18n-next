If you change the output of the CLI, you need to update the expected output in the test files by running the following command from the `packages/simple-i18n-next` directory:

```bash
./update-test-snapshots.sh
```

This will update the expected output in the test files.

After that you can run the tests by running the following command from the `packages/simple-i18n-next` directory:

```bash
pnpm test
```
