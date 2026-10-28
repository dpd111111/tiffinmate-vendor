/**
 * =========================================================================
 * CUSTOMER SUBSCRIPTION PLANS & PRICING
 * =========================================================================
 * Manages customer meal plans selection: 7-day, 15-day, 30-day schedules,
 * single lunch / dinner vs both meals, and diet preferences (Veg, Jain, Satvik).
 */

export interface CustomerTiffinPlan {
  id: string;
  name: string;
  hindiName: string;
  dietaryType: 'veg' | 'jain' | 'satvik' | 'diet';
  pricePerMeal: number;
  weeklyPrice: number;
  monthlyPrice: number;
  features: string[];
  isPopular?: boolean;
}

export const ACTIVE_CUSTOMER_MEAL_PLANS: CustomerTiffinPlan[] = [
  {
    id: 'pure_veg_homestyle_thali',
    name: 'Pure Homestyle Veg Thali',
    hindiName: 'शुद्ध देसी घी होमस्टाइल थाली',
    dietaryType: 'veg',
    pricePerMeal: 120,
    weeklyPrice: 799,
    monthlyPrice: 3299,
    features: [
      '4 ताज़ा देसी घी रोटियाँ',
      'स्वादिष्ट सब्ज़ी (पनीर / स्पेशल ग्रेवी)',
      'दाल तड़का / दाल मखनी',
      'बासमती जीरा राइस',
      'सलाद, रायता व मीठा'
    ],
    isPopular: true
  },
  {
    id: 'jain_satvik_thali',
    name: 'Strict Jain / Satvik Thali',
    hindiName: 'पवित्र जैन व सात्विक थाली (बिना प्याज़-लहसुन)',
    dietaryType: 'jain',
    pricePerMeal: 130,
    weeklyPrice: 849,
    monthlyPrice: 3499,
    features: [
      '100% बिना प्याज़, बिना लहसुन',
      'सुपाच्य, कम तेल व ताज़ी सब्ज़ी',
      'देसी घी की नरम रोटियाँ',
      'स्वादिष्ट मूंग/तुअर दाल'
    ]
  }
];
