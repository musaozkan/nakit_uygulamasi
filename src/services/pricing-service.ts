import { BitfinexPricingClient } from '@tetherto/wdk-pricing-bitfinex-http';
import { PricingProvider } from '@tetherto/wdk-pricing-provider';
import { AssetTicker } from '@tetherto/wdk-react-native-provider';
import DecimalJS from 'decimal.js';

export enum FiatCurrency {
  USD = 'USD',
}

class PricingService {
  private static instance: PricingService;
  private provider: PricingProvider | null = null;
  private fiatExchangeRateCache: Record<FiatCurrency, Record<AssetTicker, number>> | undefined;
  private isInitialized: boolean = false;

  private constructor() { }

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.provider) return;

    try {
      const client = new BitfinexPricingClient();

      this.provider = new PricingProvider({
        client,
        priceCacheDurationMs: 1000 * 60 * 60, // 1 hour
      });

      // Fetch and update exchange rate cache
      console.log('📡 Fetching exchange rates from Bitfinex...');

      let btcRate, xautRate;

      try {
        btcRate = await this.provider.getLastPrice(AssetTicker.BTC, FiatCurrency.USD);
        console.log('✅ BTC rate:', btcRate);
      } catch (error) {
        console.error('❌ Failed to fetch BTC rate:', error);
        btcRate = 0; // Fallback
      }

      try {
        xautRate = await this.provider.getLastPrice(AssetTicker.XAUT, FiatCurrency.USD);
        console.log('✅ XAUT rate:', xautRate);
      } catch (error) {
        console.error('❌ Failed to fetch XAUT rate:', error);
        xautRate = 2000; // Fallback: ~$2000 per troy ounce
      }

      this.fiatExchangeRateCache = {
        [FiatCurrency.USD]: {
          [AssetTicker.BTC]: btcRate,
          [AssetTicker.USDT]: 1,
          [AssetTicker.XAUT]: xautRate,
        },
      };

      console.log("💰 Exchange rates loaded:", this.fiatExchangeRateCache[FiatCurrency.USD]);
      console.log("Pricing service initialized");

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize pricing service (using default rates):', error);
      throw error;
    }
  }

  async getFiatValue(value: number, asset: AssetTicker, currency: FiatCurrency): Promise<number> {
    if (!this.isInitialized || !this.fiatExchangeRateCache) {
      throw new Error('Pricing service not initialized. Call initialize() first.');
    }

    const exchangeRate = this.fiatExchangeRateCache[currency][asset];
    console.log(`💱 Exchange rate for ${asset}/${currency}:`, exchangeRate);

    if (exchangeRate === undefined) {
      throw new Error(`Exchange rate for ${asset}/${currency} not found in cache`);
    }

    return new DecimalJS(value).mul(exchangeRate).toNumber();
  }

  async refreshExchangeRates(): Promise<void> {
    if (!this.provider) {
      throw new Error('Pricing service not initialized');
    }

    try {
      this.fiatExchangeRateCache = {
        [FiatCurrency.USD]: {
          [AssetTicker.BTC]: await this.provider.getLastPrice(AssetTicker.BTC, FiatCurrency.USD),
          [AssetTicker.USDT]: 1,
          [AssetTicker.XAUT]: await this.provider.getLastPrice(AssetTicker.XAUT, FiatCurrency.USD),
        },
      };

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to refresh exchange rates:', error);
      throw error;
    }
  }

  getExchangeRate(asset: AssetTicker, currency: FiatCurrency): number | undefined {
    return this.fiatExchangeRateCache?.[currency]?.[asset];
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const pricingService = PricingService.getInstance();
