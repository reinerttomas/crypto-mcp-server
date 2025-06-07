#!/usr/bin/env node
"use strict";
/**
 * Crypto MCP Server
 * Tento server poskytuje nástroje pro získávání aktuálních cen kryptoměn
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
/**
 * Funkce pro získání aktuální ceny Bitcoinu
 * @param currency - měna (usd, eur, czk)
 * @returns Promise s cenou Bitcoinu
 */
async function getBitcoinPrice(currency = 'usd') {
    try {
        // Volání CoinGecko API
        const response = await axios_1.default.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,czk');
        // Kontrola, zda máme platnou odpověď
        if (!response.data.bitcoin || !response.data.bitcoin[currency]) {
            throw new Error(`Nepodporovaná měna: ${currency}`);
        }
        // Vrácení strukturovaných dat
        return {
            currency: currency.toUpperCase(),
            price: response.data.bitcoin[currency],
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        // Pokud nastane chyba, vyhodíme ji dál
        throw new Error(`Chyba při získávání ceny Bitcoinu: ${error}`);
    }
}
/**
 * Hlavní funkce serveru
 */
async function main() {
    // Vytvoření instance MCP serveru
    const server = new index_js_1.Server({
        name: 'crypto-mcp-server',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {}, // Náš server poskytuje nástroje
        },
    });
    // Registrace handleru pro seznam nástrojů
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        switch (name) {
            case 'get_bitcoin_price': {
                try {
                    // Získání měny z argumentů (výchozí je 'usd')
                    const currency = args?.currency || 'usd';
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
                }
                catch (error) {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('🚀 Crypto MCP Server je spuštěn!');
}
// Spuštění hlavní funkce
main().catch((error) => {
    console.error('❌ Chyba při spuštění serveru:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map