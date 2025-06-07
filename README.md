# Crypto MCP Server

TypeScript MCP (Model Context Protocol) server pro získávání aktuálních cen kryptoměn.

## Funkce

- 🪙 Získání aktuální ceny Bitcoinu v USD, EUR, nebo CZK
- 🔄 Real-time data z CoinGecko API
- 🛡️ Typová bezpečnost díky TypeScriptu
- ⚡ Rychlé a spolehlivé

## Instalace

```bash
npm install
```

## Kompilace

```bash
npm run build
```

## Spuštění

### Produkční režim
```bash
npm start
```

### Vývojový režim (s automatickým restartem)
```bash
npm run dev
```

## Použití

Server poskytuje následující nástroj:

### `get_bitcoin_price`
Získá aktuální cenu Bitcoinu v zadané měně.

**Parametry:**
- `currency` (nepovinný): "usd", "eur", nebo "czk" (výchozí: "usd")

**Příklad odpovědi:**
```
💰 Aktuální cena Bitcoinu: 67,234 USD
⏰ Čas: 15. 12. 2024 14:30:25
```

## Struktura projektu

```
src/
  index.ts          # Hlavní soubor serveru
dist/               # Zkompilované JavaScript soubory
tsconfig.json       # Konfigurace TypeScriptu
mcp-config.json     # Konfigurace MCP serveru
```

## Technologie

- TypeScript
- Node.js
- Model Context Protocol (MCP)
- Axios pro HTTP požadavky
- CoinGecko API

## License

ISC 