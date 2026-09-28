export const PRODUCT_STATUSES = ["New", "Contacted", "Confirmed", "Cancelled", "Completed", "Rejected"] as const;
export type ProductStatus = typeof PRODUCT_STATUSES[number];

export const DEFAULT_PAGE_SIZE = 12;

export const UPLOAD_DIR = "public/uploads";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
