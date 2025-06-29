// Chuẩn hóa lấy link ảnh sản phẩm từ S3 bucket qua biến môi trường
export function getProductImageUrl(imagePath?: string) {
  if (!imagePath) return "/images/products/placeholder.png";
  return `https://${import.meta.env.VITE_IMAGE_URL_BUCKET_NAME}.s3.${import.meta.env.VITE_IMAGE_URL_AREA}.amazonaws.com/${imagePath}`;
}
