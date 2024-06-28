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

/**
 * Parses period set up in human-readable format and returns its milliseconds value, e.g.:
 * - `30s` - means **"30 seconds"**, returns `30000`;
 * - `5m` - means **"5 minutes"**, returns `5 * 60000`;
 * - `12h` - means **"12 hours"**, returns `12 * 60 * 60000`;
 * - `2d` - means **"2 days"**, returns `2 * 24 * 60 * 60000`;
 *
 * You can combine periods joining them with spaces, e.g.:
 * - `1h 30m 1s` means **"1 hour 30 minutes 1 second"** and returns `5401000`;
 * @param periodString
 */
export const parsePeriod = (periodString: string) => {
  const length: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 60 * 60000,
    d: 24 * 60 * 60000,
  };

  let milliseconds = 0;
  const chunks = periodString.split(' ');

  for (const chunk of chunks) {
    const ar = chunk.match(/[a-zA-Z]+|[-0-9]+/g);

    if (!ar || !ar[0] || !ar[1]) {
      throw new Error(`Can't parse period "${periodString}"`);
    }

    milliseconds += parseInt(ar[0]) * length[ar[1]];
  }

  return milliseconds;
};
