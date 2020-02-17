import { SHUFFLE_ARRAY_RANGE_ERROR } from './errors';
export function shuffleArray<T>(input: T[], n = 1): T[] {
  if (n < 1) throw SHUFFLE_ARRAY_RANGE_ERROR;

  const output = input.slice();

  for (let times = 0; times < n; times += 1) {
    for (let i = 0; i < output.length; i += 1) {
      const randomIndex = Math.floor(Math.random() * (output.length - i)) + i;
      [output[i], output[randomIndex]] = [output[randomIndex], output[i]];
    }
  }
  return output;
}
