// Simple, type-safe debounce for React usage
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
  return debounced as T;
}
