"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRYPTO_MAP = exports.GetCryptoPriceInputSchema = exports.CurrencySchema = exports.CryptoSchema = void 0;
exports.getCryptoInfo = getCryptoInfo;
exports.getSupportedCryptos = getSupportedCryptos;
exports.getUniqueCoinGeckoIds = getUniqueCoinGeckoIds;
const zod_1 = require("zod");
// === ZOD SCHÉMATA PRO VALIDACI ===
// Podporované kryptoměny
exports.CryptoSchema = zod_1.z.enum([
    'bitcoin',
    'btc',
    'ethereum',
    'eth'
]);
// Podporované měny
exports.CurrencySchema = zod_1.z.enum([
    'usd',
    'eur',
    'czk'
]);
// Schéma pro vstupní parametry
exports.GetCryptoPriceInputSchema = zod_1.z.object({
    crypto: exports.CryptoSchema.optional().default('bitcoin'),
    currency: exports.CurrencySchema.optional().default('usd')
});
// === MAPOVÁNÍ KRYPTOMĚN ===
// Mapování běžných názvů na CoinGecko ID a informace
exports.CRYPTO_MAP = {
    'bitcoin': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    'btc': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    'ethereum': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    'eth': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' }
};
// === UTILITY FUNKCE ===
/**
 * Získá informace o kryptoměně z mapování
 * @param crypto - název kryptoměny
 * @returns informace o kryptoměně
 */
function getCryptoInfo(crypto) {
    return exports.CRYPTO_MAP[crypto];
}
/**
 * Získá seznam všech podporovaných kryptoměn jako string
 * @returns string se seznamem kryptoměn
 */
function getSupportedCryptos() {
    return Object.keys(exports.CRYPTO_MAP).join(', ');
}
/**
 * Získá seznam unikátních CoinGecko ID pro API volání
 * @returns pole unikátních ID
 */
function getUniqueCoinGeckoIds() {
    const ids = Object.values(exports.CRYPTO_MAP).map(info => info.id);
    return [...new Set(ids)]; // Odstranění duplikátů
}
//# sourceMappingURL=types.js.map