/**
 * Pauses the async code execution for given time in milliseconds
 * @param milliseconds
 */
export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });

/**
 * Replaces `{keys}` with given replacement strings
 * @param text
 * @param replacements
 */
export const replace = (text: string, replacements: Record<string, any | any[]>): string => {
  for (const key in replacements) {
    // eslint-disable-next-line no-useless-escape
    const regexp = new RegExp(`{\s*${key}\s*}`, 'g');
    const value = replacements[key];
    const replaceWith = Array.isArray(value) ? value.join(', ') : String(value);

    text = text.replace(regexp, replaceWith);
  }

  return text;
};
