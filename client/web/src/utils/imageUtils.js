/**
 * Image Compression Utility
 * Compress images before storing to IndexedDB to save space
 */

/**
 * Compress image file to base64 with quality control
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1200)
 * @param {number} options.maxHeight - Maximum height (default: 1200)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.85)
 * @returns {Promise<string>} Base64 encoded compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        // Calculate compression ratio
        const originalSize = e.target.result.length;
        const compressedSize = compressedBase64.length;
        const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

        console.log(`Image compressed: ${compressionRatio}% reduction (${formatBytes(originalSize)} → ${formatBytes(compressedSize)})`);

        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Max file size in bytes (default: 5MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${formatBytes(maxSize)}` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Get image dimensions
 * @param {string} base64 - Base64 encoded image
 * @returns {Promise<Object>} Image dimensions { width, height }
 */
export const getImageDimensions = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64;
  });
};

/**
 * Convert base64 to blob
 * @param {string} base64 - Base64 string
 * @returns {Blob} Blob object
 */
export const base64ToBlob = (base64) => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Download image from base64
 * @param {string} base64 - Base64 encoded image
 * @param {string} filename - Download filename
 */
export const downloadImage = (base64, filename = 'image.jpg') => {
  const blob = base64ToBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
