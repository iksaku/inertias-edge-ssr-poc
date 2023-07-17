# POC Inertia Edge SSR

## Installation

Install composer and pnpm dependencies:
```shell
composer install
pnpm install
```

Copy `.env.example` to `.env` and generate an application key:
```shell
cp .env.example .env
php artisan key:generate
```

## Usage

You must build Client and SSR assets beforehand:
```shell
pnpm build        # Client Assets
pnpm build --ssr  # Edge Renderer
```

You can also opt-in to watch mode in separate terminals:
```shell
pnpm build -w       # Client Assets
pnpm build --ssr -w # Edge Renderer
```

After that, you can start the Laravel Server:
```shell
php artisan serve
```

Lastly, you must also start the Edge Server:
```shell
pnpm wrangler dev
```

As we're trying to test the Edge Renderer, you must access the app through the Edge Server,
not the Laravel Server, at `http://localhost:8787`.

The SSR code is located at `resources/js/ssr.ts`.
