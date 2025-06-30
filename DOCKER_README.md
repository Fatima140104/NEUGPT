# Docker Setup for NEUGPT

Dự án này bao gồm các Dockerfile cho frontend và backend, cùng với docker-compose để chạy toàn bộ stack.

## Cấu trúc Docker

```
NEUGPT/
├── docker-compose.yml          # Orchestration cho tất cả services
├── docker.env.example          # Mẫu environment variables
├── backend/
│   ├── Dockerfile              # Backend Node.js/TypeScript
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Frontend React/Vite với nginx
│   ├── nginx.conf              # Cấu hình nginx
│   └── .dockerignore
```

## Cách sử dụng

### 1. Setup Environment Variables

Có 2 cách:

**Cách 1: Nếu đã có file .env**
```bash
# Đảm bảo file .env đã có các biến cần thiết:
# - MONGODB_URI: Connection string từ MongoDB Atlas
# - OPENAI_API_KEY: API key từ OpenAI  
# - JWT_SECRET: Secret key cho JWT
# Docker sẽ tự động load từ file .env hiện có
```

**Cách 2: Nếu chưa có file .env**
```bash
# Copy file mẫu và điều chỉnh theo environment của bạn
cp docker.env.example .env

# Chỉnh sửa .env với các giá trị thực tế
```

### 2. Chạy với Docker Compose

```bash
# Build và start tất cả services
docker-compose up --build

# Hoặc chạy trong background
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

### 3. Services

Sau khi start, các services sẽ chạy trên:

- **Frontend**: http://localhost (port 80)
- **Backend**: http://localhost:3000
- **MongoDB**: Cloud database (MongoDB Atlas)

### 4. Development với Docker

```bash
# Rebuild chỉ một service
docker-compose build backend
docker-compose build frontend

# Restart một service
docker-compose restart backend

# Xem logs của một service
docker-compose logs -f backend
```

### 5. Production Deployment

Để deploy production, bạn cần:

1. Thay đổi environment variables trong `.env`
2. Cấu hình domain và SSL certificates
3. Sử dụng reverse proxy (nginx/traefik) nếu cần
4. Cấu hình MongoDB Atlas cho production (IP whitelist, users, etc.)

```bash
# Production build
docker-compose -f docker-compose.yml up -d --build
```

## Troubleshooting

### Backend không kết nối được MongoDB
```bash
# Kiểm tra connection string trong .env
# Đảm bảo MongoDB Atlas cluster đã được whitelist IP
# Kiểm tra backend logs
docker-compose logs backend
```

### Frontend không load được
```bash
# Kiểm tra nginx logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Port conflicts
Nếu ports 80 hoặc 3000 đã được sử dụng, chỉnh sửa trong `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Frontend
  - "3001:3000"  # Backend
```

## Health Checks

Các services đều có health checks:
- Frontend: http://localhost/health
- Backend: http://localhost:3000/health (cần implement endpoint này)

## Performance Tips

1. **Multi-stage builds**: Frontend sử dụng multi-stage build để tối ưu image size
2. **Docker layer caching**: Dependencies được cache riêng từ source code
3. **nginx optimization**: Compression và caching được enable
4. **Cloud database**: Sử dụng MongoDB Atlas cho reliability và scalability

## Security Notes

1. Cấu hình MongoDB Atlas security (IP whitelist, strong passwords)
2. Sử dụng strong JWT secret
3. Cấu hình firewall cho production deployment
4. Định kỳ update base images để patch security vulnerabilities 