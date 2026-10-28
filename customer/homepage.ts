/**
 * =========================================================================
 * CUSTOMER HOMEPAGE & BANNER SHOWCASE
 * =========================================================================
 * Renders the pure desi ghee homestyle thali brand showcase,
 * daily 15-day live kitchen menu preview, and festive announcement banners.
 */

export interface CustomerHomeBanner {
  id: string;
  title: string;
  subtitle: string;
  tagText: string;
  badgeColor: string;
  isActive: boolean;
}

export interface CustomerDailyMenuCard {
  dayIndex: number; // 1 to 15
  dateString: string;
  isToday: boolean;
  dietaryType: 'pure_veg' | 'jain' | 'satvik';
  breakfast: string;
  lunch: string;
  dinner: string;
  chefSpecial: string;
}

export const DEFAULT_CUSTOMER_BANNERS: CustomerHomeBanner[] = [
  {
    id: 'banner_festive_special',
    title: '100% शुद्ध देसी घी • माँ के हाथ जैसा स्वाद',
    subtitle: 'ताज़ा गरमा-गरम होमस्टाइल थाली रोज़ाना समय पर आपके द्वार',
    tagText: 'Special Kitchen Fresh',
    badgeColor: '#2E7D32',
    isActive: true
  }
];
