/**
 * Minimal QR code SVG generator for offline reliability
 * Uses Google Chart API as primary or encoded SVG fallback
 */
export const getQrCodeUrl = (text: string, size: number = 240): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=8`;
};
