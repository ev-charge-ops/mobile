# EV ChargeOps — App do motorista

**Enterprise Challenge 2026 — FIAP × GoodWe · Grupo 23 · Sprint 02**

App mobile (Android e iOS) do EV ChargeOps para o motorista. Com ele, o morador do condomínio ou o visitante escolhe um ponto de recarga, vê o preço do momento, inicia a recarga com um limite, acompanha a sessão ao vivo, paga com cartão no ponto de visitantes e consulta o recibo e o histórico.

O app consome a [`api`](https://github.com/ev-charge-ops/api). O gestor do condomínio usa o portal [`web`](https://github.com/ev-charge-ops/web).

> A visão geral da solução, a arquitetura, as decisões (ADRs) e o roteiro de avaliação estão no repositório hub [`ev-charge-ops/docs`](https://github.com/ev-charge-ops/docs), a partir do [README](https://github.com/ev-charge-ops/docs#readme).

## Produção

- **Android:** APK de distribuição interna gerado pelo EAS Build.
- **iOS:** build distribuído pelo TestFlight.
- **API usada:** [api.evchargeops.com.br](https://api.evchargeops.com.br)

**Os links de instalação (APK e convite do TestFlight) estão no arquivo da entrega**, junto com a conta de demonstração do motorista. Também é possível criar uma conta própria no app; ela entra como motorista sem condomínio e só enxerga o ponto comercial.

## Stack

| Camada | Tecnologia |
|---|---|
| Base | Expo SDK 57, React Native 0.86, React 19, TypeScript 6 |
| Navegação | Expo Router (rotas por arquivo em `src/app`) |
| Dados do servidor | TanStack Query 5, `openapi-fetch` com tipos gerados por `openapi-typescript` a partir do OpenAPI da API |
| Formulários | React Hook Form + Zod |
| Pagamento | `@stripe/stripe-react-native` (PaymentSheet, modo de teste) |
| Login social | `@react-native-google-signin/google-signin` e `expo-apple-authentication` |
| Armazenamento seguro | `expo-secure-store` (Keychain/Keystore) para o refresh token |
| Interface | `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`, `lucide-react-native`, `expo-image`, fontes Nunito e JetBrains Mono |
| Atualizações | `expo-updates` (EAS Update) |
| Qualidade | Jest (`jest-expo`) + Testing Library, `expo lint` com `eslint-plugin-boundaries`, `tsc` |

## Principais funcionalidades

- **Conta** ([ADR 0007](https://github.com/ev-charge-ops/docs/blob/main/adr/0007-authentication.md) e [ADR 0008](https://github.com/ev-charge-ops/docs/blob/main/adr/0008-authentication-flows.md)): cadastro, login com e-mail e senha, login por código ou link enviado por e-mail, Google e Apple, recuperação de senha e verificação de e-mail. Links de convite, de login, de verificação e de troca de senha em `app.evchargeops.com.br` abrem direto no app (App Links e Universal Links).
- **Início:** organizações do usuário com papel e unidade, e atalho para a sessão ativa.
- **Pontos de recarga:** lista com estado, potência e preço por kWh do momento, atualizada a cada 30 s.
- **Preço** ([ADR 0011](https://github.com/ev-charge-ops/docs/blob/main/adr/0011-pricing-with-demand-factor.md)):
  - no ponto `PRIVATE` (condomínio), a cobrança é a tarifa da concessionária e o fator de demanda da IA aparece **só como informação**, para orientar o melhor horário;
  - no ponto `COMMERCIAL` (visitantes), o preço é `tarifa base × fator de demanda`.
- **Iniciar recarga:** o motorista escolhe o limite (até completar, em kWh ou em R$) e vê o preço travado para a sessão ([ADR 0010](https://github.com/ev-charge-ops/docs/blob/main/adr/0010-charging-session-state-machine.md)).
- **Sessão ao vivo:** energia, potência, porcentagem de carga e valor, além da contagem da tolerância e da multa por ocupação. O app consulta a sessão a cada 2 s, e **é essa leitura que faz a sessão avançar** na API, que não tem processo em segundo plano. Em produção a simulação é acelerada: 1 s real equivale a 1 min de recarga.
- **Pagamento no ponto comercial** ([ADR 0014](https://github.com/ev-charge-ops/docs/blob/main/adr/0014-stripe-preauthorization.md)): **só o ponto `COMMERCIAL`** abre o PaymentSheet do Stripe em modo de teste. O valor é pré-autorizado antes de a recarga começar, e no encerramento só o consumido é capturado. Os dados do cartão ficam no componente do Stripe e não passam pela API. Nos pontos `PRIVATE` não há cartão; a cobrança vai para o rateio mensal da unidade ([ADR 0013](https://github.com/ev-charge-ops/docs/blob/main/adr/0013-monthly-cost-sharing.md)).
- **Recibo e histórico:** detalhe da sessão encerrada (energia, tarifa, fator e sua origem, multa e total) e lista das sessões anteriores.

A detecção de anomalias ([ADR 0012](https://github.com/ev-charge-ops/docs/blob/main/adr/0012-anomaly-detection.md)) acontece na API ao encerrar a sessão e aparece só para o gestor, no portal.

## Estrutura de pastas

```
mobile/
├── .eas/workflows/            EAS Workflows de deploy (main) e de preview por PR
├── .github/workflows/ci.yml   lint, checagem de tipos e testes
├── assets/                    ícones, splash e imagens
├── scripts/
│   └── generate-api-schema.mjs  gera src/lib/api-schema.d.ts a partir do OpenAPI da API
├── src/
│   ├── app/                   rotas do Expo Router (só rotas e layouts)
│   │   ├── (auth)/            login, cadastro e recuperação de senha
│   │   ├── (app)/             área logada: início, pontos, sessões e catálogo de componentes
│   │   ├── login/email.tsx    login por link de e-mail
│   │   ├── invite.tsx, reset-password.tsx, verify-email.tsx   destinos dos deep links
│   │   └── _layout.tsx        layout raiz e providers
│   ├── features/              uma pasta por domínio
│   │   ├── auth/              api/, components/, screens/, oauth/ e session/ (sessão do usuário e tokens)
│   │   ├── charging/          api/, components/, screens/ e payments/ (PaymentSheet do Stripe)
│   │   ├── home/              tela inicial e organizações
│   │   └── showcase/          catálogo do design system
│   ├── components/ui/         design system (botões, cartões, campos, sheet, toast...)
│   ├── lib/                   cliente da API, tipos gerados, React Query e armazenamento seguro
│   ├── providers/             providers do app
│   ├── constants/             tema e tema de navegação
│   ├── config/                variáveis de ambiente validadas com Zod
│   ├── hooks/                 fontes e relógio
│   └── utils/                 formatação de moeda e energia
├── app.json                   configuração do Expo (bundle IDs, deep links, plugins, EAS Update)
├── eas.json                   perfis de build (preview e production) e submit
└── jest.setup.ts
```

As dependências seguem `app → features → compartilhado`, e uma feature não importa outra. O `expo lint` (`eslint-plugin-boundaries`) garante essa regra. Arquivos `*.web.ts` são as variantes para a versão web do Expo; nela o pagamento com cartão não está disponível.

## Como rodar localmente

Requisitos: Node 24, a [`api`](https://github.com/ev-charge-ops/api) rodando (local ou produção) e um emulador Android, simulador iOS ou aparelho.

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Uso |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL da API (padrão `http://localhost:3000`). No aparelho, use o IP da máquina na rede local em vez de `localhost` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | client IDs do Google Sign-In; vazios desligam o login com Google |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | chave publicável **de teste** do Stripe, usada quando a API não devolve uma |

As variáveis `EXPO_PUBLIC_*` vão para o bundle do app, então nunca coloque segredos nelas. Os valores de produção ficam nas variáveis de ambiente da EAS.

### 2. Comandos

```bash
npm ci                 # instala as dependências
npm start              # expo start: servidor de desenvolvimento
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm test               # testes (Jest)
npm run test:watch     # testes em modo watch
npm run lint           # expo lint
npx tsc --noEmit       # checagem de tipos
npm run gen:api        # regenera os tipos da API (API_SCHEMA_URL, padrão http://localhost:3000/docs-json)
```

O app usa módulos nativos (Stripe, Google Sign-In e Apple), que não estão todos disponíveis no Expo Go. Para testar esses fluxos, gere um build nativo local com `npx expo run:android` ou `npx expo run:ios`.

## Testes, CI e deploy

- **Testes** (`*.test.ts(x)`): Jest com `jest-expo` e Testing Library. Cobrem as telas de autenticação e de recarga, os componentes de UI, o cliente da API, a sessão do usuário e as funções de formatação e de tempo da sessão.
- **CI no GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), em todo PR e push na `main`: `npm ci`, `npm run lint`, `tsc --noEmit` e `npm test`.
- **Deploy com EAS Workflows** ([ADR 0015](https://github.com/ev-charge-ops/docs/blob/main/adr/0015-deploy-and-ci.md)), no plano pago **Expo Starter**. Todo deploy passa pelos workflows, sem publicação manual:
  - [`deploy-preview.yml`](.eas/workflows/deploy-preview.yml), a cada push na `main`: calcula o fingerprint nativo de cada plataforma e procura um build existente com esse fingerprint.
    - **Mudança nativa** (fingerprint novo): gera um build novo, com APK Android de distribuição interna e build iOS enviado ao TestFlight.
    - **Mudança só de JavaScript** (fingerprint já existente): publica uma atualização OTA (EAS Update) no canal `preview`, aplicada aos builds instalados sem passar pela loja.
  - [`publish-pr-update.yml`](.eas/workflows/publish-pr-update.yml), em cada PR para a `main`: publica uma OTA num branch com o nome do PR, para revisar a mudança num build de preview.
- Os perfis de build estão no [`eas.json`](eas.json): `preview` (APK interno e iOS para TestFlight, canal `preview`) e `production`.
