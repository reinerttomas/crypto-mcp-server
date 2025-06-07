import { z } from 'zod';

// === ZOD SCHÉMATA PRO VALIDACI ===

// Podporované kryptoměny
export const CryptoSchema = z.enum([
  'bitcoin', 
  'btc',
  'ethereum', 
  'eth'
]);

// Podporované měny
export const CurrencySchema = z.enum([
  'usd', 
  'eur', 
  'czk'
]);

// Schéma pro vstupní parametry
export const GetCryptoPriceInputSchema = z.object({
  crypto: CryptoSchema.optional().default('bitcoin'),
  currency: CurrencySchema.optional().default('usd')
});

// === TYPESCRIPT TYPY ===

// Typ pro podporované kryptoměny
export type Crypto = z.infer<typeof CryptoSchema>;

// Typ pro podporované měny  
export type Currency = z.infer<typeof CurrencySchema>;

// Typ pro vstupní parametry
export type GetCryptoPriceInput = z.infer<typeof GetCryptoPriceInputSchema>;

// === INTERFACES ===

// Rozhraní pro odpověď z CoinGecko API
export interface CoinGeckoResponse {
  [cryptoId: string]: {
    usd: number;
    eur: number;
    czk: number;
  };
}

// Informace o kryptoměně
export interface CryptoInfo {
  id: string;        // CoinGecko ID
  name: string;      // Plný název
  symbol: string;    // Symbol (BTC, ETH)
}

// Výsledek s cenou kryptoměny
export interface CryptoPrice {
  cryptoName: string;     // Název kryptoměny (např. "Bitcoin", "Ethereum")
  cryptoSymbol: string;   // Symbol (např. "BTC", "ETH")
  currency: string;       // Měna (USD, EUR, CZK)
  price: number;          // Cena
  timestamp: string;      // Čas získání
}

// === MAPOVÁNÍ KRYPTOMĚN ===

// Mapování běžných názvů na CoinGecko ID a informace
export const CRYPTO_MAP: Record<Crypto, CryptoInfo> = {
  'bitcoin': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  'btc': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  'ethereum': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  'eth': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' }
} as const;

// === UTILITY FUNKCE ===

/**
 * Získá informace o kryptoměně z mapování
 * @param crypto - název kryptoměny
 * @returns informace o kryptoměně
 */
export function getCryptoInfo(crypto: Crypto): CryptoInfo {
  return CRYPTO_MAP[crypto];
}

/**
 * Získá seznam všech podporovaných kryptoměn jako string
 * @returns string se seznamem kryptoměn
 */
export function getSupportedCryptos(): string {
  return Object.keys(CRYPTO_MAP).join(', ');
}

/**
 * Získá seznam unikátních CoinGecko ID pro API volání
 * @returns pole unikátních ID
 */
export function getUniqueCoinGeckoIds(): string[] {
  const ids = Object.values(CRYPTO_MAP).map(info => info.id);
  return [...new Set(ids)]; // Odstranění duplikátů
} 