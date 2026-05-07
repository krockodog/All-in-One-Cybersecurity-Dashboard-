# Deployment Guide

Dieses Dokument beschreibt wie das **Cybersecurity Framework** in verschiedenen Umgebungen deployed wird.

---

## Manus Hosting (Empfohlen)

### Voraussetzungen
- Manus Account
- GitHub Repository (optional)
- Environment Variables konfiguriert

### Deployment Steps

1. **Checkpoint erstellen:**
   ```bash
   webdev_save_checkpoint "Production Release v1.0"
   ```

2. **Deployen:**
   ```bash
   webdev_deploy_project
   ```

3. **Visibility auswählen:**
   - `owner` — Nur für dich sichtbar
   - `team` — Für dein Team sichtbar
   - `public` — Öffentlich einsehbar

4. **Zugriff:**
   - Domain: `https://cyberdash-xnbpkymb.manus.space`
   - Server: `https://your-server-url.run.app`

### Environment Variables (Manus)

Alle erforderlichen Variablen sind automatisch verfügbar:
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `BUILT_IN_FORGE_API_KEY`
- `BUILT_IN_FORGE_API_URL`

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/cybersecurity
      - JWT_SECRET=${JWT_SECRET}
      - VITE_APP_ID=${VITE_APP_ID}
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=cybersecurity
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### Build & Run

```bash
# Build Image
docker build -t cybersecurity-framework .

# Run Container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  cybersecurity-framework

# Or with Docker Compose
docker-compose up -d
```

---

## Railway Deployment

### Setup

1. **Connect GitHub Repository**
   - Gehe zu [Railway.app](https://railway.app)
   - Klicke "New Project"
   - Wähle "Deploy from GitHub"
   - Wähle dein Repository

2. **Configure Environment**
   - Gehe zu "Variables"
   - Füge alle erforderlichen Variablen hinzu

3. **Deploy**
   - Railway deployed automatisch bei jedem Push zu `main`

### Environment Variables

```
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.server
BUILT_IN_FORGE_API_KEY=your-key
```

---

## Render Deployment

### Setup

1. **Connect GitHub Repository**
   - Gehe zu [Render.com](https://render.com)
   - Klicke "New +"
   - Wähle "Web Service"
   - Verbinde dein GitHub Repository

2. **Configure**
   - **Name:** cybersecurity-dashboard
   - **Environment:** Node
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Standard (oder höher)

3. **Environment Variables**
   - Gehe zu "Environment"
   - Füge alle erforderlichen Variablen hinzu

4. **Deploy**
   - Klicke "Create Web Service"
   - Render deployed automatisch

---

## Vercel Deployment

### Setup

1. **Import Project**
   - Gehe zu [Vercel.com](https://vercel.com)
   - Klicke "Add New..."
   - Wähle "Project"
   - Importiere dein GitHub Repository

2. **Configure**
   - **Framework:** Other
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

3. **Environment Variables**
   - Gehe zu "Settings" → "Environment Variables"
   - Füge alle erforderlichen Variablen hinzu

4. **Deploy**
   - Klicke "Deploy"
   - Vercel deployed automatisch

**Hinweis:** Vercel ist primär für Frontend. Für Backend brauchst du einen separaten Server (Railway, Render, etc.)

---

## Netlify Deployment

### Setup

1. **Connect Repository**
   - Gehe zu [Netlify.com](https://netlify.com)
   - Klicke "Add new site"
   - Wähle "Import an existing project"
   - Verbinde dein GitHub Repository

2. **Configure**
   - **Build Command:** `pnpm build`
   - **Publish Directory:** `dist`

3. **Environment Variables**
   - Gehe zu "Site settings" → "Build & deploy" → "Environment"
   - Füge alle erforderlichen Variablen hinzu

4. **Deploy**
   - Klicke "Deploy site"
   - Netlify deployed automatisch

**Hinweis:** Wie Vercel ist Netlify primär für Frontend.

---

## AWS Deployment

### EC2 Setup

```bash
# SSH in EC2 Instance
ssh -i your-key.pem ubuntu@your-instance.compute.amazonaws.com

# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone Repository
git clone https://github.com/yourusername/cybersecurity-dashboard.git
cd cybersecurity-dashboard

# Install Dependencies
pnpm install

# Setup Environment
nano .env
# Füge alle erforderlichen Variablen hinzu

# Run Database Migrations
pnpm db:push

# Build
pnpm build

# Start with PM2
npm install -g pm2
pm2 start "pnpm start" --name cybersecurity-dashboard
pm2 save
pm2 startup
```

### RDS Database

```bash
# Create RDS MySQL Instance
# Via AWS Console oder CLI:
aws rds create-db-instance \
  --db-instance-identifier cybersecurity-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20

# Get Endpoint
aws rds describe-db-instances \
  --db-instance-identifier cybersecurity-db \
  --query 'DBInstances[0].Endpoint.Address'

# Update .env
DATABASE_URL=mysql://admin:PASSWORD@your-endpoint:3306/cybersecurity
```

---

## Health Checks

### Monitoring

```bash
# Check Application Status
curl https://your-domain.com/health

# Check Database Connection
curl https://your-domain.com/api/health/db

# Check API Response
curl https://your-domain.com/api/trpc/system.ping
```

### Logging

```bash
# View Logs (Manus)
webdev_check_status

# View Logs (Docker)
docker logs container-id

# View Logs (PM2)
pm2 logs cybersecurity-dashboard

# View Logs (Railway)
# Via Railway Dashboard
```

---

## Scaling

### Horizontal Scaling

```bash
# Docker Swarm
docker swarm init
docker service create --replicas 3 cybersecurity-framework

# Kubernetes
kubectl create deployment cybersecurity --image=cybersecurity-framework
kubectl scale deployment cybersecurity --replicas=3
```

### Load Balancing

```bash
# Nginx Reverse Proxy
upstream app {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}

server {
  listen 80;
  server_name cybersecurity.example.com;

  location / {
    proxy_pass http://app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate Certificate
sudo certbot certonly --nginx -d cybersecurity.example.com

# Auto-Renewal
sudo systemctl enable certbot.timer
```

### AWS Certificate Manager

```bash
# Request Certificate
aws acm request-certificate \
  --domain-name cybersecurity.example.com \
  --validation-method DNS
```

---

## Backup & Recovery

### Database Backups

```bash
# MySQL Backup
mysqldump -u user -p database > backup.sql

# Restore
mysql -u user -p database < backup.sql

# Automated Backups (AWS RDS)
# Via AWS Console: Enable automated backups (7-35 days)
```

### Application Backups

```bash
# Backup Repository
git clone --mirror https://github.com/yourusername/cybersecurity-dashboard.git

# Backup Configuration
tar -czf config-backup.tar.gz .env

# Backup Database
mysqldump -u user -p database | gzip > db-backup.sql.gz
```

---

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pnpm dev

# Check environment variables
env | grep DATABASE_URL

# Check database connection
mysql -u user -p -h host
```

**Database connection fails:**
```bash
# Verify connection string
mysql -u user -p -h host -D database

# Check firewall rules
sudo ufw allow 3306

# Check credentials
# DATABASE_URL=mysql://user:password@host:3306/database
```

**High memory usage:**
```bash
# Check running processes
ps aux | grep node

# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm start

# Monitor memory
free -h
```

---

## Performance Optimization

### Caching

```typescript
// Redis Caching
import redis from "redis";

const client = redis.createClient();

// Cache API responses
app.get("/api/data", async (req, res) => {
  const cached = await client.get("data");
  if (cached) return res.json(JSON.parse(cached));

  const data = await fetchData();
  await client.setex("data", 3600, JSON.stringify(data));
  res.json(data);
});
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_engagement_user ON engagements(user_id);
CREATE INDEX idx_execution_engagement ON execution_jobs(engagement_id);

-- Analyze query performance
EXPLAIN SELECT * FROM engagements WHERE user_id = 1;
```

---

## Security Hardening

### Environment Security

```bash
# Secure .env file
chmod 600 .env

# Use secrets manager
aws secretsmanager create-secret --name cybersecurity/db-password
```

### Network Security

```bash
# Firewall Rules
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# SSH Key Management
ssh-keygen -t ed25519
chmod 600 ~/.ssh/id_ed25519
```

---

**Last Updated:** 2026-04-27
