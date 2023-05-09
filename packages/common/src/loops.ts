/**
 * Does a forEach loop, but catches errors and returns them
 * as an array instead of throwing them.
 */
export function forEachWithErrors<T, E>(
  array: T[],
  cb: (value: T, index: number, array: T[]) => void,
  err: (error: unknown, index: number, array: T[]) => E,
): E[] {
  const errors: E[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      cb(array[i], i, array);
    } catch (error) {
      errors.push(err(err, i, array));
    }
  }

  return errors;
}
