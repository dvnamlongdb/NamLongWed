# Hướng dẫn Deploy lên VPS - Nam Long System

## 1. Chuẩn bị VPS

### Cài đặt Node.js và npm
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra phiên bản
node --version
npm --version
```

### Cài đặt PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 2. Upload code lên VPS

### Sử dụng Git (khuyến nghị)
```bash
# Clone repository
git clone <your-repo-url>
cd NamLongWed/namlong

# Cài đặt dependencies
npm install
```

### Hoặc upload qua SCP/SFTP
```bash
# Upload folder namlong lên VPS
scp -r namlong/ user@your-vps-ip:/home/user/
```

## 3. Cấu hình Environment Variables

### Tạo file .env trên VPS
```bash
# Tạo file .env
nano .env
```

### Nội dung file .env:
```env
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://dvnamlongdb_db_user:Namlong%40database999@dvnamlongdb.hz5pbqy.mongodb.net/?retryWrites=true&w=majority&appName=DVNamLongDB

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production-namlong2024

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Bootstrap Token (for initial admin creation)
BOOTSTRAP_TOKEN=namlong-bootstrap-2024-secure-token
```

## 4. Test kết nối MongoDB Atlas

```bash
# Test kết nối MongoDB
npm run test-mongodb
```

Nếu test thành công, bạn sẽ thấy:
```
✅ MongoDB Atlas Connected Successfully!
✅ Admin user already exists
✅ Login test successful!
🎉 All tests passed! Your MongoDB Atlas setup is working correctly.
```

## 5. Cấu hình Firewall

```bash
# Mở port 3000 cho backend
sudo ufw allow 3000

# Mở port 3000 cho frontend (nếu chạy trên cùng VPS)
sudo ufw allow 3000

# Kiểm tra firewall status
sudo ufw status
```

## 6. Chạy ứng dụng với PM2

### Tạo file ecosystem.config.js
```bash
nano ecosystem.config.js
```

### Nội dung ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'namlong-backend',
    script: 'app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Tạo thư mục logs
```bash
mkdir logs
```

### Chạy ứng dụng
```bash
# Start với PM2
pm2 start ecosystem.config.js

# Kiểm tra status
pm2 status

# Xem logs
pm2 logs namlong-backend

# Restart nếu cần
pm2 restart namlong-backend
```

## 7. Cấu hình Frontend

### Cập nhật API URL trong frontend
Trong file `namlong-fe/src/service/index.ts`, cập nhật:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://your-vps-ip:3000/v1/api";
```

### Hoặc tạo file .env.local trong frontend:
```env
NEXT_PUBLIC_API_URL=http://your-vps-ip:3000/v1/api
```

## 8. Cấu hình Nginx (Optional)

### Cài đặt Nginx
```bash
sudo apt install nginx -y
```

### Tạo file cấu hình
```bash
sudo nano /etc/nginx/sites-available/namlong
```

### Nội dung file cấu hình:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/v1/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Kích hoạt site
```bash
sudo ln -s /etc/nginx/sites-available/namlong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Kiểm tra và Debug

### Kiểm tra backend
```bash
# Test API endpoint
curl http://localhost:3000/v1/api/health

# Test login
curl -X POST http://localhost:3000/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Xem logs chi tiết
```bash
# PM2 logs
pm2 logs namlong-backend

# System logs
sudo journalctl -u nginx -f
```

## 10. Troubleshooting

### Lỗi kết nối MongoDB Atlas
1. Kiểm tra IP whitelist trong MongoDB Atlas
2. Kiểm tra connection string
3. Chạy `npm run test-mongodb` để debug

### Lỗi CORS
1. Cập nhật CORS origins trong `app.js`
2. Kiểm tra frontend API URL

### Lỗi đăng nhập
1. Kiểm tra logs: `pm2 logs namlong-backend`
2. Test trực tiếp API với curl
3. Kiểm tra JWT_SECRET có giống nhau không

### Lỗi port đã được sử dụng
```bash
# Tìm process đang sử dụng port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

## 11. Auto-start với PM2

```bash
# Lưu cấu hình PM2
pm2 save

# Tạo startup script
pm2 startup

# Chạy lệnh được hiển thị (thường là sudo env PATH=...)
```

## 12. Monitoring

```bash
# Xem resource usage
pm2 monit

# Restart định kỳ
pm2 restart namlong-backend --cron "0 2 * * *"
```

---

## Thông tin đăng nhập mặc định:
- **Username**: admin
- **Password**: admin123
- **Role**: admin

## Endpoints chính:
- **Health Check**: `GET /v1/api/health`
- **Login**: `POST /v1/api/login`
- **Bootstrap**: `POST /v1/api/bootstrap` (tạo admin user)

## Lưu ý bảo mật:
1. Thay đổi JWT_SECRET trong production
2. Thay đổi mật khẩu admin mặc định
3. Cấu hình firewall chỉ mở port cần thiết
4. Sử dụng HTTPS trong production
5. Backup database định kỳ
