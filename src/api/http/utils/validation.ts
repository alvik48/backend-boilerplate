import { createHmac } from 'node:crypto';

interface SafeDataSpec {
  auth_date: string;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
    allows_write_to_pm: boolean;
  };
}

const safeDataKeys: (keyof SafeDataSpec)[] = ['auth_date', 'chat_type', 'chat_instance', 'start_param', 'user'];

/**
 * Checks if a given key is a safe data key.
 * @param {string} key - The key to check.
 * @returns {boolean} - True if the key is a safe data key, false otherwise.
 */
const isPassedKeyIsSafeDataKey = (key: string): key is keyof SafeDataSpec =>
  safeDataKeys.includes(key as keyof SafeDataSpec);

/**
 * Validates the Telegram Web App initialization data.
 * @param {string} data - The initialization data.
 * @returns {SafeDataSpec | null} - The validated data if it is safe, otherwise null.
 */
const validateWebAppInitData = (data: string): SafeDataSpec | null => {
  if (process.env.API_SKIP_VALIDATION === 'true') {
    return JSON.parse(data) as SafeDataSpec;
  }

  if (!data.includes('hash=')) {
    return null;
  }

  const encoded = decodeURIComponent(data);
  const arr = encoded.split('&');
  const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
  const hashFromData = arr.splice(hashIndex)[0].split('=')[1];

  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!);
  const hash = createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

  if (hash === hashFromData) {
    return arr.reduce((result, keyValuePair) => {
      const [key, value] = keyValuePair.split('=');

      if (isPassedKeyIsSafeDataKey(key)) {
        result[key] = value.startsWith('{"') ? JSON.parse(value) : value;
      }

      return result;
    }, {} as SafeDataSpec);
  }

  return null;
};

export default validateWebAppInitData;
