export const retryUtils = {
  sleep: async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  retry: async <T>(func: () => Promise<T>, predicate?: (result: T) => boolean, times = 3, interval = 5) => {
    let attempts = 0
    while (true) {
      try {
        const result = await func()

        if (!predicate) {
          return result
        }

        if (predicate(result)) {
          return result
        }

        if (++attempts >= times) {
          return result
        }
      } catch (e) {
        if (++attempts >= times) throw e
      }

      await retryUtils.sleep(interval)
    }
  },
}
