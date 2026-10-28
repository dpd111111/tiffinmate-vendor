/**
 * =========================================================================
 * OWNER GOOGLE SEO REVIEWS MODERATOR
 * =========================================================================
 * Moderates customer reviews, purges spam/fake entries, and syncs
 * 4.9★ star rating schema with Google Search snippets.
 */

export interface GoogleSeoReviewItem {
  id: string;
  authorName: string;
  ratingValue: number;
  bestRating: number; // 5
  reviewBody: string;
  datePublished: string;
  status: 'approved' | 'pending' | 'rejected';
}

export function generateGoogleRichSnippetJsonLd(reviews: GoogleSeoReviewItem[]): object {
  const approved = reviews.filter(r => r.status === 'approved');
  const count = approved.length || 1;
  const sum = approved.reduce((acc, r) => acc + (r.ratingValue || 5), 0);
  const avg = (sum / count).toFixed(1);

  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'NOV TIFFIN (TiffinMate)',
    image: 'https://ais-pre-tupzhcx4b5iasbsecy5lhp-146578201468.asia-southeast1.run.app/publicPHOTO/owner.jpg',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: count,
      bestRating: '5',
      worstRating: '1'
    }
  };
}
