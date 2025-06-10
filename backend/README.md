# NEUGPT Backend

## Yêu cầu
- Node.js
- npm

## Cài đặt

```powershell
cd backend
npm install
```

## Chạy ở chế độ phát triển

```powershell
npm run dev
```

## Build và chạy ở chế độ production

```powershell
npm run build
npm start
```

## Cấu hình môi trường

Tạo file `.env` dựa trên file mẫu `.env.example`:

```
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=
```

## Thư mục chính
- `src/` - Mã nguồn backend (Express, TypeScript)
- `src/routes/` - Định nghĩa các route
- `src/controllers/` - Xử lý logic
- `src/models/` - Định nghĩa model
- `src/middlewares/` - Middleware chung
- `src/config/` - Cấu hình môi trường
