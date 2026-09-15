# EV ChargeOps — Mobile

Driver app for EV ChargeOps, built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction).

## Getting started

```bash
npm install
npx expo start
```

## Environment

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000`).

## Scripts

| Command            | Description                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `npm start`        | Start the dev server                                                                              |
| `npm run lint`     | Lint with `expo lint`, including dependency boundary rules                                        |
| `npx tsc --noEmit` | Typecheck                                                                                         |
| `npm test`         | Run unit tests with Jest                                                                          |
| `npm run gen:api`  | Generate `src/lib/api-schema.d.ts` from `API_SCHEMA_URL` (defaults to `http://localhost:3000/docs-json`) |

## Project structure

- `src/app`: routes and layouts only
- `src/features/<feature>`: `api`, `components`, `screens`, `hooks`, `types`
- `src/components/ui`: design system
- `src/hooks`, `src/lib`, `src/providers`, `src/constants`, `src/config`, `src/utils`, `src/types`: shared code

Dependencies flow `app → features → shared`; features never import each other.
