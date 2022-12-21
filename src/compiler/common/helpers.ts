/** Like Array.prototype.map, but returns errors instead of throwing them. */
export function safeMap<T, U>(
  array: T[],
  callbakfn: (value: T, index: number, array: T[]) => U,
): { success: true; result: U[] } | { success: false; errors: unknown[] } {
  const result: U[] = [];
  const errors: unknown[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      result.push(callbakfn(array[i], i, array));
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 0) return { success: true, result };
  else return { success: false, errors };
}

/** Like Array.prototype.forEach, but returns errors instead of throwing them. */
export function safeForEach<T>(
  array: T[],
  callbakfn: (value: T, index: number, array: T[]) => void,
): { success: true } | { success: false; errors: unknown[] } {
  const errors: unknown[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      callbakfn(array[i], i, array);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 0) return { success: true };
  else return { success: false, errors };
}

/** Express number as hex */
export function hex(address: number) {
  return address.toString(16).toUpperCase() + "h";
}
