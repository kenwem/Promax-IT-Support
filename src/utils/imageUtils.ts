/**
 * Image processing utilities for handling uploads, external image links,
 * and reliable client-side compression/fallback.
 */

/**
 * Formats image URLs from popular services (Dropbox, Google Drive, OneDrive)
 * into direct, embeddable raw image links.
 */
export function formatImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already a Data URL or Blob URL, return as-is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Dropbox link handling:
  // Changes ?dl=0 to ?raw=1 or appends raw=1 to fetch the raw image binary
  if (trimmed.includes('dropbox.com')) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set('raw', '1');
      urlObj.searchParams.delete('dl');
      return urlObj.toString();
    } catch {
      // Fallback string replacement if URL parsing fails
      if (trimmed.includes('dl=0')) {
        return trimmed.replace('dl=0', 'raw=1');
      }
      return trimmed + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
    }
  }

  // Google Drive link handling:
  // Formats drive view URLs to direct thumbnail/view URLs
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1200`;
    }
  }

  return trimmed;
}

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file client-side and returns an optimized Base64 Data URL.
 * Ensures images upload cleanly even when cloud storage bucket rules are locked.
 */
export function compressAndEncodeImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    // Keep SVGs crisp without canvas rasterization
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG image'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if image decoding fails
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Could not decode image file'));
        }
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale proportionally if dimensions exceed max bounds
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if canvas context unavailable
            resolve(event.target?.result as string);
            return;
          }

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Use WebP if supported, fallback to JPEG for universal compatibility
          const mimeType = file.type === 'image/png' && quality >= 0.9 ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        } catch {
          // If canvas tainted or fails, fallback to raw reader result
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file for Firebase Storage upload, ensuring:
 * 1. File size is strictly under 1MB (to satisfy Storage rules: request.resource.size < 1 * 1024 * 1024)
 * 2. Proper image content-type (e.g. image/jpeg, image/png, image/webp)
 * 3. Provides both an uploadable Blob and a Base64 dataUrl preview
 */
export async function compressImageForUpload(
  file: File,
  options: CompressOptions & { maxSizeBytes?: number } = {}
): Promise<{ blob: Blob; dataUrl: string; contentType: string }> {
  // 950KB default to remain strictly under the 1024 * 1024 limit
  const maxSizeBytes = options.maxSizeBytes || 950 * 1024;

  // Handle SVG directly
  if (file.type === 'image/svg+xml') {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
    });
    return {
      blob: file,
      dataUrl,
      contentType: 'image/svg+xml'
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image file'));
      img.onload = () => {
        try {
          const maxWidth = options.maxWidth || 1200;
          const maxHeight = options.maxHeight || 1200;
          let quality = options.quality || 0.85;

          const renderToBlob = (w: number, h: number, q: number, type: string): Promise<Blob> => {
            return new Promise((res, rej) => {
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) return rej(new Error('Canvas 2D context unavailable'));
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);
              canvas.toBlob((b) => {
                if (b) res(b);
                else rej(new Error('Failed to convert canvas to blob'));
              }, type, q);
            });
          };

          const attemptCompression = async () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const mime = file.type === 'image/png' && quality >= 0.9 ? 'image/png' : 'image/jpeg';
            let blob = await renderToBlob(width, height, quality, mime);

            // Progressive reduction if it exceeds maxSizeBytes
            let attempts = 0;
            while (blob.size > maxSizeBytes && attempts < 4) {
              attempts++;
              quality = Math.max(0.4, quality * 0.8);
              width = Math.round(width * 0.85);
              height = Math.round(height * 0.85);
              blob = await renderToBlob(width, height, quality, 'image/jpeg');
            }

            const dataUrl = await new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.readAsDataURL(blob);
            });

            return {
              blob,
              dataUrl,
              contentType: blob.type || 'image/jpeg'
            };
          };

          attemptCompression().then(resolve).catch(reject);
        } catch (err) {
          reject(err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

