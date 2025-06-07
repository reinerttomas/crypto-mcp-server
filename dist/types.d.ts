import { z } from 'zod';
export declare const CryptoSchema: z.ZodEnum<["bitcoin", "btc", "ethereum", "eth"]>;
export declare const CurrencySchema: z.ZodEnum<["usd", "eur", "czk"]>;
export declare const GetCryptoPriceInputSchema: z.ZodObject<{
    crypto: z.ZodDefault<z.ZodOptional<z.ZodEnum<["bitcoin", "btc", "ethereum", "eth"]>>>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodEnum<["usd", "eur", "czk"]>>>;
}, "strip", z.ZodTypeAny, {
    crypto: "bitcoin" | "btc" | "ethereum" | "eth";
    currency: "usd" | "eur" | "czk";
}, {
    crypto?: "bitcoin" | "btc" | "ethereum" | "eth" | undefined;
    currency?: "usd" | "eur" | "czk" | undefined;
}>;
export type Crypto = z.infer<typeof CryptoSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type GetCryptoPriceInput = z.infer<typeof GetCryptoPriceInputSchema>;
export interface CoinGeckoResponse {
    [cryptoId: string]: {
        usd: number;
        eur: number;
        czk: number;
    };
}
export interface CryptoInfo {
    id: string;
    name: string;
    symbol: string;
}
export interface CryptoPrice {
    cryptoName: string;
    cryptoSymbol: string;
    currency: string;
    price: number;
    timestamp: string;
}
export declare const CRYPTO_MAP: Record<Crypto, CryptoInfo>;
/**
 * Získá informace o kryptoměně z mapování
 * @param crypto - název kryptoměny
 * @returns informace o kryptoměně
 */
export declare function getCryptoInfo(crypto: Crypto): CryptoInfo;
/**
 * Získá seznam všech podporovaných kryptoměn jako string
 * @returns string se seznamem kryptoměn
 */
export declare function getSupportedCryptos(): string;
/**
 * Získá seznam unikátních CoinGecko ID pro API volání
 * @returns pole unikátních ID
 */
export declare function getUniqueCoinGeckoIds(): string[];
//# sourceMappingURL=types.d.ts.map