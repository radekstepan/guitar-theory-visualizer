export const cn = (...inputs: (string | undefined | null | false)[]): string => {
  return inputs.filter(Boolean).join(' ');
}
