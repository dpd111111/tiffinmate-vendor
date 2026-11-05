// server/routes/vendor_cloud_routes.ts
import fs2 from "fs";
import path2 from "path";

// management/vendor/vendor_rate_card_data.ts
var VENDOR_MASTER_RATE_CARD = [
  // =========================================================================
  // 1. सोमवार का मेनू (MONDAY MENU)
  // =========================================================================
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
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "mon_deluxe_thali",
    name: "Monday Deluxe Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "mon_premium_thali",
    name: "Monday Premium Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // =========================================================================
  // 2. मंगलवार का मेनू (TUESDAY MENU)
  // =========================================================================
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
  // =========================================================================
  // 3. बुधवार का मेनू (WEDNESDAY MENU)
  // =========================================================================
  {
    id: "wed_lauki_kofta_dum_aloo",
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
    id: "wed_paneer_do_pyaza_rice_bowl",
    name: "Paneer Do Pyaza with Rice Bowl",
    hindiName: "\u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "wed_moong_dal_rice_bowl",
    name: "Moong Dal with Rice Bowl",
    hindiName: "\u092E\u0942\u0902\u0917 \u0926\u093E\u0932 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
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
  // =========================================================================
  // 4. गुरुवार का मेनू (THURSDAY MENU)
  // =========================================================================
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
    id: "thu_kadhi_pakoda_rice_bowl",
    name: "Kadhi Pakoda with Rice Bowl",
    hindiName: "\u0915\u0922\u093C\u0940 \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "thu_palak_paneer_rice_bowl",
    name: "Palak Paneer with Rice Bowl",
    hindiName: "\u092A\u093E\u0932\u0915 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
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
  // =========================================================================
  // 5. शुक्रवार का मेनू (FRIDAY MENU)
  // =========================================================================
  {
    id: "fri_baingan_bharta",
    name: "Baingan bharta",
    hindiName: "\u092C\u0948\u0902\u0917\u0928 \u092D\u0930\u094D\u0924\u093E",
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
    name: "Butter dal fry",
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
    name: "Paneer bhurji",
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
    id: "fri_paneer_bhurji_rice_bowl",
    name: "Paneer bhurji with rice bowl",
    hindiName: "\u092A\u0928\u0940\u0930 \u092D\u0941\u0930\u094D\u091C\u0940 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
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
    id: "fri_butter_dal_fry_rice_bowl",
    name: "Butter dal fry with rice bowl",
    hindiName: "\u092C\u091F\u0930 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
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
  // =========================================================================
  // 6. शनिवार का मेनू (SATURDAY MENU)
  // =========================================================================
  {
    id: "sat_aloo_gobi",
    name: "Aloo gobi",
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
    id: "sat_butter_masoor_dal_fry",
    name: "Butter masoor dal fry",
    hindiName: "\u092C\u091F\u0930 \u092E\u0938\u0942\u0930 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "sat_butter_paneer_masala",
    name: "Butter paneer masala",
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
    id: "sat_butter_paneer_masala_rice_bowl",
    name: "Butter paneer masala with rice bowl",
    hindiName: "\u092C\u091F\u0930 \u092A\u0928\u0940\u0930 \u092E\u0938\u093E\u0932\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "sat_butter_masoor_dal_rice_bowl",
    name: "Butter masoor dal fry with rice bowl",
    hindiName: "\u092C\u091F\u0930 \u092E\u0938\u0942\u0930 \u0926\u093E\u0932 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "sat_aloo_gobi_rice_bowl",
    name: "Aloo gobi with rice bowl",
    hindiName: "\u0906\u0932\u0942 \u0917\u094B\u092D\u0940 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
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
  // =========================================================================
  // 7. रविवार का मेनू (SUNDAY MENU)
  // =========================================================================
  {
    id: "sun_aloo_jeera",
    name: "Aloo jeera",
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
    id: "sun_butter_mix_dal_fry",
    name: "Butter mix dal fry",
    hindiName: "\u092C\u091F\u0930 \u092E\u093F\u0915\u094D\u0938 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 110 }
    ],
    inStock: true
  },
  {
    id: "sun_matar_paneer",
    name: "Matar paneer",
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
    id: "sun_matar_paneer_rice_bowl",
    name: "Matar paneer with rice bowl",
    hindiName: "\u092E\u091F\u0930 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "sun_butter_mix_dal_rice_bowl",
    name: "Butter mix dal fry with rice bowl",
    hindiName: "\u092E\u093F\u0915\u094D\u0938 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "sun_aloo_jeera_rice_bowl",
    name: "Aloo jeera with rice bowl",
    hindiName: "\u0906\u0932\u0942 \u091C\u0940\u0930\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
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
  // =========================================================================
  // 8. विशेष दैनिक थाली (SPECIAL DAILY THALI)
  // =========================================================================
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
  // =========================================================================
  // 9. नाश्ता एवं स्नैक्स (BREAKFAST & SNACKS - OFFICIAL PDF ITEMS)
  // =========================================================================
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
    id: "brk_aloo_chaap",
    name: "Aloo Chaap with Sauce (4 Pcs)",
    hindiName: "\u0906\u0932\u0942 \u091A\u093E\u092A \u0935\u093F\u0925 \u0938\u0949\u0938 (4 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 139, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_bread_cutlet",
    name: "Bread Cutlet with Sauce (4 Pcs)",
    hindiName: "\u092C\u094D\u0930\u0947\u0921 \u0915\u091F\u0932\u0947\u091F \u0935\u093F\u0925 \u0938\u0949\u0938 (4 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 139, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_sandwich",
    name: "Veg Sandwich (2 Pc - Plain)",
    hindiName: "\u0935\u0947\u091C \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938 - \u092A\u094D\u0932\u0947\u0928)",
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
  // =========================================================================
  // 9B. विशेष पराठा व नाश्ता चाय कॉम्बो (PARATHA & ALL BREAKFAST CHAI COMBOS)
  // =========================================================================
  {
    id: "combo_aloo_paratha_chai",
    name: "2 Aloo Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u0906\u0932\u0942 \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B (\u092C\u091F\u0930 \u0935 \u091A\u091F\u0928\u0940)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 199, vendorPayoutRate: 65 }],
    inStock: true
  },
  {
    id: "combo_paneer_paratha_chai",
    name: "2 Paneer Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u092A\u0928\u0940\u0930 \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B (\u0930\u093E\u092F\u0924\u093E/\u091A\u091F\u0928\u0940)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 269, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "combo_gobi_paratha_chai",
    name: "2 Gobi Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u0917\u094B\u092D\u0940 \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B (\u0938\u0949\u0938/\u0930\u093E\u092F\u0924\u093E)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 239, vendorPayoutRate: 75 }],
    inStock: true
  },
  {
    id: "combo_mix_veg_paratha_chai",
    name: "2 Mix Veg Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u092E\u093F\u0915\u094D\u0938 \u0935\u0947\u091C \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 229, vendorPayoutRate: 70 }],
    inStock: true
  },
  {
    id: "combo_pyaz_paratha_chai",
    name: "2 Pyaz (Onion) Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u092A\u094D\u092F\u093E\u091C \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 199, vendorPayoutRate: 65 }],
    inStock: true
  },
  {
    id: "combo_butter_ajwain_paratha_chai",
    name: "2 Butter Ajwain Paratha + Desi Adrak Chai Combo",
    hindiName: "2 \u092C\u091F\u0930 \u0905\u091C\u0935\u093E\u0907\u0928 \u092A\u0930\u093E\u0920\u093E + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "combo_upma_chai",
    name: "Veg Rawa Upma + Desi Adrak Chai Combo",
    hindiName: "\u0935\u0947\u091C \u0930\u0935\u093E \u0909\u092A\u092E\u093E + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 169, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "combo_chilla_chai",
    name: "Veg Chilla (2 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u0935\u0947\u091C \u091A\u0940\u0932\u093E (2 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 179, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "combo_kachori_chai",
    name: "Aloo Kachori (2 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u0906\u0932\u0942 \u0915\u091A\u094C\u0921\u093C\u0940 (2 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 179, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "combo_aloo_chaap_chai",
    name: "Aloo Chaap (4 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u0906\u0932\u0942 \u091A\u093E\u092A (4 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "combo_cutlet_chai",
    name: "Bread Cutlet (4 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u092C\u094D\u0930\u0947\u0921 \u0915\u091F\u0932\u0947\u091F (4 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "combo_sandwich_chai",
    name: "Veg Sandwich (2 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u0935\u0947\u091C \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "combo_grilled_sandwich_chai",
    name: "Veg Grilled Sandwich (2 Pcs) + Desi Adrak Chai Combo",
    hindiName: "\u0935\u0947\u091C \u0917\u094D\u0930\u093F\u0932\u094D\u0921 \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 179, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "combo_maggi_chai",
    name: "Korean Maggi + Desi Adrak Chai Combo",
    hindiName: "\u0915\u094B\u0930\u093F\u092F\u0928 \u092E\u0948\u0917\u0940 + \u0926\u0947\u0938\u0940 \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 179, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "combo_poori_sabji_chai",
    name: "Bedmi/Desi Poori Sabji (4 Poori + Aloo) + Chai Combo",
    hindiName: "\u092A\u0942\u0930\u0940 \u0938\u092C\u094D\u091C\u0940 (4 \u092A\u0942\u0930\u0940 + \u0906\u0932\u0942 \u0930\u0938\u093E) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 189, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "combo_suji_halwa_poori",
    name: "Desi Suji Halwa (250g) + 2 Poori Combo",
    hindiName: "\u0926\u0947\u0938\u0940 \u0938\u0942\u091C\u0940 \u0939\u0932\u0935\u093E (250g) + 2 \u092A\u0942\u0930\u0940 \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 169, vendorPayoutRate: 60 }],
    inStock: true
  },
  {
    id: "snack_desi_chai",
    name: "Desi Cutting Chai / Special Adrak Elaichi Tea",
    hindiName: "\u0926\u0947\u0938\u0940 \u0938\u094D\u092A\u0947\u0936\u0932 \u0905\u0926\u0930\u0915 \u0907\u0932\u093E\u092F\u091A\u0940 \u091A\u093E\u092F",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [
      { size: "2 Cup", listingPrice: 99, vendorPayoutRate: 30 },
      { size: "4 Cup", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "5 Cup Flask", listingPrice: 199, vendorPayoutRate: 75 }
    ],
    inStock: true
  },
  // =========================================================================
  // 10. व्रत थाली एवं व्रत स्नैक्स (VRAT SPECIAL)
  // =========================================================================
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
    id: "vrat_samak_kuttu_chilla_thali",
    name: "Samak Rice Chilla Thali (2 Pc) / Kuttu Atta Chilla Thali (2 Pc)",
    hindiName: "\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 \u091A\u0940\u0932\u093E \u0925\u093E\u0932\u0940 (2 \u092A\u0940\u0938) / \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E \u0925\u093E\u0932\u0940",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_kuttu_chilla_aloo_sabji",
    name: "4 Pcs Kuttu Chilla + Aloo Sabji + Raita",
    hindiName: "4 \u092A\u0940\u0938 \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E + \u0906\u0932\u0942 \u0938\u092C\u094D\u091C\u093C\u0940 + \u0930\u093E\u092F\u0924\u093E",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_aloo_pakoda_dahi",
    name: "Aloo Pakoda with Dahi (250 ml)",
    hindiName: "\u0906\u0932\u0942 \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u093F\u0925 \u0926\u0939\u0940 (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "vrat_samak_pakoda_dahi",
    name: "Samak Rice Pakoda with Dahi (250 ml)",
    hindiName: "\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u093F\u0925 \u0926\u0939\u0940 (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "vrat_kuttu_pakoda_dahi",
    name: "Kuttu Atta Pakoda with Dahi (250 ml)",
    hindiName: "\u0915\u0941\u091F\u094D\u091F\u0942 \u0906\u091F\u093E \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u093F\u0925 \u0926\u0939\u0940 (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "vrat_aloo_sabji_kheera_raita",
    name: "Aloo ki Sabji with Kheera Raita (250 ml)",
    hindiName: "\u0906\u0932\u0942 \u0915\u0940 \u0938\u092C\u094D\u091C\u093C\u0940 \u0935\u093F\u0925 \u0916\u0940\u0930\u093E \u0930\u093E\u092F\u0924\u093E (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 139, vendorPayoutRate: 50 }],
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
  {
    id: "vrat_combo_sabudana_chai",
    name: "Sabudana Khichdi + Desi Chai Vrat Combo",
    hindiName: "\u0938\u093E\u092C\u0942\u0926\u093E\u0928\u093E \u0916\u093F\u091A\u0921\u093C\u0940 + \u0935\u094D\u0930\u0924 \u0938\u094D\u092A\u0947\u0936\u0932 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  // =========================================================================
  // 11. ब्रेड्स, चावल और मीठा (BREADS, RICE & DESSERTS)
  // =========================================================================
  {
    id: "brd_tawa_roti",
    name: "Tawa Roti / Butter Tawa Roti",
    hindiName: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940 / \u092C\u091F\u0930 \u0924\u0935\u093E \u0930\u094B\u091F\u0940",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "Plain Tawa Roti", listingPrice: 12, vendorPayoutRate: 4 },
      { size: "Butter Tawa Roti", listingPrice: 15, vendorPayoutRate: 5 }
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
      { size: "Plain Rice (300g)", listingPrice: 79, vendorPayoutRate: 50 },
      { size: "Jeera Rice (300g)", listingPrice: 89, vendorPayoutRate: 50 }
    ],
    inStock: true
  },
  {
    id: "brd_sweet_seviyan",
    name: "Sweet Seviyan",
    hindiName: "\u092E\u0940\u0920\u0940 \u0938\u0947\u0935\u0907\u092F\u093E\u0902",
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

// server/database/core_database.ts
import fs from "fs";
import path from "path";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
var firestoreDb = null;
try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== "remixed-project-id") {
      const existingApps = getApps();
      const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
      firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      console.log("\u2705 Server Firestore persistence connected:", firebaseConfig.projectId);
    }
  }
} catch (e) {
  console.warn("[Firebase Server Init Warning]:", e);
}
function readJsonSafe(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content && content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error(`[Database Read Error] Failed reading ${filePath}:`, err);
  }
  return fallback;
}
function writeJsonSafe(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp_${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
    if (firestoreDb) {
      const fileName = path.basename(filePath).replace(".json", "");
      const docRef = doc(firestoreDb, "app_snapshots", fileName);
      setDoc(docRef, { data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, { merge: true }).catch((err) => {
        console.warn(`[Firestore Sync Warning for ${fileName}]:`, err.message);
      });
    }
    return true;
  } catch (err) {
    console.error(`[Database Write Error] Failed writing ${filePath}:`, err);
    return false;
  }
}

// server/routes/vendor_cloud_routes.ts
var DEFAULT_INCENTIVE_CONFIG = {
  enabled: true,
  tiers: [
    { id: "tier_bronze", milestoneMeals: 25, bonusAmount: 150, title: "\u092C\u094D\u0930\u093E\u0909\u0928 \u0938\u094D\u091F\u093E\u0930 \u092C\u094B\u0928\u0938", badge: "\u{1F949}", description: "25 \u091F\u093F\u092B\u093F\u0928 \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0930 \u20B9150 \u092C\u094B\u0928\u0938" },
    { id: "tier_silver", milestoneMeals: 50, bonusAmount: 350, title: "\u0938\u093F\u0932\u094D\u0935\u0930 \u0938\u094D\u091F\u093E\u0930 \u092C\u094B\u0928\u0938", badge: "\u{1F948}", description: "50 \u091F\u093F\u092B\u093F\u0928 \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0930 \u20B9350 \u092C\u094B\u0928\u0938" },
    { id: "tier_gold", milestoneMeals: 100, bonusAmount: 800, title: "\u0917\u094B\u0932\u094D\u0921 \u0938\u094D\u091F\u093E\u0930 \u092C\u094B\u0928\u0938", badge: "\u{1F947}", description: "100 \u091F\u093F\u092B\u093F\u0928 \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0930 \u20B9800 \u092C\u094B\u0928\u0938" },
    { id: "tier_platinum", milestoneMeals: 200, bonusAmount: 1800, title: "\u092A\u094D\u0932\u0948\u091F\u093F\u0928\u092E \u0938\u094D\u091F\u093E\u0930 \u092C\u094B\u0928\u0938", badge: "\u{1F48E}", description: "200+ \u091F\u093F\u092B\u093F\u0928 \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0930 \u20B91800 \u092C\u094B\u0928\u0938" }
  ],
  onTimeBonusPerMeal: 5,
  zeroComplaintWeeklyBonus: 250,
  dailyZeroCancellationBonus: 50,
  weeklyHundredPercentOnlineBonus: 300
};
var DEFAULT_DAILY_MENU_CONFIG = {
  lunchSlotTime: "12:00 PM - 3:30 PM",
  dinnerSlotTime: "7:30 PM - 10:30 PM",
  breakfastSlotTime: "7:30 AM - 11:30 AM",
  lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
  regularFixedDishes: [
    { dishId: "cmb_paratha_chai", name: "Aloo Paratha (2 Pcs) + Cutting Chai Combo", hindiName: "\u0906\u0932\u0942 \u092A\u0930\u093E\u0920\u093E (2 Pcs) + \u0915\u091F\u093F\u0902\u0917 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B", listingPrice: 129, vendorPayoutRate: 45, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "cmb_poha_chai", name: "Indori Poha + Masala Chai Combo", hindiName: "\u0907\u0902\u0926\u094C\u0930\u0940 \u092A\u094B\u0939\u093E + \u092E\u0938\u093E\u0932\u093E \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B", listingPrice: 99, vendorPayoutRate: 35, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "cmb_samosa_chai", name: "Desi Samosa (2 Pcs) + Adrak Chai Combo", hindiName: "\u0926\u0947\u0938\u0940 \u0938\u092E\u094B\u0938\u093E (2 Pcs) + \u0905\u0926\u0930\u0915 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B", listingPrice: 89, vendorPayoutRate: 30, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "brd_tawa_roti", name: "Plain Tawa Roti", hindiName: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940 (\u092A\u094D\u0932\u0947\u0928)", listingPrice: 15, vendorPayoutRate: 5, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "mon_yellow_dal_tadka", name: "Yellow Dal Tadka", hindiName: "\u092F\u0947\u0932\u094B \u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E", listingPrice: 129, vendorPayoutRate: 50, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "brd_plain_rice", name: "Plain Basmati Rice (300g)", hindiName: "\u092A\u094D\u0932\u0947\u0928 \u092C\u093E\u0938\u092E\u0924\u0940 \u0930\u093E\u0907\u0938 (300 \u0917\u094D\u0930\u093E\u092E)", listingPrice: 99, vendorPayoutRate: 35, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "snk_adrak_chai", name: "Kulhad Adrak Chai (2 Cups)", hindiName: "\u0915\u0941\u0932\u094D\u0939\u0921\u093C \u0905\u0926\u0930\u0915 \u091A\u093E\u092F (2 \u0915\u092A)", listingPrice: 59, vendorPayoutRate: 20, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "mon_daily_thali", name: "TiffinMate Homestyle Executive Thali", hindiName: "\u091F\u093F\u095E\u093F\u0928\u092E\u0948\u091F \u0939\u094B\u092E\u0938\u094D\u091F\u093E\u0907\u0932 \u090F\u0917\u094D\u091C\u0940\u0915\u094D\u092F\u0942\u091F\u093F\u0935 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "snk_paneer_paratha", name: "Amul Butter Paneer Paratha (2 Pcs)", hindiName: "\u0905\u092E\u0941\u0932 \u092C\u091F\u0930 \u092A\u0928\u0940\u0930 \u092A\u0930\u093E\u0920\u093E (2 Pcs)", listingPrice: 149, vendorPayoutRate: 55, mealSlot: "all_day", isFixedDaily: true },
    { dishId: "vrat_sabudana_khichdi", name: "Sabudana Khichdi (Vrat Special)", hindiName: "\u0938\u093E\u092C\u0942\u0926\u093E\u0928\u093E \u0916\u093F\u091A\u0921\u093C\u0940 (\u0935\u094D\u0930\u0924 \u0938\u094D\u092A\u0947\u0936\u0932)", listingPrice: 149, vendorPayoutRate: 55, mealSlot: "all_day", isFixedDaily: true }
  ],
  dayWiseSchedules: {
    monday: {
      dayId: "monday",
      dayNameHindi: "\u0938\u094B\u092E\u0935\u093E\u0930 (Monday)",
      specialCurry: "\u0906\u0932\u0942 \u092E\u091F\u0930 \u0935 \u0915\u0921\u093C\u093E\u0908 \u092A\u0928\u0940\u0930",
      specialRice: "\u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938",
      specialBread: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
      lunchDishes: [
        { dishId: "mon_aloo_matar", name: "Aloo Matar", hindiName: "\u0906\u0932\u0942 \u092E\u091F\u0930", listingPrice: 149, vendorPayoutRate: 50, mealSlot: "lunch" },
        { dishId: "mon_yellow_dal_tadka", name: "Yellow Dal Tadka", hindiName: "\u092F\u0947\u0932\u094B \u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E", listingPrice: 129, vendorPayoutRate: 50, mealSlot: "lunch" },
        { dishId: "mon_kadhai_paneer", name: "Kadhai Paneer", hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "lunch" },
        { dishId: "mon_kadhai_paneer_rice_bowl", name: "Kadhai Paneer with Rice Bowl", hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932", listingPrice: 199, vendorPayoutRate: 75, mealSlot: "lunch" },
        { dishId: "mon_daily_thali", name: "Monday Daily Thali", hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "mon_kadhai_paneer", name: "Kadhai Paneer", hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "mon_yellow_dal_rice_bowl", name: "Yellow Dal Tadka with Rice Bowl", hindiName: "\u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932", listingPrice: 169, vendorPayoutRate: 60, mealSlot: "dinner" },
        { dishId: "mon_deluxe_thali", name: "Monday Deluxe Thali", hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940", listingPrice: 299, vendorPayoutRate: 100, mealSlot: "dinner" },
        { dishId: "mon_premium_thali", name: "Monday Premium Thali", hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940", listingPrice: 399, vendorPayoutRate: 135, mealSlot: "dinner" }
      ]
    },
    tuesday: {
      dayId: "tuesday",
      dayNameHindi: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 (Tuesday)",
      specialCurry: "\u092D\u093F\u0902\u0921\u0940 \u092E\u0938\u093E\u0932\u093E \u0935 \u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930",
      specialRice: "\u092A\u094D\u0932\u0947\u0928 \u092C\u093E\u0938\u092E\u0924\u0940 \u0930\u093E\u0907\u0938",
      specialBread: "\u092C\u091F\u0930 \u0924\u0935\u093E \u0930\u094B\u091F\u0940",
      lunchDishes: [
        { dishId: "tue_bhindi_masala", name: "Bhindi Masala", hindiName: "\u092D\u093F\u0902\u0921\u0940 \u092E\u0938\u093E\u0932\u093E", listingPrice: 139, vendorPayoutRate: 48, mealSlot: "lunch" },
        { dishId: "tue_chana_dal", name: "Chana Dal Fry", hindiName: "\u091A\u0928\u093E \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0907\u0921", listingPrice: 129, vendorPayoutRate: 45, mealSlot: "lunch" },
        { dishId: "tue_shahi_paneer", name: "Shahi Paneer", hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930", listingPrice: 179, vendorPayoutRate: 70, mealSlot: "lunch" },
        { dishId: "tue_daily_thali", name: "Tuesday Daily Thali", hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "tue_shahi_paneer", name: "Shahi Paneer", hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930", listingPrice: 179, vendorPayoutRate: 70, mealSlot: "dinner" },
        { dishId: "tue_rajma_masala", name: "Rajma Masala with Rice Bowl", hindiName: "\u0930\u093E\u091C\u092E\u093E \u091A\u093E\u0935\u0932 \u092C\u093E\u0909\u0932", listingPrice: 179, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "tue_deluxe_thali", name: "Tuesday Deluxe Thali", hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940", listingPrice: 299, vendorPayoutRate: 100, mealSlot: "dinner" }
      ]
    },
    wednesday: {
      dayId: "wednesday",
      dayNameHindi: "\u092C\u0941\u0927\u0935\u093E\u0930 (Wednesday)",
      specialCurry: "\u0930\u093E\u091C\u092E\u093E \u092E\u0938\u093E\u0932\u093E \u0935 \u092A\u0928\u0940\u0930 \u092C\u091F\u0930 \u092E\u0938\u093E\u0932\u093E",
      specialRice: "\u092E\u091F\u0930 \u092A\u0941\u0932\u093E\u0935",
      specialBread: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
      lunchDishes: [
        { dishId: "wed_rajma_masala", name: "Punjabi Rajma Masala", hindiName: "\u092A\u0902\u091C\u093E\u092C\u0940 \u0930\u093E\u091C\u092E\u093E \u092E\u0938\u093E\u0932\u093E", listingPrice: 149, vendorPayoutRate: 52, mealSlot: "lunch" },
        { dishId: "wed_paneer_butter_masala", name: "Paneer Butter Masala", hindiName: "\u092A\u0928\u0940\u0930 \u092C\u091F\u0930 \u092E\u0938\u093E\u0932\u093E", listingPrice: 189, vendorPayoutRate: 72, mealSlot: "lunch" },
        { dishId: "wed_daily_thali", name: "Wednesday Daily Thali", hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "wed_paneer_butter_masala", name: "Paneer Butter Masala", hindiName: "\u092A\u0928\u0940\u0930 \u092C\u091F\u0930 \u092E\u0938\u093E\u0932\u093E", listingPrice: 189, vendorPayoutRate: 72, mealSlot: "dinner" },
        { dishId: "wed_rajma_rice_bowl", name: "Rajma Chawal Combo Bowl", hindiName: "\u0930\u093E\u091C\u092E\u093E \u091A\u093E\u0935\u0932 \u0915\u0949\u092E\u094D\u092C\u094B \u092C\u093E\u0909\u0932", listingPrice: 179, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "wed_premium_thali", name: "Wednesday Premium Thali", hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940", listingPrice: 399, vendorPayoutRate: 135, mealSlot: "dinner" }
      ]
    },
    thursday: {
      dayId: "thursday",
      dayNameHindi: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 (Thursday)",
      specialCurry: "\u0915\u0922\u093C\u0940 \u092A\u0915\u094B\u0921\u093C\u093E \u0935 \u092E\u091F\u0930 \u092A\u0928\u0940\u0930",
      specialRice: "\u0938\u094D\u091F\u0940\u092E\u094D\u0921 \u092C\u093E\u0938\u092E\u0924\u0940 \u0930\u093E\u0907\u0938",
      specialBread: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
      lunchDishes: [
        { dishId: "thu_kadhi_pakoda", name: "Punjabi Kadhi Pakoda", hindiName: "\u092A\u0902\u091C\u093E\u092C\u0940 \u0915\u0922\u093C\u0940 \u092A\u0915\u094B\u0921\u093C\u093E", listingPrice: 139, vendorPayoutRate: 48, mealSlot: "lunch" },
        { dishId: "thu_matar_paneer", name: "Matar Paneer", hindiName: "\u092E\u091F\u0930 \u092A\u0928\u0940\u0930", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "lunch" },
        { dishId: "thu_daily_thali", name: "Thursday Daily Thali", hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "thu_matar_paneer", name: "Matar Paneer", hindiName: "\u092E\u091F\u0930 \u092A\u0928\u0940\u0930", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "thu_kadhi_rice_bowl", name: "Kadhi Chawal Combo Bowl", hindiName: "\u0915\u0922\u093C\u0940 \u091A\u093E\u0935\u0932 \u0915\u0949\u092E\u094D\u092C\u094B \u092C\u093E\u0909\u0932", listingPrice: 169, vendorPayoutRate: 60, mealSlot: "dinner" },
        { dishId: "thu_deluxe_thali", name: "Thursday Deluxe Thali", hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940", listingPrice: 299, vendorPayoutRate: 100, mealSlot: "dinner" }
      ]
    },
    friday: {
      dayId: "friday",
      dayNameHindi: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 (Friday)",
      specialCurry: "\u091B\u094B\u0932\u0947 \u092E\u0938\u093E\u0932\u093E \u0935 \u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E",
      specialRice: "\u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938",
      specialBread: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940 / \u092D\u091F\u0942\u0930\u0947",
      lunchDishes: [
        { dishId: "fri_chhole_masala", name: "Amritsari Chhole Masala", hindiName: "\u0905\u092E\u0943\u0924\u0938\u0930\u0940 \u091B\u094B\u0932\u0947 \u092E\u0938\u093E\u0932\u093E", listingPrice: 149, vendorPayoutRate: 52, mealSlot: "lunch" },
        { dishId: "fri_paneer_do_pyaza", name: "Paneer Do Pyaza", hindiName: "\u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E", listingPrice: 179, vendorPayoutRate: 70, mealSlot: "lunch" },
        { dishId: "fri_daily_thali", name: "Friday Daily Thali", hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "fri_paneer_do_pyaza", name: "Paneer Do Pyaza", hindiName: "\u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E", listingPrice: 179, vendorPayoutRate: 70, mealSlot: "dinner" },
        { dishId: "fri_chhole_rice_bowl", name: "Chhole Chawal Combo Bowl", hindiName: "\u091B\u094B\u0932\u0947 \u091A\u093E\u0935\u0932 \u0915\u0949\u092E\u094D\u092C\u094B \u092C\u093E\u0909\u0932", listingPrice: 179, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "fri_premium_thali", name: "Friday Premium Thali", hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940", listingPrice: 399, vendorPayoutRate: 135, mealSlot: "dinner" }
      ]
    },
    saturday: {
      dayId: "saturday",
      dayNameHindi: "\u0936\u0928\u093F\u0935\u093E\u0930 (Saturday)",
      specialCurry: "\u0926\u092E \u0906\u0932\u0942 \u0935 \u0926\u093E\u0932 \u092E\u0916\u0928\u0940",
      specialRice: "\u0935\u0947\u091C \u092A\u0941\u0932\u093E\u0935",
      specialBread: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
      lunchDishes: [
        { dishId: "sat_dum_aloo", name: "Kashmiri Dum Aloo", hindiName: "\u0915\u0936\u094D\u092E\u0940\u0930\u0940 \u0926\u092E \u0906\u0932\u0942", listingPrice: 149, vendorPayoutRate: 50, mealSlot: "lunch" },
        { dishId: "sat_dal_makhani", name: "Special Dal Makhani", hindiName: "\u0938\u094D\u092A\u0947\u0936\u0932 \u0926\u093E\u0932 \u092E\u0916\u0928\u0940", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "lunch" },
        { dishId: "sat_daily_thali", name: "Saturday Daily Thali", hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940", listingPrice: 249, vendorPayoutRate: 80, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "sat_dal_makhani", name: "Special Dal Makhani", hindiName: "\u0938\u094D\u092A\u0947\u0936\u0932 \u0926\u093E\u0932 \u092E\u0916\u0928\u0940", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "sat_malai_kofta", name: "Malai Kofta Special", hindiName: "\u092E\u0932\u093E\u0908 \u0915\u094B\u092B\u094D\u0924\u093E \u0938\u094D\u092A\u0947\u0936\u0932", listingPrice: 189, vendorPayoutRate: 75, mealSlot: "dinner" },
        { dishId: "sat_deluxe_thali", name: "Saturday Deluxe Thali", hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940", listingPrice: 299, vendorPayoutRate: 100, mealSlot: "dinner" }
      ]
    },
    sunday: {
      dayId: "sunday",
      dayNameHindi: "\u0930\u0935\u093F\u0935\u093E\u0930 (Sunday)",
      specialCurry: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930 \u0935 \u0938\u094D\u092A\u0947\u0936\u0932 \u0935\u0947\u091C \u092C\u093F\u0930\u092F\u093E\u0928\u0940",
      specialRice: "\u0935\u0947\u091C \u092C\u093F\u0930\u092F\u093E\u0928\u0940 \u0935\u093F\u0925 \u0930\u093E\u092F\u0924\u093E",
      specialBread: "\u092C\u091F\u0930 \u0924\u0935\u093E \u0930\u094B\u091F\u0940 \u0935 \u0917\u0941\u0932\u093E\u092C \u091C\u093E\u092E\u0941\u0928",
      lunchDishes: [
        { dishId: "sun_veg_biryani", name: "Special Veg Dum Biryani with Raita", hindiName: "\u0938\u094D\u092A\u0947\u0936\u0932 \u0935\u0947\u091C \u0926\u092E \u092C\u093F\u0930\u092F\u093E\u0928\u0940 \u0935\u093F\u0925 \u0930\u093E\u092F\u0924\u093E", listingPrice: 199, vendorPayoutRate: 75, mealSlot: "lunch" },
        { dishId: "sun_shahi_paneer", name: "Desi Ghee Shahi Paneer", hindiName: "\u0926\u0947\u0938\u0940 \u0918\u0940 \u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930", listingPrice: 189, vendorPayoutRate: 75, mealSlot: "lunch" },
        { dishId: "sun_sunday_special_thali", name: "Sunday Royal Feast Thali", hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0930\u0949\u092F\u0932 \u092B\u0940\u0938\u094D\u091F \u0925\u093E\u0932\u0940", listingPrice: 349, vendorPayoutRate: 120, mealSlot: "lunch" }
      ],
      dinnerDishes: [
        { dishId: "sun_shahi_paneer", name: "Desi Ghee Shahi Paneer", hindiName: "\u0926\u0947\u0938\u0940 \u0918\u0940 \u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930", listingPrice: 189, vendorPayoutRate: 75, mealSlot: "dinner" },
        { dishId: "sun_dal_makhani", name: "Royal Dal Makhani", hindiName: "\u0930\u0949\u092F\u0932 \u0926\u093E\u0932 \u092E\u0916\u0928\u0940", listingPrice: 169, vendorPayoutRate: 65, mealSlot: "dinner" },
        { dishId: "sun_premium_thali", name: "Sunday Premium Thali with Gulab Jamun", hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940 (\u0917\u0941\u0932\u093E\u092C \u091C\u093E\u092E\u0941\u0928 \u0938\u0939\u093F\u0924)", listingPrice: 399, vendorPayoutRate: 135, mealSlot: "dinner" }
      ]
    }
  }
};
async function pushEventToGoogleSheet(_action, _payload) {
}
var VENDOR_STORAGE_FILE = path2.join(process.cwd(), "server_vendor_vault.json");
var VENDOR_BACKUP_FILE = path2.join(process.cwd(), "server_vendor_vault_backup.json");
var VENDOR_SNAPSHOT_FILE = path2.join(process.cwd(), "server_vendor_vault_snapshot.json");
var VENDOR_PERMANENT_FILE = path2.join(process.cwd(), "server_vendor_vault_permanent.json");
var EXTERNAL_IMPORTED_ORDERS_FILE = path2.join(process.cwd(), "server_external_zomato_orders.json");
function mergeExternalImportedOrders(vault) {
  try {
    const fileExists = fs2.existsSync(EXTERNAL_IMPORTED_ORDERS_FILE);
    if (fileExists) {
      const raw = fs2.readFileSync(EXTERNAL_IMPORTED_ORDERS_FILE, "utf-8");
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        const externalOrders = Array.isArray(parsed.orders) ? parsed.orders : Array.isArray(parsed) ? parsed : [];
        if (externalOrders.length > 0) {
          if (!vault.orders) vault.orders = [];
          const existingIds = new Set(vault.orders.map((o) => o.id));
          for (const extOrd of externalOrders) {
            if (!existingIds.has(extOrd.id)) {
              vault.orders.push(extOrd);
              existingIds.add(extOrd.id);
            }
          }
        }
      }
    } else {
      if (vault.orders && Array.isArray(vault.orders)) {
        vault.orders = vault.orders.filter((o) => !o.id || !o.id.startsWith("ORD-ZOMATO-"));
      }
    }
  } catch (err) {
    console.warn("[External Orders Sync Warning]:", err);
  }
}
var inMemoryVendorVault = null;
function saveVendorVault(state) {
  try {
    if (!state || typeof state !== "object") return false;
    const fileExists = fs2.existsSync(EXTERNAL_IMPORTED_ORDERS_FILE);
    if (!fileExists && state.orders && Array.isArray(state.orders)) {
      state.orders = state.orders.filter((o) => !o.id || !o.id.startsWith("ORD-ZOMATO-"));
    }
    let existingOnDisk = null;
    try {
      const diskPath = fs2.existsSync(VENDOR_STORAGE_FILE) ? VENDOR_STORAGE_FILE : fs2.existsSync(VENDOR_BACKUP_FILE) ? VENDOR_BACKUP_FILE : VENDOR_PERMANENT_FILE;
      if (fs2.existsSync(diskPath)) {
        const raw = fs2.readFileSync(diskPath, "utf-8");
        if (raw && raw.trim()) {
          existingOnDisk = JSON.parse(raw);
        }
      }
    } catch {
    }
    if (existingOnDisk) {
      if (Array.isArray(existingOnDisk.orders) && existingOnDisk.orders.length > 0) {
        const diskOrders = fileExists ? existingOnDisk.orders : existingOnDisk.orders.filter((o) => !o.id || !o.id.startsWith("ORD-ZOMATO-"));
        const stateIds = new Set((state.orders || []).map((o) => o.id));
        const missingOrders = diskOrders.filter((o) => !stateIds.has(o.id));
        state.orders = [...state.orders || [], ...missingOrders];
      }
      if (Array.isArray(existingOnDisk.transactions) && existingOnDisk.transactions.length > 0) {
        const stateIds = new Set((state.transactions || []).map((t) => t.id));
        const missingTxns = existingOnDisk.transactions.filter((t) => !stateIds.has(t.id));
        state.transactions = [...state.transactions || [], ...missingTxns];
      }
      if (Array.isArray(existingOnDisk.incentiveHistory) && existingOnDisk.incentiveHistory.length > 0) {
        const stateIds = new Set((state.incentiveHistory || []).map((h) => h.id));
        const missingHistory = existingOnDisk.incentiveHistory.filter((h) => !stateIds.has(h.id));
        state.incentiveHistory = [...state.incentiveHistory || [], ...missingHistory];
      }
      if (Array.isArray(existingOnDisk.inventory) && existingOnDisk.inventory.length > 0) {
        const stateIds = new Set((state.inventory || []).map((i) => i.id));
        const missingItems = existingOnDisk.inventory.filter((i) => !stateIds.has(i.id));
        state.inventory = [...state.inventory || [], ...missingItems];
      }
      if (Array.isArray(existingOnDisk.pendingDishes) && existingOnDisk.pendingDishes.length > 0) {
        const stateIds = new Set((state.pendingDishes || []).map((d) => d.id));
        const missingDishes = existingOnDisk.pendingDishes.filter((d) => !stateIds.has(d.id));
        state.pendingDishes = [...state.pendingDishes || [], ...missingDishes];
      }
      if (Array.isArray(existingOnDisk.refundDeductions) && existingOnDisk.refundDeductions.length > 0) {
        const stateIds = new Set((state.refundDeductions || []).map((r) => r.id));
        const missingRefunds = existingOnDisk.refundDeductions.filter((r) => !stateIds.has(r.id));
        state.refundDeductions = [...state.refundDeductions || [], ...missingRefunds];
      }
      if (!state.incentiveConfig && existingOnDisk.incentiveConfig) {
        state.incentiveConfig = existingOnDisk.incentiveConfig;
      }
      if (existingOnDisk.dailyMenuConfig?.monthlyCalendarOverrides) {
        if (!state.dailyMenuConfig) {
          state.dailyMenuConfig = existingOnDisk.dailyMenuConfig;
        } else if (!state.dailyMenuConfig.monthlyCalendarOverrides) {
          state.dailyMenuConfig.monthlyCalendarOverrides = existingOnDisk.dailyMenuConfig.monthlyCalendarOverrides;
        } else {
          state.dailyMenuConfig.monthlyCalendarOverrides = {
            ...existingOnDisk.dailyMenuConfig.monthlyCalendarOverrides,
            ...state.dailyMenuConfig.monthlyCalendarOverrides
          };
        }
      }
    }
    const jsonStr = JSON.stringify(state, null, 2);
    if (!jsonStr || jsonStr.length < 10) return false;
    inMemoryVendorVault = state;
    fs2.writeFileSync(VENDOR_STORAGE_FILE, jsonStr, "utf-8");
    fs2.writeFileSync(VENDOR_BACKUP_FILE, jsonStr, "utf-8");
    fs2.writeFileSync(VENDOR_SNAPSHOT_FILE, jsonStr, "utf-8");
    fs2.writeFileSync(VENDOR_PERMANENT_FILE, jsonStr, "utf-8");
    writeJsonSafe(VENDOR_STORAGE_FILE, state);
    return true;
  } catch (err) {
    console.error("[Vendor Vault Save Error]:", err);
    return false;
  }
}
function loadVendorVault() {
  if (inMemoryVendorVault && inMemoryVendorVault.vendorId) {
    return inMemoryVendorVault;
  }
  const tryLoadFile = (filePath) => {
    try {
      if (fs2.existsSync(filePath)) {
        const raw = fs2.readFileSync(filePath, "utf-8");
        if (!raw || !raw.trim()) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.vendorId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`[Vault Read Warning for ${filePath}]:`, e);
    }
    return null;
  };
  let vault = tryLoadFile(VENDOR_STORAGE_FILE) || tryLoadFile(VENDOR_BACKUP_FILE) || tryLoadFile(VENDOR_SNAPSHOT_FILE) || tryLoadFile(VENDOR_PERMANENT_FILE);
  if (vault) {
    inMemoryVendorVault = vault;
    if (!vault.orders) vault.orders = [];
    if (!vault.transactions) vault.transactions = [];
    if (!vault.inventory) vault.inventory = [];
    if (!vault.refundDeductions) vault.refundDeductions = [];
    if (!vault.pendingDishes) vault.pendingDishes = [];
    if (!vault.payoutRequests) vault.payoutRequests = [];
    if (!vault.incentiveHistory) vault.incentiveHistory = [];
    if (!vault.wallet) {
      vault.wallet = {
        totalLifetimeEarned: 0,
        currentBalance: 0,
        minimumReserve: 2e3,
        tenDayHoldAmount: 0,
        lastSettlementDate: "None",
        billingCycle: "Friday to Thursday",
        payoutDay: "Monday"
      };
    }
    if (!vault.incentiveConfig) {
      vault.incentiveConfig = JSON.parse(JSON.stringify(DEFAULT_INCENTIVE_CONFIG));
    } else {
      vault.incentiveConfig = {
        ...DEFAULT_INCENTIVE_CONFIG,
        ...vault.incentiveConfig,
        tiers: vault.incentiveConfig.tiers && vault.incentiveConfig.tiers.length > 0 ? vault.incentiveConfig.tiers : DEFAULT_INCENTIVE_CONFIG.tiers
      };
    }
    if (!vault.dailyMenuConfig) {
      vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
    } else {
      if (!vault.dailyMenuConfig.regularFixedDishes) {
        vault.dailyMenuConfig.regularFixedDishes = DEFAULT_DAILY_MENU_CONFIG.regularFixedDishes;
      }
      if (!vault.dailyMenuConfig.dayWiseSchedules) {
        vault.dailyMenuConfig.dayWiseSchedules = DEFAULT_DAILY_MENU_CONFIG.dayWiseSchedules;
      }
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) {
        vault.dailyMenuConfig.monthlyCalendarOverrides = {};
      }
    }
    mergeExternalImportedOrders(vault);
    return vault;
  }
  console.log("[Vendor Vault]: Initializing clean vault file...");
  const seedState = {
    vendorId: "NIR8800",
    orders: [],
    transactions: [],
    inventory: [],
    refundDeductions: [],
    pendingDishes: [],
    payoutRequests: [],
    incentiveConfig: JSON.parse(JSON.stringify(DEFAULT_INCENTIVE_CONFIG)),
    incentiveHistory: [],
    dailyMenuConfig: JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG)),
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
  mergeExternalImportedOrders(seedState);
  saveVendorVault(seedState);
  return seedState;
}
function calculateVendorWeeklyIncentiveStats(vault) {
  const config = vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG;
  const tiers = config.tiers || [];
  const now = /* @__PURE__ */ new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  let deliveredCount = 0;
  for (const o of vault.orders || []) {
    const isApprovedOrDelivered = o.verificationStatus === "APPROVED" || o.status === "delivered";
    const orderDate = o.createdAt ? new Date(o.createdAt) : now;
    if (isApprovedOrDelivered && orderDate >= sevenDaysAgo) {
      if (Array.isArray(o.items) && o.items.length > 0) {
        deliveredCount += o.items.reduce((s, it) => s + (it.quantity || 1), 0);
      } else {
        deliveredCount += o.quantity || 1;
      }
    }
  }
  const sortedTiers = [...tiers].sort((a, b) => a.milestoneMeals - b.milestoneMeals);
  let currentTier = null;
  let nextTier = null;
  for (const t of sortedTiers) {
    if (deliveredCount >= t.milestoneMeals) {
      currentTier = t;
    } else {
      if (!nextTier) {
        nextTier = t;
      }
    }
  }
  const mealsNeeded = nextTier ? Math.max(0, nextTier.milestoneMeals - deliveredCount) : 0;
  const targetDenominator = nextTier ? nextTier.milestoneMeals : currentTier ? currentTier.milestoneMeals : 50;
  const progressPercent = Math.min(100, Math.round(deliveredCount / targetDenominator * 100));
  const history = vault.incentiveHistory || [];
  const cycleIncentives = history.filter((h) => h.grantedAt && new Date(h.grantedAt) >= sevenDaysAgo);
  const totalIncentiveEarnedThisCycle = cycleIncentives.reduce((sum, h) => sum + (h.amount || 0), 0);
  const totalLifetimeIncentives = history.reduce((sum, h) => sum + (h.amount || 0), 0);
  return {
    deliveredMealsThisCycle: deliveredCount,
    currentMilestoneTier: currentTier,
    nextMilestoneTier: nextTier,
    mealsNeededForNextTier: mealsNeeded,
    progressPercent,
    totalIncentiveEarnedThisCycle,
    totalLifetimeIncentives,
    cycleStart: sevenDaysAgo.toISOString().split("T")[0],
    cycleEnd: now.toISOString().split("T")[0]
  };
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
  const syncedJsonPath = path2.join(process.cwd(), "server_rate_card_synced.json");
  const jsonBackup = readJsonSafe(syncedJsonPath, []);
  if (Array.isArray(jsonBackup) && jsonBackup.length > 0) {
    return jsonBackup;
  }
  const syncedFile = path2.join(process.cwd(), "server_rate_card_synced.csv");
  const assetFile = path2.join(process.cwd(), "public/assets/aistudio/NOV_TIFFIN_-_Master_Vendor_Ledger___Rate_Card_142d571c");
  const filePath = fs2.existsSync(syncedFile) ? syncedFile : fs2.existsSync(assetFile) ? assetFile : null;
  if (filePath) {
    try {
      const raw = fs2.readFileSync(filePath, "utf-8");
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
    const syncedFilePath = path2.join(process.cwd(), "server_rate_card_synced.csv");
    fs2.writeFileSync(syncedFilePath, lines.join("\n"), "utf-8");
    const syncedJsonPath = path2.join(process.cwd(), "server_rate_card_synced.json");
    writeJsonSafe(syncedJsonPath, items);
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
  app.post("/api/vendor/change-password", (req, res) => {
    try {
      const { vendorId, currentPassword, newPassword } = req.body || {};
      const targetId = String(vendorId || "NIR8800").trim();
      const cleanNew = String(newPassword || "").trim();
      const cleanCurrent = String(currentPassword || "").trim();
      if (!cleanNew || cleanNew.length < 4) {
        return res.status(400).json({ success: false, message: "\u0928\u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E 4 \u0905\u0915\u094D\u0937\u0930\u094B\u0902 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F\u0964" });
      }
      const staffVaultPath = path2.join(process.cwd(), "server_staff_vault.json");
      if (fs2.existsSync(staffVaultPath)) {
        const staff = JSON.parse(fs2.readFileSync(staffVaultPath, "utf-8"));
        const member = staff.find(
          (s) => s.id.toLowerCase() === targetId.toLowerCase() || Array.isArray(s.userIds) && s.userIds.map((u) => u.toLowerCase()).includes(targetId.toLowerCase())
        );
        if (member) {
          if (cleanCurrent && Array.isArray(member.passwords) && !member.passwords.includes(cleanCurrent)) {
            return res.status(401).json({ success: false, message: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0905\u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964" });
          }
          if (!member.passwords) member.passwords = [];
          if (!member.passwords.includes(cleanNew)) {
            member.passwords.unshift(cleanNew);
          }
          fs2.writeFileSync(staffVaultPath, JSON.stringify(staff, null, 2), "utf-8");
          return res.json({ success: true, message: "\u0928\u092F\u093E \u0935\u0947\u0902\u0921\u0930 \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0947\u091F \u0935 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0939\u094B \u0917\u092F\u093E!" });
        }
      }
      return res.status(404).json({ success: false, message: "\u0935\u0947\u0902\u0921\u0930 \u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    } catch (err) {
      console.error("[Vendor Change Password Error]:", err);
      return res.status(500).json({ success: false, message: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u0930\u094D\u0935\u0930 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
  app.post("/api/vendor/rate-card/sync-csv", (req, res) => {
    try {
      const { csvContent } = req.body || {};
      if (!csvContent || typeof csvContent !== "string") {
        return res.status(400).json({ success: false, message: "CSV \u0915\u0902\u091F\u0947\u0902\u091F \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      }
      fs2.writeFileSync(path2.join(process.cwd(), "server_rate_card_synced.csv"), csvContent.trim(), "utf-8");
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
    const currentReserveAccumulated = Math.min(balance, reserve);
    const remainingReserveNeeded = Math.max(0, reserve - balance);
    const eligibleAmount = Math.max(0, balance - reserve - hold);
    const incentiveStats = calculateVendorWeeklyIncentiveStats(vault);
    res.json({
      success: true,
      wallet: {
        ...vault.wallet,
        currentBalance: balance,
        minimumReserve: reserve,
        currentReserveAccumulated,
        remainingReserveNeeded,
        tenDayHoldAmount: hold,
        eligibleTuesdayPayout: eligibleAmount,
        eligibleMondayPayout: eligibleAmount,
        canRequestPayout: eligibleAmount > 0,
        refundDeductionsTotal: (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0),
        ruleSummary: {
          minimumReserveRule: "\u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0939\u092E\u0947\u0936\u093E \u20B92,000 \u0928\u094D\u092F\u0942\u0928\u0924\u092E \u0930\u093F\u091C\u093C\u0930\u094D\u0935 \u092C\u0948\u0932\u0947\u0902\u0938 \u0930\u0939\u0947\u0917\u093E\u0964",
          payoutSchedule: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0938\u0947 \u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u0947 \u092C\u093F\u0932\u093F\u0902\u0917 \u091A\u0915\u094D\u0930 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928 1 \u0939\u092B\u094D\u0924\u0947 \u0915\u0947 \u0930\u094B\u0932\u093F\u0902\u0917 \u0905\u0902\u0924\u0930\u093E\u0932 \u092A\u0930 \u0939\u0930 \u092E\u0902\u0917\u0932\u0935\u093E\u0930 (Tuesday) \u0915\u094B \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0939\u094B\u0917\u093E\u0964",
          tenDayHoldRule: "10 \u0926\u093F\u0928 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B\u0932\u094D\u0921 \u092A\u0930 \u0930\u0939\u0947\u0917\u093E, \u091C\u094B DNS/\u0921\u093F\u0938\u094D\u092A\u094D\u092F\u0942\u091F \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0947 \u0938\u092E\u092F \u0930\u093F\u0932\u0940\u091C \u0939\u094B\u0917\u093E\u0964",
          refundDeductionRule: "\u0915\u0938\u094D\u091F\u092E\u0930 \u0915\u0948\u0902\u0938\u093F\u0932\u0947\u0936\u0928/\u0930\u093F\u092B\u0902\u0921 \u0939\u094B\u0928\u0947 \u092A\u0930 \u0924\u092F \u0935\u0947\u0902\u0921\u0930 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0935\u0949\u0932\u0947\u091F \u0938\u0947 \u0938\u094D\u0935\u0924\u0903 \u0915\u091F\u0947\u0917\u093E\u0964"
        }
      },
      transactions: vault.transactions.slice(0, 50),
      refundDeductions: (vault.refundDeductions || []).slice(0, 30),
      payoutRequests: vault.payoutRequests || [],
      incentiveStats,
      incentiveConfig: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
      incentiveHistory: (vault.incentiveHistory || []).slice(0, 50)
    });
  });
  app.post("/api/vendor/payout/request", (req, res) => {
    try {
      const { amount, upiId, notes } = req.body || {};
      const numAmt = Number(amount);
      const vault = loadVendorVault();
      if (!vault.payoutRequests) vault.payoutRequests = [];
      const balance = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2e3;
      const eligibleAmount = Math.max(0, balance - reserve);
      if (eligibleAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: `\u092A\u0947\u0906\u0909\u091F \u0930\u093F\u0915\u094D\u0935\u0947\u0938\u094D\u091F \u0915\u0947\u0935\u0932 \u0924\u092D\u0940 \u092D\u0947\u091C\u0940 \u091C\u093E \u0938\u0915\u0924\u0940 \u0939\u0948 \u091C\u092C \u0935\u0949\u0932\u0947\u091F \u092C\u0948\u0932\u0947\u0902\u0938 \u20B92,000 \u0930\u093F\u091C\u093C\u0930\u094D\u0935 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0964 \u0906\u092A\u0915\u093E \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092C\u0948\u0932\u0947\u0902\u0938: \u20B9${balance}`
        });
      }
      if (!numAmt || numAmt <= 0) {
        return res.status(400).json({
          success: false,
          message: "\u0915\u0943\u092A\u092F\u093E \u092E\u093E\u0928\u094D\u092F \u092A\u0947\u0906\u0909\u091F \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964"
        });
      }
      if (numAmt > eligibleAmount) {
        return res.status(400).json({
          success: false,
          message: `\u0905\u0928\u0941\u0930\u094B\u0927\u093F\u0924 \u0930\u093E\u0936\u093F (\u20B9${numAmt}) \u0906\u092A\u0915\u0940 \u0905\u0927\u093F\u0915\u0924\u092E \u0926\u0947\u092F \u0930\u093E\u0936\u093F (\u20B9${eligibleAmount}) \u0938\u0947 \u0905\u0927\u093F\u0915 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u0940\u0964`
        });
      }
      const newRequest = {
        id: `payout_req_${Date.now()}`,
        amount: numAmt,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "PENDING",
        upiId: String(upiId || "9118409672@upi").trim(),
        notes: String(notes || "").trim()
      };
      vault.payoutRequests.unshift(newRequest);
      saveVendorVault(vault);
      res.json({
        success: true,
        payoutRequest: newRequest,
        message: `\u20B9${numAmt} \u0915\u0940 \u092A\u0947\u0906\u0909\u091F \u0930\u093F\u0915\u094D\u0935\u0947\u0938\u094D\u091F \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0913\u0928\u0930 \u092A\u0948\u0928\u0932 \u092E\u0947\u0902 \u092D\u0947\u091C \u0926\u0940 \u0917\u0908 \u0939\u0948! \u092E\u093E\u0932\u093F\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u092A\u094D\u0930\u0942\u0935 \u0939\u094B\u0924\u0947 \u0939\u0940 \u0906\u092A\u0915\u0947 UPI/\u092C\u0948\u0902\u0915 \u092E\u0947\u0902 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0939\u094B \u091C\u093E\u090F\u0917\u0940\u0964`
      });
    } catch (err) {
      console.error("[Vendor Payout Request Error]:", err);
      res.status(500).json({ success: false, message: "\u092A\u0947\u0906\u0909\u091F \u0930\u093F\u0915\u094D\u0935\u0947\u0938\u094D\u091F \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
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
        verificationStatus: "PENDING",
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
      let message = `\u0911\u0930\u094D\u0921\u0930 \u0938\u094D\u091F\u0947\u091F\u0938 "${newStatus}" \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u092F\u093E\u0964`;
      if (newStatus === "delivered") {
        if (order.verificationStatus === "APPROVED" && !order.payoutCreditedToWallet) {
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
          message = `\u0911\u0930\u094D\u0921\u0930 \u0921\u093F\u0932\u0940\u0935\u0930 \u0939\u094B \u0917\u092F\u093E \u0914\u0930 \u20B9${payout} \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0939\u094B \u0917\u092F\u093E!`;
        } else if (!order.payoutCreditedToWallet) {
          order.verificationStatus = "PENDING_APPROVAL";
          message = `\u0911\u0930\u094D\u0921\u0930 \u0921\u093F\u0932\u0940\u0935\u0930 \u092E\u093E\u0930\u094D\u0915 \u0939\u094B \u0917\u092F\u093E! '\u0926\u0947\u0935\u0940' (\u092E\u093E\u0932\u093F\u0915) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u092A\u094D\u0930\u0942\u0935\u0932 \u092E\u093F\u0932\u0924\u0947 \u0939\u0940 \u20B9${order.totalVendorPayout} \u0906\u092A\u0915\u0947 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u091C\u0941\u0921\u093C \u091C\u093E\u090F\u0917\u093E\u0964`;
        }
      }
      saveVendorVault(vault);
      pushEventToGoogleSheet("order_status_update", { orderId, newStatus, currentBalance: vault.wallet.currentBalance });
      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message
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
      const currentReserveAccumulated = Math.min(grossEarned, reserve);
      const remainingReserveNeeded = Math.max(0, reserve - grossEarned);
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);
      const incentiveStats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        rateCard: dynamicRateCard,
        pendingDishes: vault.pendingDishes || [],
        orders: vault.orders || [],
        wallet: {
          ...vault.wallet,
          currentReserveAccumulated,
          remainingReserveNeeded,
          eligibleTuesdayPayout: eligiblePay,
          eligibleMondayPayout: eligiblePay,
          totalRefundDeductions
        },
        dailyMenuConfig: vault.dailyMenuConfig || DEFAULT_DAILY_MENU_CONFIG,
        transactions: vault.transactions || [],
        refundDeductions: vault.refundDeductions || [],
        inventory: vault.inventory || [],
        payoutRequests: vault.payoutRequests || [],
        incentiveStats,
        incentiveConfig: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
        incentiveHistory: (vault.incentiveHistory || []).slice(0, 50)
      });
    } catch (err) {
      console.error("[Owner Vendor Overview Error]:", err);
      res.status(500).json({ success: false, message: "\u0935\u0947\u0902\u0921\u0930 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.get("/api/vendor/daily-menu", (_req, res) => {
    try {
      const vault = loadVendorVault();
      const dailyConfig = vault.dailyMenuConfig || DEFAULT_DAILY_MENU_CONFIG;
      const now = /* @__PURE__ */ new Date();
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const todayDayId = dayNames[now.getDay()] || "monday";
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const todayDateStr = `${yyyy}-${mm}-${dd}`;
      const override = dailyConfig.monthlyCalendarOverrides?.[todayDateStr];
      const weeklyFallback = dailyConfig.dayWiseSchedules[todayDayId] || dailyConfig.dayWiseSchedules.monday;
      const todaySchedule = override || weeklyFallback;
      res.json({
        success: true,
        todayDayId,
        todayDateStr,
        isCustomOverride: Boolean(override),
        todaySchedule,
        dailyMenuConfig: dailyConfig
      });
    } catch (err) {
      console.error("[Get Daily Menu Error]:", err);
      res.status(500).json({ success: false, message: "\u0926\u0948\u0928\u093F\u0915 \u092E\u0947\u0928\u0942 \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.get("/api/owner/daily-menu/monthly-calendar", (req, res) => {
    try {
      const year = parseInt(String(req.query.year || (/* @__PURE__ */ new Date()).getFullYear()), 10);
      const month = parseInt(String(req.query.month || (/* @__PURE__ */ new Date()).getMonth() + 1), 10);
      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) vault.dailyMenuConfig.monthlyCalendarOverrides = {};
      const overrides = vault.dailyMenuConfig.monthlyCalendarOverrides;
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const hindiDayNames = {
        sunday: "\u0930\u0935\u093F\u0935\u093E\u0930",
        monday: "\u0938\u094B\u092E\u0935\u093E\u0930",
        tuesday: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930",
        wednesday: "\u092C\u0941\u0927\u0935\u093E\u0930",
        thursday: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930",
        friday: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930",
        saturday: "\u0936\u0928\u093F\u0935\u093E\u0930"
      };
      const daysInMonth = new Date(year, month, 0).getDate();
      const calendarDays = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const mm = String(month).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        const dateStr = `${year}-${mm}-${dd}`;
        const dayOfWeek = dayNames[dateObj.getDay()] || "monday";
        const custom = overrides[dateStr];
        const weeklyFallback = vault.dailyMenuConfig.dayWiseSchedules[dayOfWeek] || vault.dailyMenuConfig.dayWiseSchedules.monday;
        if (custom) {
          calendarDays.push({
            dateStr,
            dayOfMonth: d,
            dayOfWeek,
            dayNameHindi: hindiDayNames[dayOfWeek] || "\u0938\u094B\u092E\u0935\u093E\u0930",
            isCustomOverride: true,
            specialCurry: custom.specialCurry || weeklyFallback.specialCurry || "\u0926\u0948\u0928\u093F\u0915 \u0935\u093F\u0936\u0947\u0937",
            specialRice: custom.specialRice || weeklyFallback.specialRice || "\u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938",
            specialBread: custom.specialBread || weeklyFallback.specialBread || "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
            lunchCount: (custom.lunchDishes || []).length,
            dinnerCount: (custom.dinnerDishes || []).length,
            scheduleDetails: custom
          });
        } else {
          calendarDays.push({
            dateStr,
            dayOfMonth: d,
            dayOfWeek,
            dayNameHindi: hindiDayNames[dayOfWeek] || "\u0938\u094B\u092E\u0935\u093E\u0930",
            isCustomOverride: false,
            specialCurry: weeklyFallback.specialCurry || "\u0926\u0948\u0928\u093F\u0915 \u0935\u093F\u0936\u0947\u0937",
            specialRice: weeklyFallback.specialRice || "\u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938",
            specialBread: weeklyFallback.specialBread || "\u0924\u0935\u093E \u0930\u094B\u091F\u0940",
            lunchCount: (weeklyFallback.lunchDishes || []).length,
            dinnerCount: (weeklyFallback.dinnerDishes || []).length,
            scheduleDetails: weeklyFallback
          });
        }
      }
      res.json({
        success: true,
        year,
        month,
        totalDays: daysInMonth,
        calendarDays,
        dailyMenuConfig: vault.dailyMenuConfig
      });
    } catch (err) {
      console.error("[Get Monthly Calendar Error]:", err);
      res.status(500).json({ success: false, message: "\u0915\u0948\u0932\u0947\u0902\u0921\u0930 \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/daily-menu/bulk-update-calendar", (req, res) => {
    try {
      const { dates, action, templateDayId, specialCurry, specialRice, specialBread, lunchDishes, dinnerDishes, regularFixedDishes, notes } = req.body || {};
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ success: false, message: "\u0915\u092E \u0938\u0947 \u0915\u092E \u090F\u0915 \u0924\u093E\u0930\u0940\u0916 (Date) \u091A\u0941\u0928\u0947\u0902\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) vault.dailyMenuConfig.monthlyCalendarOverrides = {};
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const hindiDayNames = {
        sunday: "\u0930\u0935\u093F\u0935\u093E\u0930",
        monday: "\u0938\u094B\u092E\u0935\u093E\u0930",
        tuesday: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930",
        wednesday: "\u092C\u0941\u0927\u0935\u093E\u0930",
        thursday: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930",
        friday: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930",
        saturday: "\u0936\u0928\u093F\u0935\u093E\u0930"
      };
      if (action === "clear_override") {
        for (const dt of dates) {
          delete vault.dailyMenuConfig.monthlyCalendarOverrides[dt];
        }
      } else if (action === "apply_template" && templateDayId) {
        const template = vault.dailyMenuConfig.dayWiseSchedules[templateDayId] || vault.dailyMenuConfig.dayWiseSchedules.monday;
        for (const dt of dates) {
          const parts = dt.split("-");
          const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const dayOfWeek = dayNames[dateObj.getDay()] || "monday";
          vault.dailyMenuConfig.monthlyCalendarOverrides[dt] = {
            date: dt,
            dayNameHindi: hindiDayNames[dayOfWeek] || "\u0938\u094B\u092E\u0935\u093E\u0930",
            specialCurry: template.specialCurry,
            specialRice: template.specialRice,
            specialBread: template.specialBread,
            lunchDishes: JSON.parse(JSON.stringify(template.lunchDishes || [])),
            dinnerDishes: JSON.parse(JSON.stringify(template.dinnerDishes || [])),
            isCustomOverride: true,
            notes: notes || `Template ${template.dayNameHindi} applied by Owner`
          };
        }
      } else {
        for (const dt of dates) {
          const parts = dt.split("-");
          const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const dayOfWeek = dayNames[dateObj.getDay()] || "monday";
          const existing = vault.dailyMenuConfig.monthlyCalendarOverrides[dt] || {
            date: dt,
            dayNameHindi: hindiDayNames[dayOfWeek] || "\u0938\u094B\u092E\u0935\u093E\u0930",
            lunchDishes: [],
            dinnerDishes: []
          };
          if (specialCurry !== void 0) existing.specialCurry = String(specialCurry).trim();
          if (specialRice !== void 0) existing.specialRice = String(specialRice).trim();
          if (specialBread !== void 0) existing.specialBread = String(specialBread).trim();
          if (Array.isArray(lunchDishes)) existing.lunchDishes = lunchDishes;
          if (Array.isArray(dinnerDishes)) existing.dinnerDishes = dinnerDishes;
          existing.isCustomOverride = true;
          if (notes) existing.notes = String(notes).trim();
          vault.dailyMenuConfig.monthlyCalendarOverrides[dt] = existing;
        }
      }
      if (Array.isArray(regularFixedDishes) && regularFixedDishes.length > 0) {
        vault.dailyMenuConfig.regularFixedDishes = regularFixedDishes;
      }
      vault.dailyMenuConfig.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      saveVendorVault(vault);
      res.json({
        success: true,
        updatedDatesCount: dates.length,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `${dates.length} \u0924\u093E\u0930\u0940\u0916\u094B\u0902 \u092A\u0930 \u0926\u0948\u0928\u093F\u0915 \u0935 \u092B\u093F\u0915\u094D\u0938 \u092E\u0947\u0928\u0942 \u0938\u092B\u0932\u0924\u093E \u0938\u0947 \u092C\u0932\u094D\u0915 \u0905\u092A\u0921\u0947\u091F \u0935 \u0938\u0939\u0947\u091C\u093E \u0917\u092F\u093E!`
      });
    } catch (err) {
      console.error("[Bulk Update Calendar Error]:", err);
      res.status(500).json({ success: false, message: "\u092C\u0932\u094D\u0915 \u0915\u0948\u0932\u0947\u0902\u0921\u0930 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/daily-menu/update-day", (req, res) => {
    try {
      const { dayId, specialCurry, specialRice, specialBread, lunchDishes, dinnerDishes } = req.body || {};
      if (!dayId) {
        return res.status(400).json({ success: false, message: "Day ID (monday, tuesday, etc.) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      const existingDay = vault.dailyMenuConfig.dayWiseSchedules[dayId];
      if (!existingDay) {
        return res.status(404).json({ success: false, message: `\u0926\u093F\u0928 ${dayId} \u0915\u093E \u0936\u0947\u0921\u094D\u092F\u0942\u0932 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964` });
      }
      if (specialCurry !== void 0) existingDay.specialCurry = String(specialCurry).trim();
      if (specialRice !== void 0) existingDay.specialRice = String(specialRice).trim();
      if (specialBread !== void 0) existingDay.specialBread = String(specialBread).trim();
      if (Array.isArray(lunchDishes)) existingDay.lunchDishes = lunchDishes;
      if (Array.isArray(dinnerDishes)) existingDay.dinnerDishes = dinnerDishes;
      vault.dailyMenuConfig.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      saveVendorVault(vault);
      res.json({
        success: true,
        updatedDay: existingDay,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `${existingDay.dayNameHindi} \u0915\u093E \u092E\u0947\u0928\u0942 \u0936\u0947\u0921\u094D\u092F\u0942\u0932 \u092E\u093E\u0932\u093F\u0915 (\u0926\u0947\u0935\u0940) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u092A\u0921\u0947\u091F \u0935 \u0938\u0939\u0947\u091C\u093E \u0917\u092F\u093E!`
      });
    } catch (err) {
      console.error("[Update Day Menu Error]:", err);
      res.status(500).json({ success: false, message: "\u0926\u093F\u0928 \u0915\u093E \u092E\u0947\u0928\u0942 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/daily-menu/add-dish", (req, res) => {
    try {
      const { target, dayId, mealSlot, dishId, name, hindiName, listingPrice, vendorPayoutRate } = req.body || {};
      if (!dishId || !name) {
        return res.status(400).json({ success: false, message: "Dish ID \u0914\u0930 \u0928\u093E\u092E \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      const newDish = {
        dishId: String(dishId).trim(),
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        listingPrice: Math.max(1, Number(listingPrice || 99)),
        vendorPayoutRate: Math.max(1, Number(vendorPayoutRate || 40)),
        mealSlot: mealSlot || "all_day",
        isFixedDaily: target === "regular_fixed"
      };
      if (target === "regular_fixed") {
        const exists = vault.dailyMenuConfig.regularFixedDishes.some((d) => d.dishId === newDish.dishId);
        if (!exists) {
          vault.dailyMenuConfig.regularFixedDishes.push(newDish);
        }
      } else if (dayId && vault.dailyMenuConfig.dayWiseSchedules[dayId]) {
        const dayObj = vault.dailyMenuConfig.dayWiseSchedules[dayId];
        if (mealSlot === "dinner") {
          dayObj.dinnerDishes.push(newDish);
        } else {
          dayObj.lunchDishes.push(newDish);
        }
      }
      vault.dailyMenuConfig.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      saveVendorVault(vault);
      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `\u0921\u093F\u0936 "${newDish.name}" \u0938\u092B\u0932\u0924\u093E \u0938\u0947 \u092E\u0947\u0928\u0942 \u0936\u0947\u0921\u094D\u092F\u0942\u0932 \u092E\u0947\u0902 \u091C\u094B\u0921\u093C \u0926\u0940 \u0917\u0908!`
      });
    } catch (err) {
      console.error("[Add Daily Menu Dish Error]:", err);
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u091C\u094B\u0921\u093C\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/daily-menu/remove-dish", (req, res) => {
    try {
      const { target, dayId, mealSlot, dishId } = req.body || {};
      if (!dishId) {
        return res.status(400).json({ success: false, message: "Dish ID \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      if (target === "regular_fixed") {
        vault.dailyMenuConfig.regularFixedDishes = vault.dailyMenuConfig.regularFixedDishes.filter((d) => d.dishId !== dishId);
      } else if (dayId && vault.dailyMenuConfig.dayWiseSchedules[dayId]) {
        const dayObj = vault.dailyMenuConfig.dayWiseSchedules[dayId];
        if (mealSlot === "dinner") {
          dayObj.dinnerDishes = dayObj.dinnerDishes.filter((d) => d.dishId !== dishId);
        } else {
          dayObj.lunchDishes = dayObj.lunchDishes.filter((d) => d.dishId !== dishId);
        }
      }
      vault.dailyMenuConfig.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
      saveVendorVault(vault);
      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: "\u0921\u093F\u0936 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u092E\u0947\u0928\u0942 \u0936\u0947\u0921\u094D\u092F\u0942\u0932 \u0938\u0947 \u0939\u091F\u093E \u0926\u0940 \u0917\u0908!"
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u0921\u093F\u0936 \u0939\u091F\u093E\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/daily-menu/reset", (_req, res) => {
    try {
      const vault = loadVendorVault();
      vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      saveVendorVault(vault);
      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: "\u0926\u0948\u0928\u093F\u0915 \u0935 \u092B\u093F\u0915\u094D\u0938 \u092E\u0947\u0928\u0942 \u0936\u0947\u0921\u094D\u092F\u0942\u0932 \u0921\u093F\u092B\u093C\u0949\u0932\u094D\u091F \u0905\u0927\u093F\u0915\u0943\u0924 \u0938\u0942\u091A\u0940 \u092A\u0930 \u0930\u0940\u0938\u0947\u091F \u0939\u094B \u0917\u092F\u093E!"
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "\u092E\u0947\u0928\u0942 \u0930\u0940\u0938\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.get("/api/vendor/incentives/overview", (_req, res) => {
    try {
      const vault = loadVendorVault();
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        stats,
        config: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
        history: (vault.incentiveHistory || []).slice(0, 50)
      });
    } catch (err) {
      console.error("[Incentive Overview Error]:", err);
      res.status(500).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/incentives/grant-spot", (req, res) => {
    try {
      const { vendorId, amount, reason } = req.body || {};
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: "\u092E\u093E\u0928\u094D\u092F \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
      }
      if (!reason) {
        return res.status(400).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0915\u093E \u0915\u093E\u0930\u0923 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];
      vault.wallet.currentBalance += numAmount;
      vault.wallet.totalLifetimeEarned += numAmount;
      const record = {
        id: `inc_${Date.now()}`,
        vendorId: String(vendorId || "NIR8800").trim(),
        type: "spot_bonus",
        amount: numAmount,
        reason: String(reason).trim(),
        grantedBy: "Owner Operations Desk",
        grantedAt: (/* @__PURE__ */ new Date()).toISOString(),
        cyclePeriod: "Current Week"
      };
      vault.incentiveHistory.unshift(record);
      const txn = {
        id: `txn_inc_${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: "incentive_bonus",
        amount: numAmount,
        description: `\u{1F3AF} \u0938\u094D\u092A\u0949\u091F \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u092C\u094B\u0928\u0938: ${record.reason}`,
        referenceId: record.id,
        balanceAfter: vault.wallet.currentBalance,
        status: "settled",
        ownerApprovedBy: "Owner Operations Desk",
        cyclePeriod: "Incentive Reward"
      };
      vault.transactions.unshift(txn);
      saveVendorVault(vault);
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        record,
        newBalance: vault.wallet.currentBalance,
        stats,
        message: `\u20B9${numAmount} \u0915\u093E \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u092C\u094B\u0928\u0938 \u0935\u0947\u0902\u0921\u0930 \u0915\u0947 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0939\u094B \u0917\u092F\u093E! (\u0928\u092F\u093E \u092C\u0948\u0932\u0947\u0902\u0938: \u20B9${vault.wallet.currentBalance})`
      });
    } catch (err) {
      console.error("[Grant Spot Incentive Error]:", err);
      res.status(500).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/incentives/process-milestones", (_req, res) => {
    try {
      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      const config = vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG;
      if (!config.enabled) {
        return res.status(400).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0938\u093F\u0938\u094D\u091F\u092E \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u092C\u0902\u0926 (Disabled) \u0939\u0948\u0964" });
      }
      const tiers = [...config.tiers || []].sort((a, b) => a.milestoneMeals - b.milestoneMeals);
      const awarded = [];
      const now = /* @__PURE__ */ new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const recentMilestoneAwards = vault.incentiveHistory.filter(
        (h) => h.type === "milestone" && new Date(h.grantedAt) >= sevenDaysAgo
      );
      const awardedTierIds = new Set(recentMilestoneAwards.map((h) => h.tierId).filter(Boolean));
      for (const tier of tiers) {
        if (stats.deliveredMealsThisCycle >= tier.milestoneMeals && !awardedTierIds.has(tier.id)) {
          vault.wallet.currentBalance += tier.bonusAmount;
          vault.wallet.totalLifetimeEarned += tier.bonusAmount;
          const record = {
            id: `inc_m_${tier.id}_${Date.now()}`,
            vendorId: vault.vendorId || "NIR8800",
            type: "milestone",
            amount: tier.bonusAmount,
            mealsCompleted: stats.deliveredMealsThisCycle,
            tierId: tier.id,
            reason: `\u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u092E\u093E\u0907\u0932\u0938\u094D\u091F\u094B\u0928 \u0930\u093F\u0935\u0949\u0930\u094D\u0921: ${tier.title} (${tier.milestoneMeals}+ \u091F\u093F\u092B\u093F\u0928 \u092A\u0942\u0930\u0947)`,
            grantedBy: "Automated Milestone Engine (Owner Verified)",
            grantedAt: (/* @__PURE__ */ new Date()).toISOString(),
            cyclePeriod: `${stats.cycleStart} to ${stats.cycleEnd}`
          };
          vault.incentiveHistory.unshift(record);
          vault.transactions.unshift({
            id: `txn_m_inc_${Date.now()}_${tier.id}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            type: "incentive_bonus",
            amount: tier.bonusAmount,
            description: `\u{1F3AF} \u092E\u093E\u0907\u0932\u0938\u094D\u091F\u094B\u0928 \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935: ${tier.title} (${tier.milestoneMeals}+ \u092E\u0940\u0932 \u091F\u093E\u0930\u0917\u0947\u091F)`,
            referenceId: record.id,
            balanceAfter: vault.wallet.currentBalance,
            status: "settled",
            ownerApprovedBy: "System Milestone Engine",
            cyclePeriod: "Weekly Milestone Reward"
          });
          awarded.push(record);
        }
      }
      saveVendorVault(vault);
      const updatedStats = calculateVendorWeeklyIncentiveStats(vault);
      if (awarded.length === 0) {
        return res.json({
          success: true,
          awardedCount: 0,
          stats: updatedStats,
          message: `\u0907\u0938 \u0939\u092B\u093C\u094D\u0924\u0947 \u0915\u0947 \u0938\u092D\u0940 \u092F\u094B\u0917\u094D\u092F \u092E\u093E\u0907\u0932\u0938\u094D\u091F\u094B\u0928 \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u092A\u0939\u0932\u0947 \u0939\u0940 \u0935\u093F\u0924\u0930\u093F\u0924 \u0915\u093F\u090F \u091C\u093E \u091A\u0941\u0915\u0947 \u0939\u0948\u0902 \u092F\u093E \u0932\u0915\u094D\u0937\u094D\u092F \u0905\u092D\u0940 \u0924\u0915 \u092A\u0942\u0930\u093E \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0921\u093F\u0932\u0940\u0935\u0930\u0940: ${stats.deliveredMealsThisCycle} \u091F\u093F\u092B\u093F\u0928\u0964`
        });
      }
      res.json({
        success: true,
        awardedCount: awarded.length,
        awarded,
        stats: updatedStats,
        newBalance: vault.wallet.currentBalance,
        message: `${awarded.length} \u0928\u090F \u092E\u093E\u0907\u0932\u0938\u094D\u091F\u094B\u0928 \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0935\u0947\u0902\u0921\u0930 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u093F\u090F \u0917\u090F! \u0915\u0941\u0932 \u0930\u093E\u0936\u093F: \u20B9${awarded.reduce((s, a) => s + a.amount, 0)}`
      });
    } catch (err) {
      console.error("[Process Milestones Error]:", err);
      res.status(500).json({ success: false, message: "\u092E\u093E\u0907\u0932\u0938\u094D\u091F\u094B\u0928 \u092A\u094D\u0930\u094B\u0938\u0947\u0938 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/incentives/update-config", (req, res) => {
    try {
      const { enabled, tiers, onTimeBonusPerMeal, zeroComplaintWeeklyBonus, dailyZeroCancellationBonus, weeklyHundredPercentOnlineBonus } = req.body || {};
      const vault = loadVendorVault();
      vault.incentiveConfig = {
        enabled: enabled !== false,
        tiers: Array.isArray(tiers) && tiers.length > 0 ? tiers : vault.incentiveConfig?.tiers || DEFAULT_INCENTIVE_CONFIG.tiers,
        onTimeBonusPerMeal: Number(onTimeBonusPerMeal ?? 5),
        zeroComplaintWeeklyBonus: Number(zeroComplaintWeeklyBonus ?? 250),
        dailyZeroCancellationBonus: Number(dailyZeroCancellationBonus ?? 50),
        weeklyHundredPercentOnlineBonus: Number(weeklyHundredPercentOnlineBonus ?? 300)
      };
      saveVendorVault(vault);
      res.json({
        success: true,
        config: vault.incentiveConfig,
        message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0930\u0942\u0932\u094D\u0938 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0905\u092A\u0921\u0947\u091F \u0935 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0939\u094B \u0917\u090F!"
      });
    } catch (err) {
      console.error("[Update Incentive Config Error]:", err);
      res.status(500).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0915\u0949\u0928\u094D\u092B\u093C\u093F\u0917\u0930\u0947\u0936\u0928 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/incentives/delete-granted", (req, res) => {
    try {
      const { recordId } = req.body || {};
      if (!recordId) {
        return res.status(400).json({ success: false, message: "Record ID \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      }
      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];
      const index = vault.incentiveHistory.findIndex((h) => h.id === recordId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0930\u093F\u0915\u0949\u0930\u094D\u0921 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      const record = vault.incentiveHistory[index];
      const amount = record.amount || 0;
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - amount);
      vault.wallet.totalLifetimeEarned = Math.max(0, vault.wallet.totalLifetimeEarned - amount);
      vault.incentiveHistory.splice(index, 1);
      if (vault.transactions) {
        vault.transactions = vault.transactions.filter((t) => t.referenceId !== recordId && t.id !== `txn_${recordId}`);
      }
      saveVendorVault(vault);
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        stats,
        newBalance: vault.wallet.currentBalance,
        message: `\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0930\u093F\u0915\u0949\u0930\u094D\u0921 #${recordId} \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E (\u20B9${amount} \u0935\u0949\u0932\u0947\u091F \u0938\u0947 \u0930\u093F\u0935\u0930\u094D\u0938 \u0915\u093F\u092F\u093E \u0917\u092F\u093E)\u0964`
      });
    } catch (err) {
      console.error("[Delete Granted Incentive Error]:", err);
      res.status(500).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0930\u093F\u0915\u0949\u0930\u094D\u0921 \u0939\u091F\u093E\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/incentives/clear-history", (_req, res) => {
    try {
      const vault = loadVendorVault();
      vault.incentiveHistory = [];
      saveVendorVault(vault);
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        stats,
        message: "\u0938\u092D\u0940 \u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0939\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0930\u093F\u0938\u0947\u091F \u0915\u0930 \u0926\u0940 \u0917\u0908!"
      });
    } catch (err) {
      console.error("[Clear Incentive History Error]:", err);
      res.status(500).json({ success: false, message: "\u0907\u0902\u0938\u0947\u0902\u091F\u093F\u0935 \u0939\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0930\u093F\u0938\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
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
  app.post("/api/owner/vendor/rate-card/reset-to-master", (_req, res) => {
    try {
      saveRateCardToCSV(VENDOR_MASTER_RATE_CARD);
      const updated = loadDynamicRateCard();
      res.json({
        success: true,
        count: updated.length,
        rateCard: updated,
        message: `\u092E\u093E\u0938\u094D\u091F\u0930 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0930\u0940\u0938\u0947\u091F \u0939\u094B \u0917\u092F\u093E! \u0915\u0941\u0932 ${updated.length} \u0905\u0927\u093F\u0915\u0943\u0924 \u0921\u093F\u0936\u0947\u091C\u093C \u0935 \u0915\u0949\u092E\u094D\u092C\u094B \u0932\u094B\u0921 \u0939\u094B \u0917\u090F \u0939\u0948\u0902\u0964`
      });
    } catch (err) {
      console.error("[Reset Rate Card Error]:", err);
      res.status(500).json({ success: false, message: "\u092E\u093E\u0938\u094D\u091F\u0930 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0930\u0940\u0938\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
    }
  });
  app.post("/api/owner/vendor/dishes/review", (req, res) => {
    try {
      const { dishId, action, notes, customPortions } = req.body || {};
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
        dish.notes = notes || "\u092E\u093E\u0932\u093F\u0915 (\u0926\u0947\u0935\u0940) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0928\u0941\u092E\u094B\u0926\u093F\u0924 (Approved by Owner)";
        if (customPortions && Array.isArray(customPortions) && customPortions.length > 0) {
          dish.portions = customPortions.map((p) => ({
            size: String(p.size || "Standard"),
            listingPrice: Math.max(1, Number(p.listingPrice || 99)),
            vendorPayoutRate: Math.max(1, Number(p.vendorPayoutRate || 40))
          }));
        }
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
        dish.notes = notes || "\u092E\u093E\u0932\u093F\u0915 (\u0926\u0947\u0935\u0940) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 (Rejected)";
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
      const { amount, utrNumber, paymentMode, notes, requestId } = req.body || {};
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
      if (requestId && vault.payoutRequests) {
        const reqObj = vault.payoutRequests.find((r) => r.id === requestId);
        if (reqObj) {
          reqObj.status = "DISBURSED";
          reqObj.utrNumber = String(utrNumber).trim();
          reqObj.notes = String(notes || "").trim();
        }
      }
      vault.wallet.currentBalance = Math.max(0, currentBal - numAmount);
      vault.wallet.lastSettlementDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const txn = {
        id: `txn_payout_${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: "payout_disbursed",
        amount: numAmount,
        description: `Payout Paid via ${paymentMode || "UPI"} (UTR: ${utrNumber})${notes ? ` - ${notes}` : ""}`,
        referenceId: String(utrNumber).trim(),
        utrNumber: String(utrNumber).trim(),
        balanceAfter: vault.wallet.currentBalance,
        status: "settled",
        ownerApprovedBy: "Owner / Navovia Next HQ",
        cyclePeriod: "Settlement"
      };
      vault.transactions.unshift(txn);
      saveVendorVault(vault);
      res.json({
        success: true,
        newBalance: vault.wallet.currentBalance,
        transaction: txn,
        message: `\u20B9${numAmount} \u0915\u093E \u092A\u0947\u0906\u0909\u091F \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0926\u0930\u094D\u091C \u0939\u0941\u0906! \u0928\u092F\u093E \u092C\u0948\u0932\u0947\u0902\u0938: \u20B9${vault.wallet.currentBalance}`
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
  app.post("/api/owner/vendor/orders/verify", (req, res) => {
    try {
      const { orderId, action, notes } = req.body || {};
      if (!orderId || !action) {
        return res.status(400).json({ success: false, message: "Order ID \u0914\u0930 Action (APPROVE / REJECT) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
      }
      const vault = loadVendorVault();
      const order = (vault.orders || []).find((o) => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "\u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      }
      if (action.toUpperCase() === "APPROVE") {
        order.verificationStatus = "APPROVED";
        if (!order.payoutCreditedToWallet) {
          order.payoutCreditedToWallet = true;
          const payout = order.totalVendorPayout || 0;
          vault.wallet.currentBalance += payout;
          vault.wallet.totalLifetimeEarned += payout;
          vault.transactions.unshift({
            id: `txn_ord_${Date.now()}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            type: "order_credit",
            amount: payout,
            description: `Verified Order Payout: ${order.itemName} (${order.orderNumber})`,
            referenceId: order.orderNumber,
            balanceAfter: vault.wallet.currentBalance,
            status: "settled",
            ownerApprovedBy: "Owner Operations Desk",
            cyclePeriod: "Current Fri-Thu Cycle"
          });
        }
        saveVendorVault(vault);
        return res.json({
          success: true,
          order,
          newBalance: vault.wallet.currentBalance,
          message: `\u0911\u0930\u094D\u0921\u0930 #${order.orderNumber} \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0939\u0941\u0906 \u0914\u0930 \u20B9${order.totalVendorPayout} \u0935\u0947\u0902\u0921\u0930 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0939\u094B \u0917\u092F\u093E!`
        });
      } else {
        order.verificationStatus = "REJECTED";
        order.status = "cancelled";
        order.payoutCreditedToWallet = false;
        order.totalVendorPayout = 0;
        const reasonStr = notes || "\u092D\u094B\u091C\u0928 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E / \u0905\u092E\u093E\u0928\u094D\u092F \u092C\u093F\u0932 \u0938\u092E\u0938\u094D\u092F\u093E (\u092E\u093E\u0932\u093F\u0915 \u0926\u0947\u0935\u0940 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924)";
        order.rejectionReason = reasonStr;
        order.rejectedAt = (/* @__PURE__ */ new Date()).toISOString();
        order.notes = (order.notes ? order.notes + " | " : "") + `\u092E\u093E\u0932\u093F\u0915 (\u0926\u0947\u0935\u0940) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924: ${reasonStr}`;
        saveVendorVault(vault);
        return res.json({
          success: true,
          order,
          message: `\u0911\u0930\u094D\u0921\u0930 #${order.orderNumber} \u0913\u0928\u0930 (\u0926\u0947\u0935\u0940) \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E (\u0935\u0947\u0902\u0921\u0930 \u0915\u094B 0 \u092A\u0947\u0906\u0909\u091F)\u0964`
        });
      }
    } catch (err) {
      console.error("[Order Verify Error]:", err);
      res.status(500).json({ success: false, message: "\u0911\u0930\u094D\u0921\u0930 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0938\u092E\u0938\u094D\u092F\u093E\u0964" });
    }
  });
}
export {
  DEFAULT_DAILY_MENU_CONFIG,
  DEFAULT_INCENTIVE_CONFIG,
  VENDOR_MASTER_RATE_CARD,
  addRateCardItemToCSV,
  calculateVendorWeeklyIncentiveStats,
  deleteRateCardItemFromCSV,
  loadDynamicRateCard,
  pushEventToGoogleSheet,
  registerVendorRoutes,
  saveRateCardToCSV,
  updateRateCardItemInCSV
};
