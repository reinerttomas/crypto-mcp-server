#!/usr/bin/env node

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

// Definice rozhraní (interface) pro odpověď z CoinGecko API
interface CoinGeckoResponse {
  bitcoin: {
    usd: number;
    eur: number;
    czk: number;
  };
}

// Definice rozhraní pro náš výsledek
interface BitcoinPrice {
  currency: string;
  price: number;
  timestamp: string;
}

/**
 * Funkce pro získání aktuální ceny Bitcoinu
 * @param currency - měna (usd, eur, czk)
 * @returns Promise s cenou Bitcoinu
 */
async function getBitcoinPrice(currency: string = 'usd'): Promise<BitcoinPrice> {
  try {
    // Volání CoinGecko API
    const response = await axios.get<CoinGeckoResponse>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,czk'
    );

    // Kontrola, zda máme platnou odpověď
    if (!response.data.bitcoin || !response.data.bitcoin[currency as keyof typeof response.data.bitcoin]) {
      throw new Error(`Nepodporovaná měna: ${currency}`);
    }

    // Vrácení strukturovaných dat
    return {
      currency: currency.toUpperCase(),
      price: response.data.bitcoin[currency as keyof typeof response.data.bitcoin],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Pokud nastane chyba, vyhodíme ji dál
    throw new Error(`Chyba při získávání ceny Bitcoinu: ${error}`);
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
          name: 'get_bitcoin_price',
          description: 'Získá aktuální cenu Bitcoinu v zadané měně',
          inputSchema: {
            type: 'object',
            properties: {
              currency: {
                type: 'string',
                description: 'Měna (usd, eur, czk)',
                enum: ['usd', 'eur', 'czk'],
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
      case 'get_bitcoin_price': {
        try {
          // Získání měny z argumentů (výchozí je 'usd')
          const currency = (args?.currency as string) || 'usd';
          
          // Volání naší funkce
          const priceData = await getBitcoinPrice(currency);
          
          return {
            content: [
              {
                type: 'text',
                text: `💰 Aktuální cena Bitcoinu: ${priceData.price.toLocaleString('cs-CZ')} ${priceData.currency}\n⏰ Čas: ${new Date(priceData.timestamp).toLocaleString('cs-CZ')}`
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
}

// Spuštění hlavní funkce
main().catch((error) => {
  console.error('❌ Chyba při spuštění serveru:', error);
  process.exit(1);
}); 