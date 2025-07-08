# Hướng dẫn triển khai lên Vercel

Tài liệu này hướng dẫn các bước triển khai ứng dụng E-commerce lên nền tảng Vercel.

## Yêu cầu

1. Tài khoản Vercel (đăng ký tại [vercel.com](https://vercel.com))
2. Git repository cho dự án (GitHub, GitLab, hoặc Bitbucket)
3. Node.js phiên bản 18.x trở lên

## Các bước triển khai

### 1. Chuẩn bị dự án

- Đảm bảo đã có các file cấu hình: `vercel.json`, `.env.production`
- Kiểm tra đường dẫn API trong biến môi trường `.env.production`
- Xác minh rằng build script hoạt động bình thường trên máy cục bộ: `npm run build`

### 2. Đẩy code lên Git repository

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 3. Triển khai lên Vercel

#### Cách 1: Sử dụng Vercel Dashboard

1. Đăng nhập vào [vercel.com](https://vercel.com)
2. Nhấp vào "Add New" > "Project"
3. Liên kết với Git repository của dự án
4. Cấu hình các biến môi trường:
   - `VITE_API_BASE_URL`: URL của backend API
   - `VITE_IMAGE_URL_BUCKET_NAME`: Tên bucket S3 cho ảnh
   - `VITE_IMAGE_URL_AREA`: Khu vực AWS S3
   - `VITE_GOOGLE_CLIENT_ID`: Client ID cho Google OAuth
5. Nhấp vào "Deploy"

#### Cách 2: Sử dụng Vercel CLI

1. Cài đặt Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Đăng nhập vào Vercel:

   ```bash
   vercel login
   ```

3. Triển khai dự án:

   ```bash
   vercel
   ```

4. Trả lời các câu hỏi và thêm biến môi trường khi được yêu cầu.

### 4. Kiểm tra sau khi triển khai

1. Kiểm tra trang web đã triển khai
2. Xác minh tất cả các tính năng hoạt động:
   - Đăng nhập/Đăng ký
   - Hiển thị sản phẩm
   - So sánh sản phẩm
   - Giỏ hàng và thanh toán
   - Quản lý đơn hàng
   - Phân quyền admin/user

### 5. Cấu hình tên miền tùy chỉnh (nếu cần)

1. Trong dashboard dự án, chọn "Settings" > "Domains"
2. Thêm tên miền tùy chỉnh và làm theo hướng dẫn cấu hình DNS

### 6. Theo dõi và phân tích

1. Sử dụng "Analytics" từ dashboard Vercel để theo dõi hiệu suất
2. Kiểm tra log để phát hiện và khắc phục lỗi

## Cấu hình biến môi trường

### Cách 1: Sử dụng Vercel Dashboard

1. Trong dashboard dự án, chọn "Settings" > "Environment Variables"
2. Thêm các biến môi trường sau:
   - `VITE_API_BASE_URL` - URL của backend API (ví dụ: https://api.your-backend.com)
   - `VITE_IMAGE_URL_BUCKET_NAME` - Tên bucket S3 (ví dụ: finalterm-spring-bucket)
   - `VITE_IMAGE_URL_AREA` - Khu vực AWS S3 (ví dụ: ap-southeast-1)
   - `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

### Cách 2: Sử dụng Vercel CLI

Khi chạy `vercel` hoặc `vercel --prod`, CLI sẽ hỏi nếu bạn muốn thêm các biến môi trường từ file `.env.production`. Bạn cũng có thể thêm thủ công bằng lệnh:

```bash
vercel env add VITE_API_BASE_URL
```

### Các lưu ý về biến môi trường

- Các biến phải bắt đầu bằng `VITE_` để Vite có thể sử dụng chúng trong code frontend
- Giữ thông tin nhạy cảm (như API keys) chỉ trong dashboard Vercel thay vì trong file `.env.production`
- Thêm `.env.production` vào `.gitignore` để tránh đưa thông tin nhạy cảm lên git

## Lưu ý quan trọng

- Đối với ứng dụng SPA (Single Page Application), Vercel đã được cấu hình để chuyển hướng tất cả các route về `index.html`
- Nếu backend API yêu cầu CORS, hãy đảm bảo thêm domain Vercel vào danh sách cho phép CORS
- Đối với Google OAuth, cập nhật URI chuyển hướng được phép trong Google Cloud Console để bao gồm URL của ứng dụng Vercel

## Khắc phục sự cố

### Lỗi API không kết nối

- Kiểm tra biến môi trường `VITE_API_BASE_URL` được cấu hình chính xác
- Xác minh rằng backend API đang chạy và có thể truy cập từ Internet

### Lỗi SPA Routing

- Xác minh file `vercel.json` có cấu hình rewrite đúng
- Kiểm tra router có route "wildcard" (\*) để xử lý các đường dẫn không khớp

### Lỗi OAuth

- Kiểm tra Client ID đã được cấu hình chính xác
- Xác minh rằng URI chuyển hướng của Vercel đã được thêm vào cấu hình Google OAuth
