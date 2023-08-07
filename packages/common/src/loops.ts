/**
 * Does a forEach loop, but catches errors and returns them
 * as an array instead of throwing them.
 *
 * If the callback returns a value, it will be taken as
 * an error and added to the array, unless it's falsy. If
 * it's an array, it will be spread into the errors array.
 */
export function forEachWithErrors<T, E>(
  array: T[],
  cb: (value: T, index: number, array: T[]) => unknown,
  err: (error: unknown, index: number, array: T[]) => E,
): E[] {
  const errors: E[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      const ret = cb(array[i], i, array);
      if (ret) {
        if (Array.isArray(ret)) ret.forEach(error => error && errors.push(err(error, i, array)));
        else errors.push(err(ret, i, array));
      }
    } catch (error) {
      errors.push(err(error, i, array));
    }
  }

  return errors;
}
