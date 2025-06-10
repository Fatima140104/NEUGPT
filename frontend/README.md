# NEUGPT Frontend

## Yêu cầu
- Node.js
- npm

## Cài đặt

```powershell
cd frontend
npm install
```

## Chạy ở chế độ phát triển

```powershell
npm run dev
```

Sau đó truy cập: http://localhost:5173 (có thể thay đổi port tại file vite.config.ts)


## Build và chạy ở chế độ production

```powershell
npm run build
npm run preview
```

## Cấu trúc thư mục chính
- `src/pages/` - Các trang chính (Home, Login, Chat...)
- `src/components/` - Các component giao diện
- `src/layouts/` - Layout tổng thể
- `src/lib/` - Thư viện, utils
- `src/assets/` - Ảnh, icon

## Lưu ý
- Dự án sử dụng React, TypeScript, Vite, TailwindCSS.
- Để chạy được đầy đủ tính năng, cần backend chạy song song.
