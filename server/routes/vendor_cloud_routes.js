// server/routes/vendor_cloud_routes.ts
import fs from "fs";
import path from "path";

// management/vendor/vendor_rate_card_data.ts
var VENDOR_MASTER_RATE_CARD = [
  // --- MONDAY ---
  {
    id: "mon_aloo_matar",
    name: "Aloo Matar",
    hindiName: "\u0906\u0932\u0942 \u092E\u091F\u0930",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "mon_yellow_dal_tadka",
    name: "Yellow Dal Tadka",
    hindiName: "\u092F\u0947\u0932\u094B \u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "mon_kadhai_paneer",
    name: "Kadhai Paneer",
    hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "mon_kadhai_paneer_rice_bowl",
    name: "Kadhai Paneer with Rice Bowl",
    hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "mon_yellow_dal_rice_bowl",
    name: "Yellow Dal Tadka with Rice Bowl",
    hindiName: "\u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "mon_aloo_matar_rice_bowl",
    name: "Aloo Matar with Rice Bowl",
    hindiName: "\u0906\u0932\u0942 \u092E\u091F\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "mon_daily_thali",
    name: "Monday Daily Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }
    ],
    inStock: true
  },
  {
    id: "mon_deluxe_thali",
    name: "Monday Deluxe Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }
    ],
    inStock: true
  },
  {
    id: "mon_premium_thali",
    name: "Monday Premium Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  // --- TUESDAY ---
  {
    id: "tue_bhindi_masala",
    name: "Bhindi Masala",
    hindiName: "\u092D\u093F\u0902\u0921\u0940 \u092E\u0938\u093E\u0932\u093E",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "tue_dal_fry",
    name: "Dal Fry",
    hindiName: "\u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "tue_shahi_paneer",
    name: "Shahi Paneer",
    hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "tue_shahi_paneer_rice_bowl",
    name: "Shahi Paneer with Rice Bowl",
    hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "tue_dal_fry_rice_bowl",
    name: "Dal Fry with Rice Bowl",
    hindiName: "\u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "tue_daily_thali",
    name: "Tuesday Daily Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "tue_deluxe_thali",
    name: "Tuesday Deluxe Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "tue_premium_thali",
    name: "Tuesday Premium Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- WEDNESDAY ---
  {
    id: "wed_lauki_kofta",
    name: "Lauki Kofta / Dum Aloo",
    hindiName: "\u0932\u094C\u0915\u0940 \u0915\u094B\u092B\u094D\u0924\u093E / \u0926\u092E \u0906\u0932\u0942",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "wed_moong_dal_fry",
    name: "Moong Dal Fry",
    hindiName: "\u092E\u0942\u0902\u0917 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "wed_paneer_do_pyaza",
    name: "Paneer Do Pyaza",
    hindiName: "\u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "wed_daily_thali",
    name: "Wednesday Daily Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "wed_deluxe_thali",
    name: "Wednesday Deluxe Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "wed_premium_thali",
    name: "Wednesday Premium Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- THURSDAY ---
  {
    id: "thu_kadhi_pakoda",
    name: "Kadhi Pakoda",
    hindiName: "\u0915\u0922\u093C\u0940 \u092A\u0915\u094B\u0921\u093C\u093E",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 80 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "thu_chana_dal_fry",
    name: "Chana Dal Fry",
    hindiName: "\u091A\u0928\u093E \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "thu_palak_paneer",
    name: "Palak Paneer",
    hindiName: "\u092A\u093E\u0932\u0915 \u092A\u0928\u0940\u0930",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "thu_daily_thali",
    name: "Thursday Daily Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "thu_deluxe_thali",
    name: "Thursday Deluxe Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "thu_premium_thali",
    name: "Thursday Premium Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- FRIDAY ---
  {
    id: "fri_baingan_bharta",
    name: "Baingan Bharta",
    hindiName: "\u092C\u0948\u0902\u0917\u0928 \u092D\u0930\u0924\u093E",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 140 }
    ],
    inStock: true
  },
  {
    id: "fri_butter_dal_fry",
    name: "Butter Dal Fry",
    hindiName: "\u092C\u091F\u0930 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 110 }
    ],
    inStock: true
  },
  {
    id: "fri_paneer_bhurji",
    name: "Paneer Bhurji",
    hindiName: "\u092A\u0928\u0940\u0930 \u092D\u0941\u0930\u094D\u091C\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "fri_daily_thali",
    name: "Friday Daily Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "fri_deluxe_thali",
    name: "Friday Deluxe Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "fri_premium_thali",
    name: "Friday Premium Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SATURDAY ---
  {
    id: "sat_aloo_gobi",
    name: "Aloo Gobi",
    hindiName: "\u0906\u0932\u0942 \u0917\u094B\u092D\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "sat_butter_paneer_masala",
    name: "Butter Paneer Masala",
    hindiName: "\u092C\u091F\u0930 \u092A\u0928\u0940\u0930 \u092E\u0938\u093E\u0932\u093E",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 159, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "sat_daily_thali",
    name: "Saturday Daily Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "sat_deluxe_thali",
    name: "Saturday Deluxe Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "sat_premium_thali",
    name: "Saturday Premium Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SUNDAY ---
  {
    id: "sun_aloo_jeera",
    name: "Aloo Jeera",
    hindiName: "\u0906\u0932\u0942 \u091C\u0940\u0930\u093E",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 99, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Full", listingPrice: 249, vendorPayoutRate: 90 }
    ],
    inStock: true
  },
  {
    id: "sun_matar_paneer",
    name: "Matar Paneer",
    hindiName: "\u092E\u091F\u0930 \u092A\u0928\u0940\u0930",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 159, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "sun_daily_thali",
    name: "Sunday Daily Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "sun_deluxe_thali",
    name: "Sunday Deluxe Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "sun_premium_thali",
    name: "Sunday Premium Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SPECIAL DAILY THALIS ---
  {
    id: "spl_veg_biryani_thali",
    name: "Veg Biryani Thali (Biryani + Salad)",
    hindiName: "\u0935\u0947\u091C \u092C\u093F\u0930\u092F\u093E\u0928\u0940 \u0925\u093E\u0932\u0940 (\u092C\u093F\u0930\u092F\u093E\u0928\u0940 + \u0938\u0932\u093E\u0926)",
    category: "special_thali",
    categoryLabel: "\u0935\u093F\u0936\u0947\u0937 \u0926\u0948\u0928\u093F\u0915 \u0925\u093E\u0932\u0940",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 95 }],
    inStock: true
  },
  {
    id: "spl_no_onion_garlic_thali",
    name: "Thali without Onion Garlic with Desi Ghee",
    hindiName: "\u092C\u093F\u0928\u093E \u092A\u094D\u092F\u093E\u091C \u0932\u0939\u0938\u0941\u0928 \u0925\u093E\u0932\u0940 (\u0936\u0941\u0926\u094D\u0927 \u0926\u0947\u0938\u0940 \u0918\u0940)",
    category: "special_thali",
    categoryLabel: "\u0935\u093F\u0936\u0947\u0937 \u0926\u0948\u0928\u093F\u0915 \u0925\u093E\u0932\u0940",
    portions: [{ size: "Standard", listingPrice: 289, vendorPayoutRate: 90 }],
    inStock: true
  },
  // --- BREAKFAST & SNACKS ---
  {
    id: "brk_aloo_paratha",
    name: "2 Aloo Paratha + Raita/Chutney",
    hindiName: "2 \u0906\u0932\u0942 \u092A\u0930\u093E\u0920\u093E + \u0930\u093E\u092F\u0924\u093E/\u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 189, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "brk_paneer_paratha",
    name: "2 Paneer Paratha + Raita/Chutney",
    hindiName: "2 \u092A\u0928\u0940\u0930 \u092A\u0930\u093E\u0920\u093E + \u0930\u093E\u092F\u0924\u093E/\u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 75 }],
    inStock: true
  },
  {
    id: "brk_gobi_paratha",
    name: "2 Gobi Paratha + Sauce/Chutney/Raita",
    hindiName: "2 \u0917\u094B\u092D\u0940 \u092A\u0930\u093E\u0920\u093E + \u091A\u091F\u0928\u0940/\u0930\u093E\u092F\u0924\u093E",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 219, vendorPayoutRate: 65 }],
    inStock: true
  },
  {
    id: "brk_veg_chilla",
    name: "Veg Chilla (2 Pcs) + Sauce",
    hindiName: "\u0935\u0947\u091C \u091A\u0940\u0932\u093E (2 \u092A\u0940\u0938) + \u0938\u0949\u0938",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_aloo_kachori",
    name: "Aloo Kachori (2 Pcs) + Chutney",
    hindiName: "\u0906\u0932\u0942 \u0915\u091A\u094C\u0921\u093C\u0940 (2 \u092A\u0940\u0938) + \u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_sandwich",
    name: "Veg Sandwich (2 Pc - Plain)",
    hindiName: "\u0935\u0947\u091C \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 119, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_grilled_sandwich",
    name: "Veg Grilled Sandwich (2 Pc)",
    hindiName: "\u0935\u0947\u091C \u0917\u094D\u0930\u093F\u0932\u094D\u0921 \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_burger",
    name: "Veg Burger (1 Pc)",
    hindiName: "\u0935\u0947\u091C \u092C\u0930\u094D\u0917\u0930 (1 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 129, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_cheese_burger",
    name: "Cheese Burger (1 Pc)",
    hindiName: "\u091A\u0940\u091C\u093C \u092C\u0930\u094D\u0917\u0930 (1 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "brk_poha_combo",
    name: "Veg Poha (250 g) + Desi Chai Combo",
    hindiName: "\u0935\u0947\u091C \u092A\u094B\u0939\u093E (250g) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_upma_dahi",
    name: "Veg Rawa Upma + Dahi",
    hindiName: "\u0935\u0947\u091C \u0930\u0935\u093E \u0909\u092A\u092E\u093E + \u0926\u0939\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_korean_maggi",
    name: "Korean Maggi",
    hindiName: "\u0915\u094B\u0930\u093F\u092F\u0928 \u092E\u0948\u0917\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  // --- VRAT SPECIAL ---
  {
    id: "vrat_delux_thali",
    name: "Delux Vrat Thali (Samak rice + aloo paneer + 2 kuttu chilla + raita)",
    hindiName: "\u0921\u0940\u0932\u0915\u094D\u0938 \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 + \u0906\u0932\u0942 \u092A\u0928\u0940\u0930 + 2 \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E + \u0930\u093E\u092F\u0924\u093E)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "vrat_classic_thali",
    name: "Classic Vrat Thali (Samak rice + aloo sabji + 2 kuttu chilla + raita)",
    hindiName: "\u0915\u094D\u0932\u093E\u0938\u093F\u0915 \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 + \u0906\u0932\u0942 \u0938\u092C\u094D\u091C\u093C\u0940 + 2 \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E + \u0930\u093E\u092F\u0924\u093E)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_samak_khichdi",
    name: "Samak Rice Khichdi Thali",
    hindiName: "\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 \u0916\u093F\u091A\u0921\u093C\u0940 \u0925\u093E\u0932\u0940",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_sabudana_khichdi",
    name: "Sabudana Khichdi + Raita Thali",
    hindiName: "\u0938\u093E\u092C\u0942\u0926\u093E\u0928\u093E \u0916\u093F\u091A\u0921\u093C\u0940 + \u0930\u093E\u092F\u0924\u093E \u0925\u093E\u0932\u0940",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "vrat_aloo_pakoda_thali",
    name: "Aloo Pakoda Vrat Thali (6 Pcs)",
    hindiName: "\u0906\u0932\u0942 \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (6 \u092A\u0940\u0938)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "vrat_singhara_halwa",
    name: "Singhara Atta Halwa (250 ml)",
    hindiName: "\u0938\u093F\u0902\u0918\u093E\u0921\u093C\u093E \u0906\u091F\u093E \u0939\u0932\u0935\u093E (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  // --- BREADS, RICE & DESSERTS ---
  {
    id: "brd_tawa_roti",
    name: "Tawa Roti / Butter Tawa Roti",
    hindiName: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940 / \u092C\u091F\u0930 \u0924\u0935\u093E \u0930\u094B\u091F\u0940",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "Per Pc", listingPrice: 12, vendorPayoutRate: 4 },
      { size: "Quarter", listingPrice: 15, vendorPayoutRate: 5 }
      // Butter
    ],
    inStock: true
  },
  {
    id: "brd_butter_ajwain_paratha",
    name: "Butter Ajwain Paratha",
    hindiName: "\u092C\u091F\u0930 \u0905\u091C\u0935\u093E\u0907\u0928 \u092A\u0930\u093E\u0920\u093E",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [{ size: "Per Pc", listingPrice: 25, vendorPayoutRate: 10 }],
    inStock: true
  },
  {
    id: "brd_plain_rice",
    name: "Plain Rice (300 g) / Jeera Rice (300 g)",
    hindiName: "\u092A\u094D\u0932\u0947\u0928 \u0930\u093E\u0907\u0938 / \u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938 (300g)",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 79, vendorPayoutRate: 50 },
      { size: "Standard", listingPrice: 89, vendorPayoutRate: 50 }
      // Jeera Rice
    ],
    inStock: true
  },
  {
    id: "snack_desi_chai",
    name: "Desi Cutting Chai / Special Tea",
    hindiName: "\u0926\u0947\u0938\u0940 \u0938\u094D\u092A\u0947\u0936\u0932 \u091A\u093E\u092F",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [
      { size: "2 Cup", listingPrice: 99, vendorPayoutRate: 30 },
      { size: "4 Cup", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "5 Cup", listingPrice: 199, vendorPayoutRate: 75 }
    ],
    inStock: true
  },
  {
    id: "brd_sweet_kheer",
    name: "Sweet Kheer",
    hindiName: "\u092E\u0940\u0920\u0940 \u0916\u0940\u0930",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "500g", listingPrice: 229, vendorPayoutRate: 80 },
      { size: "700g", listingPrice: 329, vendorPayoutRate: 115 }
    ],
    inStock: true
  },
  {
    id: "brd_suji_halwa",
    name: "Suji Halwa",
    hindiName: "\u0938\u0942\u091C\u0940 \u0939\u0932\u0935\u093E",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "500g", listingPrice: 229, vendorPayoutRate: 75 },
      { size: "700g", listingPrice: 329, vendorPayoutRate: 110 }
    ],
    inStock: true
  }
];

// server/routes/vendor_cloud_routes.ts
var VENDOR_STORAGE_FILE = path.join(process.cwd(), "server_vendor_vault.json");
async function pushEventToGoogleSheet(_action, _payload) {
}
function loadVendorVault() {
  try {
    if (fs.existsSync(VENDOR_STORAGE_FILE)) {
      const raw = fs.readFileSync(VENDOR_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.refundDeductions) parsed.refundDeductions = [];
      if (!parsed.pendingDishes) parsed.pendingDishes = [];
      return parsed;
    }
  } catch (err) {
    console.error("[Vendor Vault Read Error]:", err);
  }
  const seedState = {
    vendorId: "NIR8800",
    orders: [],
    transactions: [],
    inventory: [],
    refundDeductions: [],
    pendingDishes: [],
    wallet: {
      totalLifetimeEarned: 0,
      currentBalance: 0,
      minimumReserve: 2e3,
      tenDayHoldAmount: 0,
      lastSettlementDate: "None",
      billingCycle: "Friday to Thursday",
      payoutDay: "Monday"
    }
  };
  saveVendorVault(seedState);
  return seedState;
}
function saveVendorVault(state) {
  try {
    fs.writeFileSync(VENDOR_STORAGE_FILE, JSON.stringify(state, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Vendor Vault Save Error]:", err);
    return false;
  }
}
function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}
function loadDynamicRateCard() {
  const syncedFile = path.join(process.cwd(), "server_rate_card_synced.csv");
  const assetFile = path.join(process.cwd(), "public/assets/aistudio/NOV_TIFFIN_-_Master_Vendor_Ledger___Rate_Card_142d571c");
  const filePath = fs.existsSync(syncedFile) ? syncedFile : fs.existsSync(assetFile) ? assetFile : null;
  if (filePath) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const itemsMap = /* @__PURE__ */ new Map();
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          if (!parts || parts.length < 2 || !parts[0]) continue;
          const id = parts[0];
          const name = parts[1] || id;
          const hindiName = parts[2] || name;
          const categoryLabel = parts[3] || "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938";
          const size = parts[4] || "Standard";
          const listingPrice = parseFloat(parts[5]) || 99;
          const vendorPayoutRate = parseFloat(parts[6]) || 40;
          const inStock = String(parts[7] || "YES").toUpperCase() !== "NO";
          let cat = "breakfast_snacks";
          let catLabel = categoryLabel || "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938";
          const masterMatch = VENDOR_MASTER_RATE_CARD.find((m) => m.id === id);
          if (masterMatch) {
            cat = masterMatch.category;
            catLabel = masterMatch.categoryLabel;
          } else {
            const lower = (id + " " + name + " " + (categoryLabel || "")).toLowerCase();
            if (lower.includes("tea") || lower.includes("chai") || lower.includes("snack") || lower.includes("samosa") || lower.includes("breakfast")) {
              cat = "breakfast_snacks";
              catLabel = "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938";
            } else if (lower.startsWith("mon_") || lower.includes("monday") || lower.includes("\u0938\u094B\u092E\u0935\u093E\u0930")) {
              cat = "monday";
              catLabel = "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("tue_") || lower.includes("tuesday") || lower.includes("\u092E\u0902\u0917\u0932\u0935\u093E\u0930")) {
              cat = "tuesday";
              catLabel = "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("wed_") || lower.includes("wednesday") || lower.includes("\u092C\u0941\u0927\u0935\u093E\u0930")) {
              cat = "wednesday";
              catLabel = "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("thu_") || lower.includes("thursday") || lower.includes("\u0917\u0941\u0930\u0941\u0935\u093E\u0930")) {
              cat = "thursday";
              catLabel = "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("fri_") || lower.includes("friday") || lower.includes("\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930")) {
              cat = "friday";
              catLabel = "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("sat_") || lower.includes("saturday") || lower.includes("\u0936\u0928\u093F\u0935\u093E\u0930")) {
              cat = "saturday";
              catLabel = "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.startsWith("sun_") || lower.includes("sunday") || lower.includes("\u0930\u0935\u093F\u0935\u093E\u0930")) {
              cat = "sunday";
              catLabel = "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942";
            } else if (lower.includes("thali")) {
              cat = "special_thali";
              catLabel = "\u0935\u093F\u0936\u0947\u0937 \u0925\u093E\u0932\u0940";
            } else if (lower.includes("vrat")) {
              cat = "vrat_special";
              catLabel = "\u0935\u094D\u0930\u0924 \u0938\u094D\u092A\u0947\u0936\u0932";
            } else if (lower.includes("roti") || lower.includes("paratha") || lower.includes("rice") || lower.includes("sweet") || lower.includes("halwa") || lower.includes("kheer")) {
              cat = "breads_desserts";
              catLabel = "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0935 \u092E\u0940\u0920\u093E";
            }
          }
          const cleanHindi = hindiName && hindiName !== id ? hindiName : id === "tea" ? "\u091A\u093E\u092F (Special Tea)" : name;
          const cleanName = name && name !== id ? name : id === "tea" ? "Special Tea / Chai" : name;
          if (!itemsMap.has(id)) {
            itemsMap.set(id, {
              id,
              name: cleanName,
              hindiName: cleanHindi,
              category: cat,
              categoryLabel: catLabel,
              portions: [],
              inStock
            });
          }
          const entry = itemsMap.get(id);
          entry.portions.push({
            size,
            listingPrice,
            vendorPayoutRate
          });
        }
        if (itemsMap.size > 0) {
          return Array.from(itemsMap.values());
        }
      }
    } catch (err) {
      console.error("[Rate Card CSV Parse Error]:", err);
    }
  }
  return VENDOR_MASTER_RATE_CARD;
}
function saveRateCardToCSV(items) {
  try {
    const headers = "Item ID,Dish Name,Hindi Name,Category,Portion Size,Listing Price (\u20B9),Vendor Payout Rate (\u20B9),In Stock,Last Updated";
    const lines = [headers];
    for (const item of items) {
      const portions = Array.isArray(item.portions) ? item.portions : [{ size: item.size || "Standard", listingPrice: item.listingPrice || 99, vendorPayoutRate: item.vendorPayoutRate || 40 }];
      for (const p of portions) {
        const row = [
          item.id || "",
          item.name || "",
          item.hindiName || item.name || "",
          item.categoryLabel || item.category || "\u0935\u093F\u0935\u093F\u0927 \u0921\u093F\u0936\u0947\u091C\u093C",
          p.size || "Standard",
          p.listingPrice || 99,
          p.vendorPayoutRate || 40,
          item.inStock !== false ? "YES" : "NO",
          (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        ];
        lines.push(row.map((c) => {
          const str = String(c ?? "").replace(/"/g, '""');
          return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
        }).join(","));
      }
    }
    const syncedFilePath = path.join(process.cwd(), "server_rate_card_synced.csv");
    fs.writeFileSync(syncedFilePath, lines.join("\n"), "utf-8");
  } catch (e) {
    console.error("[saveRateCardToCSV Error]:", e);
  }
}
function addRateCardItemToCSV(newItem) {
  const currentCard = loadDynamicRateCard();
  let baseId = (newItem.id || newItem.name.toLowerCase().replace(/[^a-z0-9]/g, "_")).replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!baseId) baseId = `dish_${Date.now()}`;
  let finalId = baseId;
  let counter = 1;
  while (currentCard.some((i) => i.id === finalId)) {
    finalId = `${baseId}_${counter++}`;
  }
  currentCard.push({
    id: finalId,
    name: newItem.name,
    hindiName: newItem.hindiName || newItem.name,
    category: newItem.category || "breakfast_snacks",
    categoryLabel: newItem.categoryLabel || "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: newItem.portions && newItem.portions.length > 0 ? newItem.portions : [{ size: "Standard", listingPrice: 99, vendorPayoutRate: 40 }],
    inStock: newItem.inStock !== false
  });
  saveRateCardToCSV(currentCard);
  return finalId;
}
function updateRateCardItemInCSV(itemId, updatedData) {
  const currentCard = loadDynamicRateCard();
  const index = currentCard.findIndex((i) => i.id === itemId);
  if (index >= 0) {
    currentCard[index] = {
      ...currentCard[index],
      ...updatedData
    };
  } else {
    currentCard.push({
      id: itemId,
      name: updatedData.name || itemId,
      hindiName: updatedData.hindiName || updatedData.name || itemId,
      category: "breakfast_snacks",
      categoryLabel: updatedData.categoryLabel || "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
      portions: updatedData.portions || [{ size: "Standard", listingPrice: 99, vendorPayoutRate: 40 }],
      inStock: updatedData.inStock !== false
    });
  }
  saveRateCardToCSV(currentCard);
  return true;
}
function deleteRateCardItemFromCSV(itemId) {
  const currentCard = loadDynamicRateCard();
  const filtered = currentCard.filter((i) => i.id !== itemId);
  saveRateCardToCSV(filtered);
  return true;
}
function registerVendorRoutes(app, authenticateStaffOrOwner, getSubscriptions) {
  app.get("/api/vendor/rate-card", async (_req, res) => {
    const vault = loadVendorVault();
    const dynamicRateCard = loadDynamicRateCard();
    const approvedCustom = (vault.pendingDishes || []).filter((d) => d.status === "APPROVED");
    const existingIds = new Set(dynamicRateCard.map((i) => i.id));
    const fullRateCard = [...dynamicRateCard];
    for (const d of approvedCustom) {
      if (!existingIds.has(d.id)) {
        fullRateCard.push({
          id: d.id,
          name: d.name,
          hindiName: d.hindiName,
          category: d.category,
          categoryLabel: d.categoryLabel,
          portions: d.portions,
          inStock: true
        });
      }
    }
    res.json({
      success: true,
      rateCard: fullRateCard,
      pendingDishes: (vault.pendingDishes || []).filter((d) => d.status === "PENDING"),
      syncedSource: "Owner Managed Master Rate Card (Internal)",
      contractTerms: {
        vendorId: "NIR8800",
        paymentCycle: "Friday to Thursday",
        payoutDay: "Every Monday",
        minimumReserveAmount: 2e3,
        tenDayHoldApplicable: true,
        wastageLossBufferPercent: "7% - 12%"
      }
    });
  });
  app.post("/api/vendor/rate-card/sync-csv", (req, res) => {
    try {
      const { csvContent } = req.body || {};
      if (!csvContent || typeof csvContent !== "string") {
        return res.status(400).json({ success: false, message: "CSV \u0915\u0902\u091F\u0947\u0902\u091F \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      }
      fs.writeFileSync(path.join(process.cwd(), "server_rate_card_synced.csv"), csvContent.trim(), "utf-8");
      const updated = loadDynamicRateCard();
      res.json({
        success: true,
        count: updated.length,
        rateCard: updated,
        message: `\u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 ${updated.length} \u0921\u093F\u0936\u0947\u091C\u093C Google Sheet / CSV \u0938\u0947 \u0932\u094B\u0921 \u0939\u094B \u0917\u0908 \u0939\u0948\u0902!`
      });
    } catch (err) {
      console.error("[Sync CSV Error]:", err);
      res.status(500).json({ success: false, message: "CSV \u0938\u093F\u0902\u0915 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u0930\u094D\u0935\u0930 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.post("/api/vendor/rate-card/submit-dish", (req, res) => {
    try {
      const { name, hindiName, category, categoryLabel, portions, notes } = req.body || {};
      if (!name || !portions || !Array.isArray(portions) || portions.length === 0) {
        return res.status(400).json({ success: false, message: "\u0921\u093F\u0936 \u0915\u093E \u0928\u093E\u092E \u0914\u0930 \u092A\u094B\u0930\u094D\u0936\u0928 \u0930\u0947\u091F \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.pendingDishes) vault.pendingDishes = [];
      const newDish = {
        id: `dish_custom_${Date.now()}`,
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        category: category || "custom_special",
        categoryLabel: categoryLabel || "\u0938\u094D\u092A\u0947\u0936\u0932 \u092E\u0940\u0932",
        portions: portions.map((p) => ({
          size: String(p.size || "Standard"),
          listingPrice: Number(p.listingPrice || 149),
          vendorPayoutRate: Number(p.vendorPayoutRate || 60)
        })),
        submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "PENDING",
        notes: notes || ""
      };
      vault.pendingDishes.unshift(newDish);
      saveVendorVault(vault);
      pushEventToGoogleSheet("vendor_dish_submission", { dish: newDish });
      console.log(`[Vendor Custom Dish]: Submitted ${newDish.name} for Owner Approval.`);
      res.json({
        success: true,
        dish: newDish,
        message: "\u0921\u093F\u0936 \u0913\u0928\u0930 \u0905\u092A\u094D\u0930\u0942\u0935\u0932 \u0939\u0947\u0924\u0941 \u0938\u092C\u092E\u093F\u091F \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964 \u0905\u092A\u094D\u0930\u0942\u0935 \u0939\u094B\u0924\u0947 \u0939\u0940 \u0906\u092A\u0915\u0947 \u092E\u0947\u0928\u094D\u092F\u0942 \u092E\u0947\u0902 \u0932\u093E\u0907\u0935 \u0939\u094B\u0917\u0940\u0964"
      });
    } catch (err) {
      console.error("[Submit Dish Error]:", err);
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u0938\u092C\u092E\u093F\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u0930\u094D\u0935\u0930 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.get("/api/vendor/wallet", (_req, res) => {
    const vault = loadVendorVault();
    const balance = vault.wallet.currentBalance;
    const reserve = vault.wallet.minimumReserve || 2e3;
    const hold = vault.wallet.tenDayHoldAmount || 0;
    const eligibleAmount = Math.max(0, balance - reserve - hold);
    res.json({
      success: true,
      wallet: {
        ...vault.wallet,
        currentBalance: balance,
        minimumReserve: reserve,
        tenDayHoldAmount: hold,
        eligibleMondayPayout: eligibleAmount,
        canRequestPayout: eligibleAmount > 0,
        refundDeductionsTotal: (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0),
        ruleSummary: {
          minimumReserveRule: "\u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0939\u092E\u0947\u0936\u093E \u20B92,000 \u0928\u094D\u092F\u0942\u0928\u0924\u092E \u0930\u093F\u091C\u093C\u0930\u094D\u0935 \u092C\u0948\u0932\u0947\u0902\u0938 \u0930\u0939\u0947\u0917\u093E\u0964",
          payoutSchedule: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0938\u0947 \u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u0947 \u092C\u093F\u0932\u093F\u0902\u0917 \u091A\u0915\u094D\u0930 \u0915\u093E \u0936\u0947\u0937 \u0939\u0930 \u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u094B \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0939\u094B\u0917\u093E\u0964",
          tenDayHoldRule: "10 \u0926\u093F\u0928 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B\u0932\u094D\u0921 \u092A\u0930 \u0930\u0939\u0947\u0917\u093E, \u091C\u094B DNS/\u0921\u093F\u0938\u094D\u092A\u094D\u092F\u0942\u091F \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0947 \u0938\u092E\u092F \u0930\u093F\u0932\u0940\u091C \u0939\u094B\u0917\u093E\u0964",
          refundDeductionRule: "\u0915\u0938\u094D\u091F\u092E\u0930 \u0915\u0948\u0902\u0938\u093F\u0932\u0947\u0936\u0928/\u0930\u093F\u092B\u0902\u0921 \u0939\u094B\u0928\u0947 \u092A\u0930 \u0924\u092F \u0935\u0947\u0902\u0921\u0930 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0935\u0949\u0932\u0947\u091F \u0938\u0947 \u0938\u094D\u0935\u0924\u0903 \u0915\u091F\u0947\u0917\u093E\u0964"
        }
      },
      transactions: vault.transactions.slice(0, 50),
      refundDeductions: (vault.refundDeductions || []).slice(0, 30)
    });
  });
  app.post("/api/vendor/orders/refund-deduct", (req, res) => {
    try {
      const { orderId, customerRefundAmount, vendorCutDeduction, reason } = req.body || {};
      if (!orderId || !vendorCutDeduction) {
        return res.status(400).json({ success: false, message: "Order ID \u0914\u0930 \u0935\u0947\u0902\u0921\u0930 \u0915\u091F\u094C\u0924\u0940 \u0930\u093E\u0936\u093F \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.refundDeductions) vault.refundDeductions = [];
      const cut = Math.max(0, Number(vendorCutDeduction));
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - cut);
      const record = {
        id: `deduct_${Date.now()}`,
        orderId: String(orderId).trim(),
        customerRefundAmount: Number(customerRefundAmount || 0),
        vendorCutDeducted: cut,
        reason: String(reason || "Customer Cancellation / Food Quality Refund").trim(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "deducted"
      };
      vault.refundDeductions.unshift(record);
      vault.transactions.unshift({
        id: `txn_deduct_${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: "refund_deduction",
        amount: -cut,
        description: `\u0930\u093F\u092B\u0902\u0921 \u0915\u091F\u094C\u0924\u0940: Order #${record.orderId} (${record.reason})`,
        referenceId: record.orderId,
        balanceAfter: vault.wallet.currentBalance,
        status: "settled",
        cyclePeriod: "Current Settlement Cycle"
      });
      saveVendorVault(vault);
      console.log(`[Vendor Refund Deduction]: Deducted \u20B9${cut} for Order #${record.orderId}. New Balance: \u20B9${vault.wallet.currentBalance}`);
      res.json({
        success: true,
        deduction: record,
        wallet: vault.wallet,
        message: `\u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u20B9${cut} \u0935\u0947\u0902\u0921\u0930 \u0915\u0947 \u0935\u0949\u0932\u0947\u091F \u0938\u0947 \u0915\u093E\u091F \u0932\u093F\u090F \u0917\u090F (Order #${record.orderId})\u0964`
      });
    } catch (err) {
      console.error("[Refund Deduct Error]:", err);
      res.status(500).json({ success: false, message: "\u0930\u093F\u092B\u0902\u0921 \u0915\u091F\u094C\u0924\u0940 \u092A\u094D\u0930\u094B\u0938\u0947\u0938 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u0930\u094D\u0935\u0930 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.get("/api/vendor/orders", (_req, res) => {
    const vault = loadVendorVault();
    const subs = getSubscriptions() || [];
    const autoSyncedTiffinOrders = subs.filter((s) => s && s.status === "active" && s.approvalStatus !== "pending_approval").slice(0, 20).map((s) => {
      const planName = s.planName || "Homestyle Executive Thali";
      const isDiet = String(s.dietaryType || "").toLowerCase().includes("diet");
      const isJain = String(s.dietaryType || "").toLowerCase().includes("jain");
      let payout = 80;
      if (planName.toLowerCase().includes("deluxe")) payout = 100;
      if (planName.toLowerCase().includes("premium")) payout = 135;
      return {
        id: `tiffin_sync_${s.id}`,
        orderNumber: `TFN-${String(s.id).slice(-6).toUpperCase()}`,
        source: "tiffin_website",
        platformOrderId: `TFN-WEB-${String(s.id).slice(-6)}`,
        itemId: "auto_tiffin_thali",
        itemName: `Tiffin: ${planName}`,
        portionSize: "Standard",
        quantity: 1,
        listingPrice: s.pricePerMeal || 130,
        vendorPayoutRate: payout,
        totalVendorPayout: payout,
        status: "ready",
        createdAt: s.startDate || (/* @__PURE__ */ new Date()).toISOString(),
        timeSlot: s.mealTime || "Lunch 12:30 PM - 1:30 PM",
        riderName: "TiffinMate Central Fleet Rider",
        riderEta: "Scheduled Dispatch",
        notes: `${isJain ? "No Onion No Garlic (Jain)" : isDiet ? "High Protein Less Oil" : "Pure Desi Ghee Homestyle"}`,
        dietaryType: s.dietaryType || "Veg",
        payoutCreditedToWallet: true
      };
    });
    const allOrders = [...vault.orders, ...autoSyncedTiffinOrders];
    res.json({
      success: true,
      vendorId: vault.vendorId,
      orders: allOrders,
      counts: {
        total: allOrders.length,
        thirdParty: vault.orders.length,
        tiffinAutoSynced: autoSyncedTiffinOrders.length,
        pending: allOrders.filter((o) => o.status === "received" || o.status === "preparing").length,
        ready: allOrders.filter((o) => o.status === "ready").length,
        delivered: allOrders.filter((o) => o.status === "delivered").length
      }
    });
  });
  app.post("/api/vendor/orders/punch-3p", (req, res) => {
    try {
      const {
        source,
        platformOrderId,
        items,
        // Optional array of items in this single order: [{ itemId, portionSize, quantity }]
        itemId,
        portionSize,
        quantity,
        timeSlot,
        notes
      } = req.body || {};
      if (!source || !platformOrderId) {
        return res.status(400).json({
          success: false,
          message: "\u0915\u0943\u092A\u092F\u093E \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E (Zomato/Swiggy) \u0914\u0930 \u0906\u0930\u094D\u0921\u0930 ID \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964"
        });
      }
      const vault = loadVendorVault();
      const existing = vault.orders.find((o) => o.platformOrderId === String(platformOrderId).trim());
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `\u0911\u0930\u094D\u0921\u0930 ID "${platformOrderId}" \u092A\u0939\u0932\u0947 \u0938\u0947 \u0926\u0930\u094D\u091C \u0939\u0948 (No Duplicate Allowed)\u0964`
        });
      }
      const allDishes = [...loadDynamicRateCard(), ...(vault.pendingDishes || []).filter((d) => d.status === "APPROVED")];
      let orderItems = [];
      let totalPayout = 0;
      let totalQty = 0;
      if (Array.isArray(items) && items.length > 0) {
        for (const itm of items) {
          const rateItem = allDishes.find((i) => i.id === itm.itemId);
          if (rateItem) {
            const cleanQty = Math.max(1, parseInt(itm.quantity, 10) || 1);
            const portionData = rateItem.portions.find((p) => p.size.toLowerCase() === String(itm.portionSize || "").toLowerCase()) || rateItem.portions[0];
            const rate = portionData.vendorPayoutRate;
            const itemTotal = rate * cleanQty;
            orderItems.push({
              itemId: rateItem.id,
              itemName: rateItem.name,
              hindiName: rateItem.hindiName,
              portionSize: portionData.size,
              quantity: cleanQty,
              listingPrice: portionData.listingPrice,
              vendorPayoutRate: rate,
              totalVendorPayout: itemTotal
            });
            totalPayout += itemTotal;
            totalQty += cleanQty;
          }
        }
      } else if (itemId) {
        const rateItem = allDishes.find((i) => i.id === itemId);
        if (rateItem) {
          const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);
          const portionData = rateItem.portions.find((p) => p.size.toLowerCase() === String(portionSize || "").toLowerCase()) || rateItem.portions[0];
          const rate = portionData.vendorPayoutRate;
          const itemTotal = rate * cleanQty;
          orderItems.push({
            itemId: rateItem.id,
            itemName: rateItem.name,
            hindiName: rateItem.hindiName,
            portionSize: portionData.size,
            quantity: cleanQty,
            listingPrice: portionData.listingPrice,
            vendorPayoutRate: rate,
            totalVendorPayout: itemTotal
          });
          totalPayout = itemTotal;
          totalQty = cleanQty;
        }
      }
      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "\u0915\u0943\u092A\u092F\u093E \u0915\u092E \u0938\u0947 \u0915\u092E \u090F\u0915 \u092E\u093E\u0928\u094D\u092F \u0906\u0907\u091F\u092E \u092C\u093E\u0938\u094D\u0915\u0947\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902\u0964"
        });
      }
      const summaryName = orderItems.map((i) => `${i.itemName} (${i.portionSize}) x${i.quantity}`).join(" + ");
      const newOrder = {
        id: `ord_3p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderNumber: String(platformOrderId).trim(),
        source,
        platformOrderId: String(platformOrderId).trim(),
        items: orderItems,
        itemId: orderItems[0].itemId,
        itemName: summaryName,
        portionSize: orderItems.length === 1 ? orderItems[0].portionSize : "Multiple Portions",
        quantity: totalQty,
        listingPrice: orderItems.reduce((acc, i) => acc + i.listingPrice * i.quantity, 0),
        vendorPayoutRate: totalPayout / Math.max(1, totalQty),
        totalVendorPayout: totalPayout,
        status: "preparing",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        timeSlot: timeSlot || "Immediate Dispatch (15-20 mins)",
        riderName: `${source.toUpperCase()} Rider Assigned`,
        riderEta: "12 mins",
        notes: notes || "",
        payoutCreditedToWallet: false,
        isMultiItem: orderItems.length > 1
      };
      vault.orders.unshift(newOrder);
      const packagingItem = vault.inventory.find((i) => i.category === "packaging" && i.currentStock > 0);
      if (packagingItem) {
        packagingItem.currentStock = Math.max(0, packagingItem.currentStock - totalQty);
        packagingItem.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
        if (packagingItem.currentStock <= packagingItem.minThreshold) {
          packagingItem.status = packagingItem.currentStock === 0 ? "critical" : "low";
        }
      }
      saveVendorVault(vault);
      pushEventToGoogleSheet("new_vendor_order", { order: newOrder });
      console.log(`[Vendor 3P Punch]: Order ${newOrder.orderNumber} punched with ${orderItems.length} items. Total Payout: \u20B9${totalPayout}`);
      res.json({
        success: true,
        order: newOrder,
        message: `\u0911\u0930\u094D\u0921\u0930 ${newOrder.orderNumber} (${orderItems.length} \u0906\u0907\u091F\u092E\u094D\u0938) \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u094D\u091C \u0939\u0941\u0906! \u0915\u0941\u0915 \u0938\u094D\u091F\u0947\u0936\u0928 \u092A\u0930 \u0924\u0948\u092F\u093E\u0930\u0940 \u0936\u0941\u0930\u0942\u0964`
      });
    } catch (err) {
      console.error("[Vendor 3P Punch Error]:", err);
      res.status(500).json({ success: false, message: "\u0911\u0930\u094D\u0921\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u0930\u094D\u0935\u0930 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.post("/api/vendor/orders/update-status", (req, res) => {
    try {
      const { orderId, newStatus } = req.body || {};
      if (!orderId || !newStatus) {
        return res.status(400).json({ success: false, message: "Order ID \u0914\u0930 \u0938\u094D\u091F\u0947\u091F\u0938 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      const order = vault.orders.find((o) => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "\u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      order.status = newStatus;
      if (newStatus === "delivered" && !order.payoutCreditedToWallet) {
        order.payoutCreditedToWallet = true;
        const payout = order.totalVendorPayout || 0;
        vault.wallet.currentBalance += payout;
        vault.wallet.totalLifetimeEarned += payout;
        vault.transactions.unshift({
          id: `txn_ord_${Date.now()}`,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          type: "order_credit",
          amount: payout,
          description: `Order Settlement: ${order.itemName} (${order.orderNumber})`,
          referenceId: order.orderNumber,
          balanceAfter: vault.wallet.currentBalance,
          status: "settled",
          cyclePeriod: "Current Fri-Thu Cycle"
        });
      }
      saveVendorVault(vault);
      pushEventToGoogleSheet("order_status_update", { orderId, newStatus, currentBalance: vault.wallet.currentBalance });
      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message: `\u0911\u0930\u094D\u0921\u0930 \u0938\u094D\u091F\u0947\u091F\u0938 "${newStatus}" \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u092F\u093E\u0964`
      });
    } catch (err) {
      console.error("[Vendor Status Update Error]:", err);
      res.status(500).json({ success: false, message: "\u0938\u094D\u091F\u0947\u091F\u0938 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.get("/api/vendor/sheets/status", (_req, res) => {
    res.json({
      success: true,
      sheetConfig: null,
      managedViaOwnerPanel: true,
      message: "Google Sheets removed cleanly. All rate cards, orders, and settlements managed in Owner Panel."
    });
  });
  app.get("/api/vendor/inventory", (_req, res) => {
    const vault = loadVendorVault();
    res.json({
      success: true,
      inventory: vault.inventory || []
    });
  });
  app.post("/api/vendor/inventory/update", (req, res) => {
    try {
      const { itemId, changeAmount, newQuantity } = req.body || {};
      const vault = loadVendorVault();
      const item = (vault.inventory || []).find((i) => i.id === itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: "\u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940 \u0906\u0907\u091F\u092E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      if (newQuantity !== void 0) {
        item.currentStock = Math.max(0, Number(newQuantity));
      } else if (changeAmount !== void 0) {
        item.currentStock = Math.max(0, item.currentStock + Number(changeAmount));
      }
      item.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      item.status = item.currentStock <= item.minThreshold ? item.currentStock === 0 ? "critical" : "low" : "sufficient";
      saveVendorVault(vault);
      res.json({
        success: true,
        item,
        message: `${item.name} \u0915\u093E \u0938\u094D\u091F\u0949\u0915 \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u092F\u093E (${item.currentStock} ${item.unit})`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0938\u094D\u091F\u0949\u0915 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.post("/api/owner/vendor/inventory/add", (req, res) => {
    try {
      const { name, hindiName, category, currentStock, unit, minThreshold } = req.body || {};
      if (!name) return res.status(400).json({ success: false, message: "\u0906\u0907\u091F\u092E \u0915\u093E \u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      const vault = loadVendorVault();
      if (!vault.inventory) vault.inventory = [];
      const newItem = {
        id: `inv_${Date.now()}`,
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        category: category || "raw_materials",
        currentStock: Math.max(0, Number(currentStock || 0)),
        unit: String(unit || "KG").trim(),
        minThreshold: Math.max(1, Number(minThreshold || 5)),
        status: Number(currentStock || 0) <= Number(minThreshold || 5) ? "low" : "sufficient",
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      vault.inventory.push(newItem);
      saveVendorVault(vault);
      res.json({ success: true, item: newItem, message: `\u0928\u092F\u093E \u0907\u0928\u094D\u0935\u0947\u0902\u091F\u094D\u0930\u0940 \u0906\u0907\u091F\u092E "${newItem.name}" \u091C\u094B\u0921\u093C\u093E \u0917\u092F\u093E!` });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940 \u0906\u0907\u091F\u092E \u091C\u094B\u0921\u093C\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.get("/api/owner/vendor/overview", (_req, res) => {
    try {
      const vault = loadVendorVault();
      const dynamicRateCard = loadDynamicRateCard();
      const grossEarned = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2e3;
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);
      res.json({
        success: true,
        rateCard: dynamicRateCard,
        pendingDishes: vault.pendingDishes || [],
        orders: vault.orders || [],
        wallet: {
          ...vault.wallet,
          eligibleMondayPayout: eligiblePay,
          totalRefundDeductions
        },
        transactions: vault.transactions || [],
        refundDeductions: vault.refundDeductions || [],
        inventory: vault.inventory || []
      });
    } catch (err) {
      console.error("[Owner Vendor Overview Error]:", err);
      res.status(500).json({ success: false, message: "\u0935\u0947\u0902\u0921\u0930 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/rate-card/update", (req, res) => {
    try {
      const { itemId, name, hindiName, categoryLabel, portions, inStock } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: "Item ID \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      updateRateCardItemInCSV(itemId, {
        name,
        hindiName,
        categoryLabel,
        inStock,
        portions
      });
      res.json({
        success: true,
        message: `\u0921\u093F\u0936 "${name || itemId}" \u0915\u093E \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u092F\u093E!`
      });
    } catch (err) {
      console.error("[Rate Card Update Error]:", err);
      res.status(500).json({ success: false, message: "\u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/rate-card/add", (req, res) => {
    try {
      const { name, hindiName, category, categoryLabel, portions, inStock } = req.body || {};
      if (!name) return res.status(400).json({ success: false, message: "\u0921\u093F\u0936 \u0915\u093E \u0928\u093E\u092E \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      const newId = addRateCardItemToCSV({
        name,
        hindiName,
        category,
        categoryLabel,
        portions: Array.isArray(portions) && portions.length > 0 ? portions : [{ size: "Standard", listingPrice: 99, vendorPayoutRate: 40 }],
        inStock: inStock !== false
      });
      res.json({
        success: true,
        dishId: newId,
        message: `\u0928\u0908 \u0921\u093F\u0936 "${name}" \u092E\u093E\u0938\u094D\u091F\u0930 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u092E\u0947\u0902 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u091C\u0941\u0921\u093C \u0917\u0908!`
      });
    } catch (err) {
      console.error("[Rate Card Add Error]:", err);
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u091C\u094B\u0921\u093C\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/rate-card/toggle-stock", (req, res) => {
    try {
      const { itemId, inStock } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: "Item ID \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      const updated = updateRateCardItemInCSV(itemId, { inStock: Boolean(inStock) });
      res.json({
        success: updated,
        inStock: Boolean(inStock),
        message: `\u0921\u093F\u0936 \u0915\u093E \u0938\u094D\u091F\u0949\u0915 \u0938\u094D\u091F\u0947\u091F\u0938 ${inStock ? "\u0909\u092A\u0932\u092C\u094D\u0927 (In Stock)" : "\u0938\u092E\u093E\u092A\u094D\u0924 (Out of Stock)"} \u0938\u0947\u091F \u0939\u094B \u0917\u092F\u093E\u0964`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0938\u094D\u091F\u0949\u0915 \u092C\u0926\u0932\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/rate-card/delete", (req, res) => {
    try {
      const { itemId } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: "Item ID \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      deleteRateCardItemFromCSV(itemId);
      res.json({ success: true, message: "\u0921\u093F\u0936 \u092E\u093E\u0938\u094D\u091F\u0930 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0938\u0947 \u0939\u091F\u093E \u0926\u0940 \u0917\u0908\u0964" });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u0939\u091F\u093E\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/dishes/review", (req, res) => {
    try {
      const { dishId, action, notes } = req.body || {};
      if (!dishId || !action) {
        return res.status(400).json({ success: false, message: "Dish ID \u0914\u0930 Action (APPROVE / REJECT) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      const dish = (vault.pendingDishes || []).find((d) => d.id === dishId);
      if (!dish) {
        return res.status(404).json({ success: false, message: "\u0921\u093F\u0936 \u0906\u0935\u0947\u0926\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      if (action.toUpperCase() === "APPROVE") {
        dish.status = "APPROVED";
        dish.approvedAt = (/* @__PURE__ */ new Date()).toISOString();
        dish.notes = notes || "\u092E\u093E\u0932\u093F\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0928\u0941\u092E\u094B\u0926\u093F\u0924 (Approved by Owner)";
        addRateCardItemToCSV({
          id: dish.id,
          name: dish.name,
          hindiName: dish.hindiName,
          category: dish.category,
          categoryLabel: dish.categoryLabel,
          portions: dish.portions,
          inStock: true
        });
        saveVendorVault(vault);
        return res.json({
          success: true,
          message: `\u0921\u093F\u0936 "${dish.name}" \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0939\u094B \u0917\u0908 \u0914\u0930 \u092E\u093E\u0938\u094D\u091F\u0930 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u092E\u0947\u0902 \u091C\u0941\u0921\u093C \u0917\u0908!`,
          dish
        });
      } else {
        dish.status = "REJECTED";
        dish.notes = notes || "\u092E\u093E\u0932\u093F\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 (Rejected)";
        saveVendorVault(vault);
        return res.json({
          success: true,
          message: `\u0921\u093F\u0936 "${dish.name}" \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u0940 \u0917\u0908\u0964`,
          dish
        });
      }
    } catch (err) {
      console.error("[Dish Review Error]:", err);
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.post("/api/owner/vendor/payout/disburse", (req, res) => {
    try {
      const { amount, utrNumber, paymentMode, notes } = req.body || {};
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: "\u092E\u093E\u0928\u094D\u092F \u092A\u0947\u0906\u0909\u091F \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
      }
      if (!utrNumber || String(utrNumber).trim().length < 3) {
        return res.status(400).json({ success: false, message: "\u092C\u0948\u0902\u0915/UPI \u0915\u093E \u092E\u093E\u0928\u094D\u092F UTR / \u0930\u0947\u092B\u0930\u0947\u0902\u0938 \u0928\u0902\u092C\u0930 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      const currentBal = vault.wallet.currentBalance;
      if (numAmount > currentBal) {
        return res.status(400).json({
          success: false,
          message: `\u092A\u0947\u0906\u0909\u091F \u0930\u093E\u0936\u093F (\u20B9${numAmount}) \u0915\u0941\u0932 \u0935\u0949\u0932\u0947\u091F \u092C\u0948\u0932\u0947\u0902\u0938 (\u20B9${currentBal}) \u0938\u0947 \u0905\u0927\u093F\u0915 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u0940\u0964`
        });
      }
      vault.wallet.currentBalance = Math.max(0, currentBal - numAmount);
      vault.wallet.lastSettlementDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const txn = {
        id: `txn_payout_${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: "payout_disbursed",
        amount: numAmount,
        description: `Monday Settlement Paid via ${paymentMode || "UPI"} (UTR: ${utrNumber})${notes ? ` - ${notes}` : ""}`,
        referenceId: String(utrNumber).trim(),
        utrNumber: String(utrNumber).trim(),
        balanceAfter: vault.wallet.currentBalance,
        status: "settled",
        ownerApprovedBy: "Owner / Navovia Next HQ",
        cyclePeriod: "Weekly Settlement"
      };
      vault.transactions.unshift(txn);
      saveVendorVault(vault);
      res.json({
        success: true,
        newBalance: vault.wallet.currentBalance,
        transaction: txn,
        message: `\u20B9${numAmount} \u0915\u093E \u0938\u094B\u092E\u0935\u093E\u0930 \u092A\u0947\u0906\u0909\u091F \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0926\u0930\u094D\u091C \u0939\u0941\u0906! \u0928\u092F\u093E \u092C\u0948\u0932\u0947\u0902\u0938: \u20B9${vault.wallet.currentBalance}`
      });
    } catch (err) {
      console.error("[Payout Disburse Error]:", err);
      res.status(500).json({ success: false, message: "\u092A\u0947\u0906\u0909\u091F \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/refunds/add", (req, res) => {
    try {
      const { orderId, customerRefundAmount, vendorCutDeducted, reason } = req.body || {};
      const numDeduction = Number(vendorCutDeducted);
      if (!numDeduction || numDeduction <= 0) {
        return res.status(400).json({ success: false, message: "\u092E\u093E\u0928\u094D\u092F \u0915\u091F\u094C\u0924\u0940 \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
      }
      if (!reason) {
        return res.status(400).json({ success: false, message: "\u0915\u091F\u094C\u0924\u0940 \u0915\u093E \u0915\u093E\u0930\u0923 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.refundDeductions) vault.refundDeductions = [];
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - numDeduction);
      const record = {
        id: `ded_${Date.now()}`,
        orderId: String(orderId || "GEN-DEDUCT").trim(),
        customerRefundAmount: Number(customerRefundAmount || numDeduction),
        vendorCutDeducted: numDeduction,
        reason: String(reason).trim(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "deducted"
      };
      vault.refundDeductions.unshift(record);
      const txn = {
        id: `txn_ded_${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: "refund_deduction",
        amount: numDeduction,
        description: `Refund / Cancellation Deduction: Order #${record.orderId} - ${record.reason}`,
        referenceId: record.orderId,
        balanceAfter: vault.wallet.currentBalance,
        status: "settled",
        ownerApprovedBy: "Owner Operations Desk"
      };
      vault.transactions.unshift(txn);
      saveVendorVault(vault);
      res.json({
        success: true,
        record,
        newBalance: vault.wallet.currentBalance,
        message: `\u20B9${numDeduction} \u0915\u0940 \u0915\u091F\u094C\u0924\u0940 \u0926\u0930\u094D\u091C \u0915\u0940 \u0917\u0908\u0964 \u0928\u092F\u093E \u0935\u0949\u0932\u0947\u091F \u092C\u0948\u0932\u0947\u0902\u0938: \u20B9${vault.wallet.currentBalance}`
      });
    } catch (err) {
      console.error("[Refund Deduction Error]:", err);
      res.status(500).json({ success: false, message: "\u0915\u091F\u094C\u0924\u0940 \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/orders/update-status", (req, res) => {
    try {
      const { orderId, newStatus } = req.body || {};
      if (!orderId || !newStatus) {
        return res.status(400).json({ success: false, message: "Order ID \u0914\u0930 Status \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      const order = (vault.orders || []).find((o) => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "\u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      order.status = newStatus;
      if (newStatus === "delivered" && !order.payoutCreditedToWallet) {
        order.payoutCreditedToWallet = true;
        const payout = order.totalVendorPayout || 0;
        vault.wallet.currentBalance += payout;
        vault.wallet.totalLifetimeEarned += payout;
        vault.transactions.unshift({
          id: `txn_ord_${Date.now()}`,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          type: "order_credit",
          amount: payout,
          description: `Order Settlement: ${order.itemName} (${order.orderNumber})`,
          referenceId: order.orderNumber,
          balanceAfter: vault.wallet.currentBalance,
          status: "settled",
          cyclePeriod: "Current Fri-Thu Cycle"
        });
      }
      saveVendorVault(vault);
      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message: `\u0911\u0930\u094D\u0921\u0930 \u0938\u094D\u091F\u0947\u091F\u0938 "${newStatus}" \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u092F\u093E\u0964`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0938\u094D\u091F\u0947\u091F\u0938 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
}
export {
  addRateCardItemToCSV,
  deleteRateCardItemFromCSV,
  loadDynamicRateCard,
  pushEventToGoogleSheet,
  registerVendorRoutes,
  saveRateCardToCSV,
  updateRateCardItemInCSV
};
