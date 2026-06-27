# 阿里云 ECS 部署指南

将 GitHub 上的「高中学科知识 AI 网站」部署到阿里云服务器。

**仓库：** `git@github.com:Viccko/git-test2.git`  
**分支：** `feature/subject-ai-mvp`

---

## 一、架构

```text
用户浏览器
    ↓ :80
  Nginx（静态前端 + /api 反代）
    ↓ :3000          ↓ :3306（仅本机）
  Node 后端        MySQL (Docker)
```

---

## 二、服务器准备（首次）

### 1. 登录阿里云 ECS

```bash
ssh root@你的公网IP
```

### 2. 安装依赖（Ubuntu 示例）

```bash
apt update
apt install -y git nginx docker.io docker-compose-plugin
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

CentOS 用 `yum`/`dnf` 安装对应包即可。

### 3. 阿里云安全组

在控制台放行：

| 端口 | 用途 |
|------|------|
| 22 | SSH |
| 80 | HTTP 网站 |
| 443 | HTTPS（可选，后续配 SSL） |

**不要**对公网开放 3306、3000。

### 4. 配置 GitHub SSH（服务器上）

```bash
ssh-keygen -t ed25519 -C "aliyun-server"
cat ~/.ssh/id_ed25519.pub
```

把公钥添加到 GitHub → Settings → SSH keys。

---

## 三、拉取代码

```bash
mkdir -p /opt/subject-ai
cd /opt/subject-ai
git clone -b feature/subject-ai-mvp git@github.com:Viccko/git-test2.git .
```

若仓库就是整个项目根目录，路径为 `/opt/subject-ai`。

---

## 四、配置环境变量

```bash
cp .env.example .env
nano .env
```

生产环境建议修改数据库密码：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=subject_ai
DB_USER=subject_user
DB_PASSWORD=你的强密码
PORT=3000
```

同时修改 `docker-compose.yml` 中的 `MYSQL_PASSWORD` 与 `.env` 保持一致。

---

## 五、配置 Nginx

```bash
# 把 YOUR_DOMAIN_OR_IP 换成公网 IP 或域名
sed "s/YOUR_DOMAIN_OR_IP/你的公网IP/g" deploy/nginx.conf \
  | sudo tee /etc/nginx/conf.d/subject-ai.conf

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## 六、一键部署

```bash
cd /opt/subject-ai
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
```

---

## 七、验证

```bash
# 后端
curl http://127.0.0.1:3000/health

# 前端 + API（经 Nginx）
curl http://127.0.0.1/api/subjects

# MySQL
docker exec subject_ai_mysql mysql -u subject_user -p subject_ai -e "SHOW TABLES;"
```

浏览器访问：`http://你的公网IP`

---

## 八、后续更新（代码 push 后）

在服务器执行：

```bash
cd /opt/subject-ai
bash deploy/deploy.sh
```

---

## 九、常见问题

| 问题 | 处理 |
|------|------|
| 页面能开但提交失败 | 检查 `pm2 logs subject-ai-backend` |
| 502 Bad Gateway | 后端未启动：`pm2 status` |
| 数据库连不上 | `docker ps` 确认 MySQL 容器 Up |
| GitHub clone 失败 | 检查服务器 SSH 公钥是否已加 GitHub |

---

## 十、HTTPS（可选）

有域名时可用 Certbot 免费证书：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```
