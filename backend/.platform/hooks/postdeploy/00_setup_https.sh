#!/usr/bin/env bash
set -euo pipefail

DOMAIN_PRIMARY="sixdegrees.dev"
DOMAIN_WWW="www.sixdegrees.dev"
EMAIL="mantasv@seas.upenn.edu"
APP_PORT="4000"

dnf -y update || true
dnf -y install nginx certbot python3-certbot-nginx || true
systemctl enable nginx
systemctl start nginx

cat > /etc/nginx/conf.d/sixdegrees.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN_PRIMARY} ${DOMAIN_WWW};

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

nginx -t
systemctl reload nginx

certbot --nginx \
  -d "${DOMAIN_PRIMARY}" -d "${DOMAIN_WWW}" \
  --non-interactive --agree-tos --email "${EMAIL}" || true

systemctl enable --now certbot-renew.timer || true
