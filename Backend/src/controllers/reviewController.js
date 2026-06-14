const reviewService = require('../services/reviewService');
const shopService = require('../services/shopService');

async function getForShop(req, res, next) {
  try {
    const shopId = parseInt(req.params.shopId, 10);
    if (!shopId) return res.status(400).json({ error: 'Invalid shop id' });

    const [reviews, stats] = await Promise.all([
      reviewService.getByShopId(shopId),
      reviewService.getStatsForShop(shopId),
    ]);

    res.json({
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      reviews: reviews.map(r => ({
        reviewId: r.review_id,
        reviewerName: r.reviewer_name,
        rating: parseFloat(r.rating),
        comment: r.comment,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { shopId, reviewerName, rating, comment } = req.body;

    // Validate
    if (!shopId || typeof shopId !== 'number') {
      return res.status(400).json({ error: 'shopId is required' });
    }
    if (!reviewerName || !reviewerName.trim()) {
      return res.status(400).json({ error: 'reviewerName is required' });
    }
    if (reviewerName.trim().length > 100) {
      return res.status(400).json({ error: 'reviewerName must be 100 characters or fewer' });
    }
    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: 'rating is required' });
    }
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ error: 'rating must be between 0 and 5' });
    }
    // Only allow half-star increments
    if ((ratingNum * 2) % 1 !== 0) {
      return res.status(400).json({ error: 'rating must be in 0.5 increments' });
    }

    // Check shop exists
    const shop = await shopService.getById(shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const review = await reviewService.create({
      shopId,
      reviewerName,
      rating: ratingNum,
      comment: comment || null,
    });

    res.status(201).json({
      reviewId: review.review_id,
      reviewerName: review.reviewer_name,
      rating: parseFloat(review.rating),
      comment: review.comment,
      createdAt: review.created_at,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getForShop, create };
