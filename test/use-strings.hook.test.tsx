// vitest test for useStrings hook
// The generateLocale function is run in the vitest.setup.ts file before all tests.
// When it's run in beforeAll, it's not possible to import the generated files in the test files.
// Before running the tests, you will see import errors in this file. Ignore them. Just run the tests.
import { describe, test, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { interpolateTemplate } from './locales-with-plurals-vitest/.generated-vitest/common.ts'

describe('useStrings hook', () => {
  test('returns correct value for hello key', async () => {
    // Dynamically import the generated hook after generation
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['hello'], 'en'))

    await waitFor(
      () => {
        expect(result.current[0]?.hello).toBe('Hello world!')
      },
      { timeout: 5000 }
    )
  })

  test('returns correct values for hello and home keys', async () => {
    // Dynamically import the generated hook after generation
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['hello', 'home'], 'en'))

    await waitFor(
      () => {
        expect(result.current[0]?.hello).toBe('Hello world!')
        expect(result.current[0]?.home).toBe('Home')
      },
      { timeout: 5000 }
    )
  })

  test('returns correct value for greeting key with interpolation', async () => {
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['greeting'], 'en'))

    await waitFor(
      () => {
        // @ts-expect-error - we are testing the args
        expect(result.current[2]?.greeting({ name: 'John' })).toBe('Hello John!')
      },
      { timeout: 5000 }
    )
  })

  test('returns correct value for home key', async () => {
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['home'], 'en'))

    await waitFor(
      () => {
        expect(result.current[0]?.home).toBe('Home')
      },
      { timeout: 5000 }
    )
  })

  test('returns correct value for welcome key with multiple interpolations', async () => {
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['welcome'], 'en'))

    await waitFor(
      () => {
        expect(
          // @ts-expect-error - we are testing the args
          result.current[2]?.welcome({
            country: 'France',
            time: '10:00',
          })
        ).toBe("Welcome to France! It's 10:00 now.")
      },
      { timeout: 5000 }
    )
  })

  test('returns correct value for plural keys', async () => {
    const { useStrings } = await import(
      './locales-with-plurals-vitest/.generated-vitest/client/hooks.tsx'
    )
    const { result } = renderHook(() => useStrings(['appleWithCount', 'catWithOrdinalCount'], 'en'))

    await waitFor(
      () => {
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(1)).toBe('An apple')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(2)).toBe('2 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(0)).toBe('0 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(10)).toBe('10 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(100)).toBe('100 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(1000)).toBe('1000 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.appleWithCount(10000)).toBe('10000 apples')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(1)).toBe('1st cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(2)).toBe('2nd cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(3)).toBe('3rd cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(10)).toBe('10th cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(100)).toBe('100th cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(1000)).toBe('1000th cat')
        // @ts-expect-error - we are testing the args
        expect(result.current[1]?.catWithOrdinalCount(10000)).toBe('10000th cat')
      },
      { timeout: 5000 }
    )
  })
})
