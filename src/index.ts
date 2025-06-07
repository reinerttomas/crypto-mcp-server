/**
 * Crypto MCP Server
 * Tento server poskytuje nástroje pro získávání aktuálních cen kryptoměn
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';

// Import našich typů a schémat
import {
  CryptoSchema,
  CurrencySchema,
  GetCryptoPriceInputSchema,
  type Crypto,
  type Currency,
  type GetCryptoPriceInput,
  type CoinGeckoResponse,
  type CryptoPrice,
  getCryptoInfo,
  getSupportedCryptos,
  getUniqueCoinGeckoIds
} from './types';

/**
 * Funkce pro získání aktuální ceny kryptoměny
 * @param crypto - název kryptoměny (bitcoin, ethereum, atd.)
 * @param currency - měna (usd, eur, czk)
 * @returns Promise s cenou kryptoměny
 */
async function getCryptoPrice(crypto: string = 'bitcoin', currency: string = 'usd'): Promise<CryptoPrice> {
  try {
    // Validace vstupních parametrů pomocí Zod
    const validatedInput = GetCryptoPriceInputSchema.parse({
      crypto: crypto.toLowerCase(),
      currency: currency.toLowerCase()
    });

    // Získání informací o kryptoměně
    const cryptoInfo = getCryptoInfo(validatedInput.crypto);

    // Volání CoinGecko API
    const response = await axios.get<CoinGeckoResponse>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoInfo.id}&vs_currencies=usd,eur,czk`
    );

    // Kontrola, zda máme platnou odpověď
    const cryptoData = response.data[cryptoInfo.id];
    if (!cryptoData || !cryptoData[validatedInput.currency as keyof typeof cryptoData]) {
      throw new Error(`Nepodporovaná měna: ${currency}`);
    }

    // Vrácení strukturovaných dat
    return {
      cryptoName: cryptoInfo.name,
      cryptoSymbol: cryptoInfo.symbol,
      currency: validatedInput.currency.toUpperCase(),
      price: cryptoData[validatedInput.currency as keyof typeof cryptoData],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Pokud jde o Zod validační chybu
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      throw new Error(`Neplatné parametry: ${issues}. Podporované kryptoměny: ${getSupportedCryptos()}`);
    }

    // Pokud nastane jiná chyba, vyhodíme ji dál
    throw new Error(`Chyba při získávání ceny kryptoměny: ${error}`);
  }
}

/**
 * Hlavní funkce serveru
 */
async function main() {
  // Vytvoření instance MCP serveru
  const server = new Server(
    {
      name: 'crypto-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {}, // Náš server poskytuje nástroje
      },
    }
  );

  // Registrace handleru pro seznam nástrojů
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_crypto_price',
          description: 'Získá aktuální cenu kryptoměny v zadané měně',
          inputSchema: {
            type: 'object',
            properties: {
              crypto: {
                type: 'string',
                description: 'Kryptoměna (bitcoin, btc, ethereum, eth)',
                enum: [...CryptoSchema.options], // Dynamicky z Zod schématu
                default: 'bitcoin'
              },
              currency: {
                type: 'string',
                description: 'Měna (usd, eur, czk)',
                enum: [...CurrencySchema.options], // Dynamicky z Zod schématu
                default: 'usd'
              }
            },
            required: []
          }
        }
      ]
    };
  });

  // Registrace handleru pro volání nástrojů
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'get_crypto_price': {
        try {
          // Získání parametrů z argumentů
          const crypto = (args?.crypto as string) || 'bitcoin';
          const currency = (args?.currency as string) || 'usd';

          // Volání naší funkce
          const priceData = await getCryptoPrice(crypto, currency);

          return {
            content: [
              {
                type: 'text',
                text: `🪙 ${priceData.cryptoName} (${priceData.cryptoSymbol}): ${priceData.price.toLocaleString('cs-CZ')} ${priceData.currency}\n⏰ Čas: ${new Date(priceData.timestamp).toLocaleString('cs-CZ')}`
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Chyba: ${error}`
              }
            ],
            isError: true
          };
        }
      }

      default:
        throw new Error(`Neznámý nástroj: ${name}`);
    }
  });

  // Spuštění serveru
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 Crypto MCP Server je spuštěn!');
  console.error(`📊 Podporované kryptoměny: ${getSupportedCryptos()}`);
  console.error(`💰 Podporované měny: ${CurrencySchema.options.join(', ')}`);
}

// Spuštění hlavní funkce
main().catch((error) => {
  console.error('❌ Chyba při spuštění serveru:', error);
  process.exit(1);
}); 