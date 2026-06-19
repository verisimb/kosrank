# KosRank — Laravel 13 + Inertia React, dibangun untuk Coolify.
# Memakai image serversideup yang sudah menyediakan nginx + php-fpm (PHP 8.4),
# composer, dan ekstensi umum (termasuk pdo_mysql). Node ditambahkan karena
# build Vite memanggil `php artisan wayfinder:generate`, jadi PHP & Node harus
# tersedia di tahap build yang sama.
FROM serversideup/php:8.4-fpm-nginx

# --- Install Node.js 22 (butuh root) ---
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Salin seluruh source (dengan kepemilikan www-data)
COPY --chown=www-data:www-data . .

# Install dependency PHP (tanpa dev) lalu build aset frontend.
# APP_KEY sementara hanya untuk proses build (wayfinder:generate butuh app boot),
# tidak ikut ke runtime. Saat runtime, APP_KEY diambil dari environment Coolify.
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && npm ci \
    && APP_KEY=base64:0000000000000000000000000000000000000000000= npm run build \
    && npm cache clean --force \
    && rm -rf node_modules

# Kembalikan user non-root bawaan image
USER www-data

# serversideup menyajikan aplikasi (nginx + php-fpm) pada port 8080.
EXPOSE 8080
