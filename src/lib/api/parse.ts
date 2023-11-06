import { ParsedQs } from 'qs';

type ConvertFunctor<T> = (input: string) => T[];

export function normalizeQueryArray<T>({
  param,
  convert
}: {
  param: string | string[] | ParsedQs | ParsedQs[],
  convert: ConvertFunctor<T>
}): T[] {
  // If param is a string, split by comma to support comma-separated values
  if (typeof param === 'string') {
    return param.split(',').flatMap(convert);
  }

  // If param is an array of strings (or an array with explicit indices)
  if (Array.isArray(param)) {
    return param.flatMap((item) => (typeof item === 'string' ? convert(item) : []));
  }

  // If param is an object (ParsedQs), which happens when using indices convention
  if (typeof param === 'object' && param !== null) {
    return Object.values(param).flatMap((item) => (typeof item === 'string' ? convert(item) : []));
  }

  // If none of the above, return an empty array
  return [];
}

// Example number converter
export const toNumberIfValidWithLimit = (limit: number): ConvertFunctor<number> => {
  let count = 0;
  return (input: string): number[] => {
    if (count >= limit) return [];
    const num = parseInt(input, 10);
    if (!isNaN(num)) {
      count += 1;
      return [num];
    }
    return [];
  };
};
