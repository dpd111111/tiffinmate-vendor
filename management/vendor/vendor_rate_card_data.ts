/**
 * =========================================================================
 * VENDOR SETTLEMENT RATE CARD & MASTER PRODUCT REPOSITORY
 * =========================================================================
 * Authoritative digitized rate card as per official document:
 * Kitchen Menu & Vendor Settlement Rate Card (Navovia Next / NOV TIFFIN)
 * 
 * Rules:
 * - 3P Listing Rate (Zomato / Swiggy) vs Vendor Payout Settlement Rate
 * - Strict server-side verification: Vendor cannot alter rates
 */

export interface VendorRateItem {
  id: string;
  name: string;
  hindiName: string;
  category: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'special_thali' | 'breakfast_snacks' | 'vrat_special' | 'breads_desserts';
  categoryLabel: string;
  portions: Array<{
    size: 'Quarter' | 'Half' | 'Full' | 'Standard' | 'Per Pc' | '250g' | '300g' | '500g' | '700g';
    listingPrice: number;     // Customer / Zomato price
    vendorPayoutRate: number; // Settlement amount paid to vendor
  }>;
  lossBufferPercent?: number; // 7 to 12% as per contract
  inStock: boolean;
}

export const VENDOR_MASTER_RATE_CARD: VendorRateItem[] = [
  // --- MONDAY ---
  {
    id: 'mon_aloo_matar',
    name: 'Aloo Matar',
    hindiName: 'आलू मटर',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: 'mon_yellow_dal_tadka',
    name: 'Yellow Dal Tadka',
    hindiName: 'येलो दाल तड़का',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 129, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 199, vendorPayoutRate: 70 },
      { size: 'Full', listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: 'mon_kadhai_paneer',
    name: 'Kadhai Paneer',
    hindiName: 'कढ़ाई पनीर',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 65 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 95 },
      { size: 'Full', listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: 'mon_kadhai_paneer_rice_bowl',
    name: 'Kadhai Paneer with Rice Bowl',
    hindiName: 'कढ़ाई पनीर विथ राइस बाउल',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 199, vendorPayoutRate: 75 },
      { size: 'Half', listingPrice: 299, vendorPayoutRate: 115 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: 'mon_yellow_dal_rice_bowl',
    name: 'Yellow Dal Tadka with Rice Bowl',
    hindiName: 'दाल तड़का विथ राइस बाउल',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 60 },
      { size: 'Half', listingPrice: 229, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: 'mon_aloo_matar_rice_bowl',
    name: 'Aloo Matar with Rice Bowl',
    hindiName: 'आलू मटर विथ राइस बाउल',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 55 },
      { size: 'Half', listingPrice: 239, vendorPayoutRate: 90 },
      { size: 'Full', listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: 'mon_daily_thali',
    name: 'Monday Daily Thali',
    hindiName: 'सोमवार डेली थाली',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }
    ],
    inStock: true
  },
  {
    id: 'mon_deluxe_thali',
    name: 'Monday Deluxe Thali',
    hindiName: 'सोमवार डीलक्स थाली',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }
    ],
    inStock: true
  },
  {
    id: 'mon_premium_thali',
    name: 'Monday Premium Thali',
    hindiName: 'सोमवार प्रीमियम थाली',
    category: 'monday',
    categoryLabel: 'सोमवार का मेनू',
    portions: [
      { size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },

  // --- TUESDAY ---
  {
    id: 'tue_bhindi_masala',
    name: 'Bhindi Masala',
    hindiName: 'भिंडी मसाला',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: 'tue_dal_fry',
    name: 'Dal Fry',
    hindiName: 'दाल फ्राई',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 129, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 199, vendorPayoutRate: 70 },
      { size: 'Full', listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: 'tue_shahi_paneer',
    name: 'Shahi Paneer',
    hindiName: 'शाही पनीर',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 65 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 95 },
      { size: 'Full', listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: 'tue_shahi_paneer_rice_bowl',
    name: 'Shahi Paneer with Rice Bowl',
    hindiName: 'शाही पनीर विथ राइस बाउल',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 199, vendorPayoutRate: 75 },
      { size: 'Half', listingPrice: 299, vendorPayoutRate: 115 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: 'tue_dal_fry_rice_bowl',
    name: 'Dal Fry with Rice Bowl',
    hindiName: 'दाल फ्राई विथ राइस बाउल',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 60 },
      { size: 'Half', listingPrice: 229, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: 'tue_daily_thali',
    name: 'Tuesday Daily Thali',
    hindiName: 'मंगलवार डेली थाली',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'tue_deluxe_thali',
    name: 'Tuesday Deluxe Thali',
    hindiName: 'मंगलवार डीलक्स थाली',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'tue_premium_thali',
    name: 'Tuesday Premium Thali',
    hindiName: 'मंगलवार प्रीमियम थाली',
    category: 'tuesday',
    categoryLabel: 'मंगलवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- WEDNESDAY ---
  {
    id: 'wed_lauki_kofta',
    name: 'Lauki Kofta / Dum Aloo',
    hindiName: 'लौकी कोफ्ता / दम आलू',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: 'wed_moong_dal_fry',
    name: 'Moong Dal Fry',
    hindiName: 'मूंग दाल फ्राई',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 129, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 199, vendorPayoutRate: 70 },
      { size: 'Full', listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: 'wed_paneer_do_pyaza',
    name: 'Paneer Do Pyaza',
    hindiName: 'पनीर दो प्याज़ा',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 65 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 95 },
      { size: 'Full', listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: 'wed_daily_thali',
    name: 'Wednesday Daily Thali',
    hindiName: 'बुधवार डेली थाली',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'wed_deluxe_thali',
    name: 'Wednesday Deluxe Thali',
    hindiName: 'बुधवार डीलक्स थाली',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'wed_premium_thali',
    name: 'Wednesday Premium Thali',
    hindiName: 'बुधवार प्रीमियम थाली',
    category: 'wednesday',
    categoryLabel: 'बुधवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- THURSDAY ---
  {
    id: 'thu_kadhi_pakoda',
    name: 'Kadhi Pakoda',
    hindiName: 'कढ़ी पकोड़ा',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 239, vendorPayoutRate: 80 },
      { size: 'Full', listingPrice: 329, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: 'thu_chana_dal_fry',
    name: 'Chana Dal Fry',
    hindiName: 'चना दाल फ्राई',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 129, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 199, vendorPayoutRate: 70 },
      { size: 'Full', listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: 'thu_palak_paneer',
    name: 'Palak Paneer',
    hindiName: 'पालक पनीर',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 169, vendorPayoutRate: 65 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 95 },
      { size: 'Full', listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: 'thu_daily_thali',
    name: 'Thursday Daily Thali',
    hindiName: 'गुरुवार डेली थाली',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'thu_deluxe_thali',
    name: 'Thursday Deluxe Thali',
    hindiName: 'गुरुवार डीलक्स थाली',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'thu_premium_thali',
    name: 'Thursday Premium Thali',
    hindiName: 'गुरुवार प्रीमियम थाली',
    category: 'thursday',
    categoryLabel: 'गुरुवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- FRIDAY ---
  {
    id: 'fri_baingan_bharta',
    name: 'Baingan Bharta',
    hindiName: 'बैंगन भरता',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 55 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 90 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 140 }
    ],
    inStock: true
  },
  {
    id: 'fri_butter_dal_fry',
    name: 'Butter Dal Fry',
    hindiName: 'बटर दाल फ्राई',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 129, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 199, vendorPayoutRate: 75 },
      { size: 'Full', listingPrice: 299, vendorPayoutRate: 110 }
    ],
    inStock: true
  },
  {
    id: 'fri_paneer_bhurji',
    name: 'Paneer Bhurji',
    hindiName: 'पनीर भुर्जी',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 199, vendorPayoutRate: 75 },
      { size: 'Half', listingPrice: 299, vendorPayoutRate: 115 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: 'fri_daily_thali',
    name: 'Friday Daily Thali',
    hindiName: 'शुक्रवार डेली थाली',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'fri_deluxe_thali',
    name: 'Friday Deluxe Thali',
    hindiName: 'शुक्रवार डीलक्स थाली',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'fri_premium_thali',
    name: 'Friday Premium Thali',
    hindiName: 'शुक्रवार प्रीमियम थाली',
    category: 'friday',
    categoryLabel: 'शुक्रवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- SATURDAY ---
  {
    id: 'sat_aloo_gobi',
    name: 'Aloo Gobi',
    hindiName: 'आलू गोभी',
    category: 'saturday',
    categoryLabel: 'शनिवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 149, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 249, vendorPayoutRate: 85 },
      { size: 'Full', listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: 'sat_butter_paneer_masala',
    name: 'Butter Paneer Masala',
    hindiName: 'बटर पनीर मसाला',
    category: 'saturday',
    categoryLabel: 'शनिवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 159, vendorPayoutRate: 60 },
      { size: 'Half', listingPrice: 239, vendorPayoutRate: 90 },
      { size: 'Full', listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: 'sat_daily_thali',
    name: 'Saturday Daily Thali',
    hindiName: 'शनिवार डेली थाली',
    category: 'saturday',
    categoryLabel: 'शनिवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'sat_deluxe_thali',
    name: 'Saturday Deluxe Thali',
    hindiName: 'शनिवार डीलक्स थाली',
    category: 'saturday',
    categoryLabel: 'शनिवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'sat_premium_thali',
    name: 'Saturday Premium Thali',
    hindiName: 'शनिवार प्रीमियम थाली',
    category: 'saturday',
    categoryLabel: 'शनिवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- SUNDAY ---
  {
    id: 'sun_aloo_jeera',
    name: 'Aloo Jeera',
    hindiName: 'आलू जीरा',
    category: 'sunday',
    categoryLabel: 'रविवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 99, vendorPayoutRate: 50 },
      { size: 'Half', listingPrice: 169, vendorPayoutRate: 60 },
      { size: 'Full', listingPrice: 249, vendorPayoutRate: 90 }
    ],
    inStock: true
  },
  {
    id: 'sun_matar_paneer',
    name: 'Matar Paneer',
    hindiName: 'मटर पनीर',
    category: 'sunday',
    categoryLabel: 'रविवार का मेनू',
    portions: [
      { size: 'Quarter', listingPrice: 159, vendorPayoutRate: 60 },
      { size: 'Half', listingPrice: 239, vendorPayoutRate: 90 },
      { size: 'Full', listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: 'sun_daily_thali',
    name: 'Sunday Daily Thali',
    hindiName: 'रविवार डेली थाली',
    category: 'sunday',
    categoryLabel: 'रविवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'sun_deluxe_thali',
    name: 'Sunday Deluxe Thali',
    hindiName: 'रविवार डीलक्स थाली',
    category: 'sunday',
    categoryLabel: 'रविवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'sun_premium_thali',
    name: 'Sunday Premium Thali',
    hindiName: 'रविवार प्रीमियम थाली',
    category: 'sunday',
    categoryLabel: 'रविवार का मेनू',
    portions: [{ size: 'Standard', listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },

  // --- SPECIAL DAILY THALIS ---
  {
    id: 'spl_veg_biryani_thali',
    name: 'Veg Biryani Thali (Biryani + Salad)',
    hindiName: 'वेज बिरयानी थाली (बिरयानी + सलाद)',
    category: 'special_thali',
    categoryLabel: 'विशेष दैनिक थाली',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 95 }],
    inStock: true
  },
  {
    id: 'spl_no_onion_garlic_thali',
    name: 'Thali without Onion Garlic with Desi Ghee',
    hindiName: 'बिना प्याज लहसुन थाली (शुद्ध देसी घी)',
    category: 'special_thali',
    categoryLabel: 'विशेष दैनिक थाली',
    portions: [{ size: 'Standard', listingPrice: 289, vendorPayoutRate: 90 }],
    inStock: true
  },

  // --- BREAKFAST & SNACKS ---
  {
    id: 'brk_aloo_paratha',
    name: '2 Aloo Paratha + Raita/Chutney',
    hindiName: '2 आलू पराठा + रायता/चटनी',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 189, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: 'brk_paneer_paratha',
    name: '2 Paneer Paratha + Raita/Chutney',
    hindiName: '2 पनीर पराठा + रायता/चटनी',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 75 }],
    inStock: true
  },
  {
    id: 'brk_gobi_paratha',
    name: '2 Gobi Paratha + Sauce/Chutney/Raita',
    hindiName: '2 गोभी पराठा + चटनी/रायता',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 219, vendorPayoutRate: 65 }],
    inStock: true
  },
  {
    id: 'brk_veg_chilla',
    name: 'Veg Chilla (2 Pcs) + Sauce',
    hindiName: 'वेज चीला (2 पीस) + सॉस',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_aloo_kachori',
    name: 'Aloo Kachori (2 Pcs) + Chutney',
    hindiName: 'आलू कचौड़ी (2 पीस) + चटनी',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_veg_sandwich',
    name: 'Veg Sandwich (2 Pc - Plain)',
    hindiName: 'वेज सैंडविच (2 पीस)',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 119, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_veg_grilled_sandwich',
    name: 'Veg Grilled Sandwich (2 Pc)',
    hindiName: 'वेज ग्रिल्ड सैंडविच (2 पीस)',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_veg_burger',
    name: 'Veg Burger (1 Pc)',
    hindiName: 'वेज बर्गर (1 पीस)',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 129, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_cheese_burger',
    name: 'Cheese Burger (1 Pc)',
    hindiName: 'चीज़ बर्गर (1 पीस)',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: 'brk_poha_combo',
    name: 'Veg Poha (250 g) + Desi Chai Combo',
    hindiName: 'वेज पोहा (250g) + देसी चाय कॉम्बो',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_upma_dahi',
    name: 'Veg Rawa Upma + Dahi',
    hindiName: 'वेज रवा उपमा + दही',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: 'brk_korean_maggi',
    name: 'Korean Maggi',
    hindiName: 'कोरियन मैगी',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता एवं स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },

  // --- VRAT SPECIAL ---
  {
    id: 'vrat_delux_thali',
    name: 'Delux Vrat Thali (Samak rice + aloo paneer + 2 kuttu chilla + raita)',
    hindiName: 'डीलक्स व्रत थाली (समाक राइस + आलू पनीर + 2 कुट्टू चीला + रायता)',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: 'vrat_classic_thali',
    name: 'Classic Vrat Thali (Samak rice + aloo sabji + 2 kuttu chilla + raita)',
    hindiName: 'क्लासिक व्रत थाली (समाक राइस + आलू सब्ज़ी + 2 कुट्टू चीला + रायता)',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: 'vrat_samak_khichdi',
    name: 'Samak Rice Khichdi Thali',
    hindiName: 'समाक राइस खिचड़ी थाली',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: 'vrat_sabudana_khichdi',
    name: 'Sabudana Khichdi + Raita Thali',
    hindiName: 'साबूदाना खिचड़ी + रायता थाली',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'vrat_aloo_pakoda_thali',
    name: 'Aloo Pakoda Vrat Thali (6 Pcs)',
    hindiName: 'आलू पकोड़ा व्रत थाली (6 पीस)',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: 'vrat_singhara_halwa',
    name: 'Singhara Atta Halwa (250 ml)',
    hindiName: 'सिंघाड़ा आटा हलवा (250 ml)',
    category: 'vrat_special',
    categoryLabel: 'व्रत थाली एवं व्रत स्नैक्स',
    portions: [{ size: 'Standard', listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },

  // --- BREADS, RICE & DESSERTS ---
  {
    id: 'brd_tawa_roti',
    name: 'Tawa Roti / Butter Tawa Roti',
    hindiName: 'तवा रोटी / बटर तवा रोटी',
    category: 'breads_desserts',
    categoryLabel: 'ब्रेड्स, चावल और मीठा',
    portions: [
      { size: 'Per Pc', listingPrice: 12, vendorPayoutRate: 4 },
      { size: 'Quarter', listingPrice: 15, vendorPayoutRate: 5 } // Butter
    ],
    inStock: true
  },
  {
    id: 'brd_butter_ajwain_paratha',
    name: 'Butter Ajwain Paratha',
    hindiName: 'बटर अजवाइन पराठा',
    category: 'breads_desserts',
    categoryLabel: 'ब्रेड्स, चावल और मीठा',
    portions: [{ size: 'Per Pc', listingPrice: 25, vendorPayoutRate: 10 }],
    inStock: true
  },
  {
    id: 'brd_plain_rice',
    name: 'Plain Rice (300 g) / Jeera Rice (300 g)',
    hindiName: 'प्लेन राइस / जीरा राइस (300g)',
    category: 'breads_desserts',
    categoryLabel: 'ब्रेड्स, चावल और मीठा',
    portions: [
      { size: '300g', listingPrice: 79, vendorPayoutRate: 50 },
      { size: 'Standard', listingPrice: 89, vendorPayoutRate: 50 } // Jeera Rice
    ],
    inStock: true
  },
  {
    id: 'snack_desi_chai',
    name: 'Desi Cutting Chai / Special Tea',
    hindiName: 'देसी स्पेशल चाय',
    category: 'breakfast_snacks',
    categoryLabel: 'नाश्ता व स्नैक्स',
    portions: [
      { size: '2 Cup', listingPrice: 99, vendorPayoutRate: 30 },
      { size: '4 Cup', listingPrice: 169, vendorPayoutRate: 60 },
      { size: '5 Cup', listingPrice: 199, vendorPayoutRate: 75 }
    ],
    inStock: true
  },
  {
    id: 'brd_sweet_kheer',
    name: 'Sweet Kheer',
    hindiName: 'मीठी खीर',
    category: 'breads_desserts',
    categoryLabel: 'ब्रेड्स, चावल और मीठा',
    portions: [
      { size: '300g', listingPrice: 149, vendorPayoutRate: 50 },
      { size: '500g', listingPrice: 229, vendorPayoutRate: 80 },
      { size: '700g', listingPrice: 329, vendorPayoutRate: 115 }
    ],
    inStock: true
  },
  {
    id: 'brd_suji_halwa',
    name: 'Suji Halwa',
    hindiName: 'सूजी हलवा',
    category: 'breads_desserts',
    categoryLabel: 'ब्रेड्स, चावल और मीठा',
    portions: [
      { size: '300g', listingPrice: 149, vendorPayoutRate: 50 },
      { size: '500g', listingPrice: 229, vendorPayoutRate: 75 },
      { size: '700g', listingPrice: 329, vendorPayoutRate: 110 }
    ],
    inStock: true
  }
];

export function findRateItem(itemId: string): VendorRateItem | undefined {
  return VENDOR_MASTER_RATE_CARD.find(item => item.id === itemId);
}

export function calculateVendorPayout(itemId: string, portionSize: string, quantity: number = 1): number {
  const item = findRateItem(itemId);
  if (!item) return 0;
  const portion = item.portions.find(p => p.size === portionSize) || item.portions[0];
  return (portion?.vendorPayoutRate || 0) * quantity;
}
