# Ecommerce UI (React + TypeScript + Vite)

Đây là dự án giao diện người dùng cho hệ thống thương mại điện tử, sử dụng React, TypeScript và Vite.

## Tính năng chính
- Đăng nhập/Đăng ký bằng email hoặc Google
- Quản lý sản phẩm, giỏ hàng, đơn hàng
- Trang quản trị cho admin, seller
- Tích hợp thanh toán Stripe
- Responsive UI, hỗ trợ dark mode

## Cấu trúc thư mục
- `src/components/` – Các component UI (auth, common, features, shared)
- `src/pages/` – Các trang chính (Home, Login, Register, Cart, Checkout, ...)
- `src/services/` – Giao tiếp API backend
- `src/store/` – State management (Zustand)
- `src/types/` – Định nghĩa kiểu dữ liệu TypeScript
- `src/hooks/` – Custom hooks
- `src/routes/` – Định tuyến và bảo vệ route
- `src/contexts/` – React context
- `src/utils/` – Tiện ích dùng chung

## Cài đặt
1. Cài Node.js >= 18
2. Cài dependencies:
   ```bash
   npm install
   ```
3. Chạy development server:
   ```bash
   npm run dev
   ```
4. Truy cập: http://localhost:5173

## Cấu hình môi trường
- Sử dụng file `.env` để cấu hình các biến môi trường nếu cần (API endpoint, Google Client ID, ...)

## Lint & Format
- Chạy ESLint:
  ```bash
  npm run lint
  ```
- Format code với Prettier:
  ```bash
  npm run format
  ```

## Build production
```bash
npm run build
```

## Ghi chú
- Backend API: Xem thư mục `../final-ecommerce-api/`
- Để đăng nhập/đăng ký Google hoạt động, cần cấu hình Google OAuth và backend tương ứng.

## Đóng góp
Pull request và issue luôn được chào đón!

---

**Tech stack:** React, TypeScript, Vite, Zustand, MUI, TailwindCSS, Stripe, Google OAuth

