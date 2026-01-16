# ---- PHP deps (Composer) ----
FROM composer:2 AS vendor
WORKDIR /app

# ext-mongodb needed for composer platform requirements
RUN apk add --no-cache $PHPIZE_DEPS openssl-dev \
  && pecl install mongodb \
  && docker-php-ext-enable mongodb \
  && apk del $PHPIZE_DEPS openssl-dev

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress

COPY . .
RUN composer dump-autoload --optimize


# ---- Assets build (Vite) ----
# Build assets in an environment that has PHP + artisan + vendor (Wayfinder needs it)
FROM php:8.4-cli-alpine AS assets
WORKDIR /app

# Node + npm
RUN apk add --no-cache nodejs npm

# App code
COPY . .

# Vendor from composer stage (so artisan has deps)
COPY --from=vendor /app/vendor /app/vendor
COPY --from=vendor /app/bootstrap/cache /app/bootstrap/cache

# Build assets
RUN npm run build


# ---- Runtime ----
FROM php:8.4-cli-alpine
WORKDIR /var/www/html

# System deps + PHP extensions (NO MySQL)
RUN apk add --no-cache \
    bash icu-dev oniguruma-dev libzip-dev zip unzip \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    $PHPIZE_DEPS openssl-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j"$(nproc)" mbstring intl zip gd opcache \
  && pecl install mongodb \
  && docker-php-ext-enable mongodb \
  && apk del $PHPIZE_DEPS openssl-dev

# Copy app (including vendor)
COPY --from=vendor /app /var/www/html

# Copy built assets
COPY --from=assets /app/public/build /var/www/html/public/build

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
