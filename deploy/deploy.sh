#!/usr/bin/env bash
# 阿里云 ECS 一键部署脚本（Ubuntu/CentOS 通用）
# 用法：在项目根目录执行 bash deploy/deploy.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> [1/6] 拉取最新代码"
git pull origin feature/subject-ai-mvp || git pull

echo "==> [2/6] 环境变量"
if [ ! -f .env ]; then
  cp .env.example .env
fi
# 生产环境 MySQL 映射到 3308，避免与服务器上其他 MySQL 冲突
grep -q '^DB_PORT=' .env && sed -i 's/^DB_PORT=.*/DB_PORT=3308/' .env || echo 'DB_PORT=3308' >> .env

echo "==> [3/6] 启动 MySQL"
docker rm -f subject_ai_mysql 2>/dev/null || true
docker compose -f deploy/docker-compose.prod.yml up -d
sleep 5
docker exec -i subject_ai_mysql mysql -u subject_user -psubject_pass \
  --default-character-set=utf8mb4 subject_ai < sql/init.sql

echo "==> [4/6] 安装并启动后端"
cd backend
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
if command -v pm2 >/dev/null; then
  pm2 delete subject-ai-backend 2>/dev/null || true
  pm2 start src/index.js --name subject-ai-backend
  pm2 save
else
  echo "未安装 pm2，请先执行: npm install -g pm2"
  exit 1
fi
cd "$APP_DIR"

echo "==> [5/6] 构建前端"
cd frontend
npm ci 2>/dev/null || npm install
npm run build
cd "$APP_DIR"

echo "==> [6/6] 重载 Nginx"
if command -v nginx >/dev/null; then
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "未检测到 nginx，请手动配置 deploy/nginx.conf"
fi

echo ""
echo "部署完成！浏览器访问: http://YOUR_DOMAIN_OR_IP"
echo "后端健康检查: curl http://127.0.0.1:3000/health"
