set -e

# Update PORT in freshs-pk
echo "PORT=3005" >> /var/www/freshs-pk/.env

# Pull the updated nginx conf
cd /var/www/freshs-pk
git pull
pm2 restart freshs-pk

# Restore mdburger nginx conf
cat << 'EOF' > /var/www/MD-Burger/mdburger-nginx.conf
# Redirect www -> non-www (HTTP)
server {
    listen 80;
    listen [::]:80;
    server_name www.mdburgerandbroast.com;
    return 301 http://mdburgerandbroast.com$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name mdburgerandbroast.com;

    client_max_body_size 20M;

    # Serve static images directly via nginx
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|pdf)$ {
        root /var/www/MD-Burger/public;
        access_log off;
        expires max;
        add_header Cache-Control "public, immutable";
    }

    # Proxy all requests to Next.js (port 3002)
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /var/www/MD-Burger/mdburger-nginx.conf /etc/nginx/sites-enabled/
ln -sf /var/www/freshs-pk/freshs-nginx.conf /etc/nginx/sites-enabled/

systemctl restart nginx
pm2 restart mdburger
