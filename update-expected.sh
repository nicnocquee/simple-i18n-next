#/bin/sh

# This script updates the expected output in the test files.

npx tsx source/cli.tsx -i ./test/locales -o ./test/locales/.expected-generated-dir -l en --silent
npx tsx source/cli.tsx -i ./test/locales-invalid-dir -o ./test/locales-invalid-dir/.expected-generated-dir -l en --silent
npx tsx source/cli.tsx -i ./test/locales-with-many-jsons -o ./test/locales-with-many-jsons/.expected-generated-dir -l en --silent
npx tsx source/cli.tsx -i ./test/locales-with-nested-keys -o ./test/locales-with-nested-keys/.expected-generated-dir -l en --silent
npx tsx source/cli.tsx -i ./test/locales-with-plurals -o ./test/locales-with-plurals/.expected-generated-dir -l en --silent