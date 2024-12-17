import path from 'path';

export const STATIC_FILES_DIR = path.join(__dirname, '..', '..', 'static');
export const PUBLIC_FILES_DIR = path.join(STATIC_FILES_DIR, 'public');
export const TMP_FILES_DIR = path.join(STATIC_FILES_DIR, 'tmp');
