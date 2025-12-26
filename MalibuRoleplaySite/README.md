# Malibu Roleplay Website (FiveM Style)

## Estrutura
- `web/` site estático (HTML/CSS/JS) com páginas: Home, Loja (carrinho), Regras, Equipe e Checkout.
- `server/` backend Node/Express para iniciar pagamentos Mercado Pago (PIX + cartão) e PayPal.

## Rodar local
### Front (web)
Abra `web/index.html` com Live Server (VS Code) ou qualquer servidor estático.

### Backend (server)
1. `cd server`
2. `npm i`
3. `cp .env.example .env` e preencha as chaves
4. `npm run dev`

## Configurações rápidas
- Discord: em `web/app.js` altere `DISCORD_INVITE_URL`
- Connect: em `web/app.js` altere `CONNECT_CMD`
- Backend URL: em `web/app.js` altere `BACKEND_BASE_URL`
