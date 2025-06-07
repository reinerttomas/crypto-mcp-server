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
const zod_1 = require("zod");
// Import našich typů a schémat
const types_1 = require("./types");
/**
 * Funkce pro získání aktuální ceny kryptoměny
 * @param crypto - název kryptoměny (bitcoin, ethereum, atd.)
 * @param currency - měna (usd, eur, czk)
 * @returns Promise s cenou kryptoměny
 */
async function getCryptoPrice(crypto = 'bitcoin', currency = 'usd') {
    try {
        // Validace vstupních parametrů pomocí Zod
        const validatedInput = types_1.GetCryptoPriceInputSchema.parse({
            crypto: crypto.toLowerCase(),
            currency: currency.toLowerCase()
        });
        // Získání informací o kryptoměně
        const cryptoInfo = (0, types_1.getCryptoInfo)(validatedInput.crypto);
        // Volání CoinGecko API
        const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoInfo.id}&vs_currencies=usd,eur,czk`);
        // Kontrola, zda máme platnou odpověď
        const cryptoData = response.data[cryptoInfo.id];
        if (!cryptoData || !cryptoData[validatedInput.currency]) {
            throw new Error(`Nepodporovaná měna: ${currency}`);
        }
        // Vrácení strukturovaných dat
        return {
            cryptoName: cryptoInfo.name,
            cryptoSymbol: cryptoInfo.symbol,
            currency: validatedInput.currency.toUpperCase(),
            price: cryptoData[validatedInput.currency],
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        // Pokud jde o Zod validační chybu
        if (error instanceof zod_1.z.ZodError) {
            const issues = error.issues.map(issue => issue.message).join(', ');
            throw new Error(`Neplatné parametry: ${issues}. Podporované kryptoměny: ${(0, types_1.getSupportedCryptos)()}`);
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
                    name: 'get_crypto_price',
                    description: 'Získá aktuální cenu kryptoměny v zadané měně',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            crypto: {
                                type: 'string',
                                description: 'Kryptoměna (bitcoin, btc, ethereum, eth)',
                                enum: [...types_1.CryptoSchema.options], // Dynamicky z Zod schématu
                                default: 'bitcoin'
                            },
                            currency: {
                                type: 'string',
                                description: 'Měna (usd, eur, czk)',
                                enum: [...types_1.CurrencySchema.options], // Dynamicky z Zod schématu
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
            case 'get_crypto_price': {
                try {
                    // Získání parametrů z argumentů
                    const crypto = args?.crypto || 'bitcoin';
                    const currency = args?.currency || 'usd';
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
    console.error(`📊 Podporované kryptoměny: ${(0, types_1.getSupportedCryptos)()}`);
    console.error(`💰 Podporované měny: ${types_1.CurrencySchema.options.join(', ')}`);
}
// Spuštění hlavní funkce
main().catch((error) => {
    console.error('❌ Chyba při spuštění serveru:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map