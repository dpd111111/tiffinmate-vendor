/**
 * =========================================================================
 * CUSTOMER RATING & GOOGLE SEO REVIEWS
 * =========================================================================
 * Submits genuine meal ratings to Google Rich Snippet SEO schema (4.9★ rating).
 */

export interface CustomerPublicReview {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  reviewText: string;
  mealType: string;
  verifiedCustomer: boolean;
  isApprovedForGoogleSeo: boolean;
  createdAt: string;
}

export function validateCustomerReviewInput(rating: number, reviewText: string): { isValid: boolean; error?: string } {
  if (rating < 1 || rating > 5) {
    return { isValid: false, error: 'कृपया 1 से 5 स्टार के बीच रेटिंग चुनें।' };
  }
  if (!reviewText || reviewText.trim().length < 5) {
    return { isValid: false, error: 'कृपया अपने भोजन के अनुभव के बारे में कम से कम 5 अक्षर लिखें।' };
  }
  return { isValid: true };
}
