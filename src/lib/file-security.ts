/**
 * Utility for secure image verification and protection against:
 * 1. Double Extension Attacks (e.g. shell.php.jpg, payload.exe.png)
 * 2. Unrestricted File Upload & MIME Spoofing
 * 3. Path Traversal & Null Byte Injection
 * 4. Maximum File Size Limits (5 MB)
 * 5. Magic Byte / Signature Check for JPEG & PNG
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Dangerous extensions that must never exist anywhere in the file name
const DANGEROUS_EXTENSIONS = [
  'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
  'exe', 'sh', 'bash', 'py', 'pl', 'cgi', 'asp', 'aspx', 'jsp',
  'js', 'vbs', 'bat', 'cmd', 'com', 'dll', 'msi', 'jar', 'svg', 'htm', 'html'
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

/**
 * Validates file name against double extensions, null bytes, and path traversal
 */
export function validateFileNameSecurity(fileName: string): FileValidationResult {
  if (!fileName || typeof fileName !== 'string') {
    return { isValid: false, error: 'Invalid filename provided.' };
  }

  // 1. Check for Null Bytes or Directory Traversal
  if (fileName.includes('\0') || fileName.includes('%00') || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { isValid: false, error: 'Security alert: Path traversal or null byte detected in filename.' };
  }

  const parts = fileName.toLowerCase().split('.');
  if (parts.length < 2) {
    return { isValid: false, error: 'File must have a valid extension (.jpg, .jpeg, or .png).' };
  }

  const finalExt = parts[parts.length - 1];
  if (!ALLOWED_EXTENSIONS.includes(finalExt)) {
    return { isValid: false, error: `Invalid file extension ".${finalExt}". Only JPG, JPEG, and PNG are permitted.` };
  }

  // 2. Double Extension & Embedded Script Attack Check
  for (let i = 1; i < parts.length; i++) {
    if (DANGEROUS_EXTENSIONS.includes(parts[i]) || (i < parts.length - 1 && ALLOWED_EXTENSIONS.includes(parts[i]))) {
      return { 
        isValid: false, 
        error: `Security alert: Double extension attack or executable script detected ("${parts[i]}"). Upload rejected.` 
      };
    }
  }

  // 3. Sanitize file name to clean alphanumeric string preserving extension
  const baseName = parts.slice(0, parts.length - 1).join('_').replace(/[^a-z0-9_-]/gi, '_');
  const sanitizedFileName = `${baseName || 'upload'}.${finalExt}`;

  return { isValid: true, sanitizedFileName };
}

/**
 * Client-Side File Object Validation (Size, MIME, Extension, and Base64 Magic Bytes)
 */
export async function validateClientImageFile(file: File): Promise<FileValidationResult> {
  // 1. Check Max Size (5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: `File size exceeds the 5 MB maximum limit (Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).` };
  }

  // 2. Check Name & Double Extension Security
  const nameCheck = validateFileNameSecurity(file.name);
  if (!nameCheck.isValid) {
    return nameCheck;
  }

  // 3. Check MIME Type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { isValid: false, error: `Invalid MIME content type (${file.type}). Only image/jpeg and image/png are accepted.` };
  }

  // 4. Check Magic Bytes from Blob/File slice (True File Signature Check)
  try {
    const headerBytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error('Failed to read file header'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsArrayBuffer(file.slice(0, 12));
    });

    const isJpeg = headerBytes[0] === 0xFF && headerBytes[1] === 0xD8 && headerBytes[2] === 0xFF;
    const isPng = headerBytes[0] === 0x89 && headerBytes[1] === 0x50 && headerBytes[2] === 0x4E && headerBytes[3] === 0x47;

    if (!isJpeg && !isPng) {
      return { isValid: false, error: 'Security alert: File header magic bytes do not match JPEG or PNG signature. Unrestricted file upload rejected.' };
    }
  } catch (e: any) {
    return { isValid: false, error: 'Security alert: Unable to verify file header magic bytes.' };
  }

  return { isValid: true, sanitizedFileName: nameCheck.sanitizedFileName };
}

/**
 * Server-Side Data URL or Image URL Validation
 */
export function validateServerImageDataUrl(dataUrlOrPath: string | null | undefined): FileValidationResult {
  if (!dataUrlOrPath || typeof dataUrlOrPath !== 'string') {
    return { isValid: true };
  }

  // If it's a data URL (base64)
  if (dataUrlOrPath.startsWith('data:')) {
    if (dataUrlOrPath.length > MAX_FILE_SIZE_BYTES * 1.37) {
      return { isValid: false, error: 'Uploaded file size exceeds the 5 MB limit.' };
    }

    const matches = dataUrlOrPath.match(/^data:(image\/(jpeg|jpg|png));base64,(.*)$/i);
    if (!matches) {
      return { isValid: false, error: 'Security alert: Invalid Data URL MIME header. Only image/jpeg and image/png base64 strings are allowed.' };
    }

    const base64Data = matches[3];
    const isJpegBase64 = base64Data.startsWith('/9j/');
    const isPngBase64 = base64Data.startsWith('iVBORw0KGgo');

    if (!isJpegBase64 && !isPngBase64) {
      return { isValid: false, error: 'Security alert: Base64 content signature mismatch (Magic bytes inspection failed). Upload rejected.' };
    }

    return { isValid: true };
  }

  // If it's a direct filename/url path
  const urlWithoutParams = dataUrlOrPath.split('?')[0];
  const fileNamePart = urlWithoutParams.split('/').pop() || urlWithoutParams;
  if (fileNamePart.includes('.')) {
    const nameCheck = validateFileNameSecurity(fileNamePart);
    if (!nameCheck.isValid) {
      return nameCheck;
    }
  }

  return { isValid: true };
}
