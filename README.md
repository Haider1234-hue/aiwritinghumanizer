# AI Writing Humanizer

React/Vite frontend for aiwritinghumanizer.com with a PHP-backed blog admin panel.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set these values in `.env` when using the live AI tools:

```bash
VITE_GROQ_API_KEY=
VITE_RAPIDAPI_KEY=
```

## Admin credentials

The admin panel is available at `/admin`. Do not commit real credentials.

For hosting, create `public/api/config.php` from `public/api/config.example.php` and set:

```php
<?php
return [
    'admin_username' => 'admin@aiwritinghumanizer',
    'admin_password' => 'your-secure-password',
];
```

`public/api/config.php` is ignored by Git.

## Build

```bash
npm run build
```

The Vite build outputs to `dist/`. The PHP API and static files under `public/` are copied into `dist/`.
