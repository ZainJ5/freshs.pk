set -e
cd /var/www
if [ ! -d freshs-pk ]; then
  git clone https://github.com/ZainJ5/freshs.pk freshs-pk
else
  cd freshs-pk
  git pull
  cd ..
fi

cp MD-Burger/.env freshs-pk/
cd freshs-pk
npm install
npm run build
pm2 stop mdburger || true
pm2 delete freshs-pk || true
pm2 start server.js --name freshs-pk
node scripts/seed-categories.js
rm -f /etc/nginx/sites-enabled/mdburger-nginx.conf
ln -sf /var/www/freshs-pk/freshs-nginx.conf /etc/nginx/sites-enabled/
systemctl restart nginx
echo "Deployment successful!"
