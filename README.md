# NEUGPT - AI Chat Application


## 🚀 Hướng dẫn cài đặt

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 📖 Quy trình Git Flow

### 1. Pull code mới nhất từ nhánh `main`
```bash
git checkout main
git pull origin main
```

### 2. Tạo nhánh feature mới
```bash
git checkout -b feature/ten-tinh-nang
```

### 3. Phát triển và commit
```bash
git add .
git commit -m "feat: mô tả ngắn gọn về tính năng"
```

### 4. Cập nhật code từ main
```bash
git checkout main
git pull origin main
git checkout feature/ten-tinh-nang
git merge main
```

### 5. Xử lý conflict (nếu có)
```bash
# Sau khi xử lý conflict trong code
git add .
git commit -m "fix: resolve merge conflicts"
```

### 6. Push code
```bash
git push origin feature/ten-tinh-nang
```

### 7. Tạo Pull Request
- Truy cập GitHub repository
- Tạo Pull Request từ nhánh `feature/ten-tinh-nang` vào `main`
- Yêu cầu review và chờ approve


## 📄 License

Bản quyền © 2024 thuộc về Khoa Công nghệ thông tin, Trường Công nghệ - Đại học Kinh tế Quốc dân.

Xem file [LICENSE.md](LICENSE.md) để biết thêm chi tiết.