const { pool } = require("../config/db");
const { redisClient } = require("../config/redis");
const { analyzeText, batchAnalyze } = require("./sentimentAnalysis");
const { cacheService, CacheTTL, CachePrefix } = require("./cacheService");

/**
 * Search for products across multiple platforms
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Search results
 */
const searchProducts = async (query, filters = {}) => {
  try {
    // Generate cache key
    const cacheKey = `${CachePrefix.SEARCH}${query}:${JSON.stringify(filters)}`;

    // Use enhanced caching with getOrSet
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Search across multiple platforms in parallel
        const [redditResults, amazonResults, youtubeResults] =
          await Promise.all([
            searchReddit(query),
            searchAmazon(query),
            searchYoutube(query),
          ]);

        // Combine and deduplicate results
        const combinedResults = combineResults(
          redditResults,
          amazonResults,
          youtubeResults
        );

        // Process sentiment for new mentions
        await processSentiment(combinedResults);

        // Calculate scores
        const scoredProducts = await calculateProductScores(combinedResults);

        // Apply filters
        return applyFilters(scoredProducts, filters);
      },
      CacheTTL.LONG // Cache for 1 hour
    );
  } catch (error) {
    console.error("Product search error:", error.message);
    throw error;
  }
};

/**
 * Search Reddit for product discussions
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Reddit search results
 */
const searchReddit = async (query) => {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_EXTERNAL_APIS === "true") {
      console.log("Using mock Reddit data for:", query);

      // Mock data for development
      return [
        {
          source: "reddit",
          source_id: "abc123",
          product_name: `${query} Pro`,
          content: `I really love my ${query} Pro. It's the best purchase I've made this year!`,
          url: "https://reddit.com/r/product_reviews/comments/abc123",
          created_at: new Date(),
        },
        {
          source: "reddit",
          source_id: "def456",
          product_name: `${query} Ultra`,
          content: `The ${query} Ultra is overpriced and doesn't work as advertised. Save your money.`,
          url: "https://reddit.com/r/product_reviews/comments/def456",
          created_at: new Date(),
        },
      ];
    }

    // Use real Reddit API
    const { redditService } = require("./external");
    return await redditService.searchProducts(query);
  } catch (error) {
    console.error("Error searching Reddit:", error);
    return [];
  }
};

/**
 * Search Amazon for product reviews
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Amazon search results
 */
const searchAmazon = async (query) => {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_EXTERNAL_APIS === "true") {
      console.log("Using mock Amazon data for:", query);

      // Mock data for development
      return [
        {
          source: "amazon",
          source_id: "amzn123",
          product_name: `${query} Pro`,
          description: `The latest ${query} Pro with advanced features`,
          image_url: "https://example.com/image.jpg",
          price: 99.99,
          reviews: [
            {
              content: `This ${query} Pro is amazing! Great battery life and performance.`,
              rating: 5,
              created_at: new Date(),
            },
            {
              content: `Decent ${query} Pro but a bit expensive for what you get.`,
              rating: 3,
              created_at: new Date(),
            },
          ],
          url: "https://amazon.com/dp/amzn123",
          created_at: new Date(),
        },
      ];
    }

    // Use real Amazon API
    const { amazonService } = require("./external");
    return await amazonService.searchProducts(query);
  } catch (error) {
    console.error("Error searching Amazon:", error);
    return [];
  }
};

/**
 * Search YouTube for product reviews
 * @param {string} query - Search query
 * @returns {Promise<Array>} - YouTube search results
 */
const searchYoutube = async (query) => {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_EXTERNAL_APIS === "true") {
      console.log("Using mock YouTube data for:", query);

      // Mock data for development
      return [
        {
          source: "youtube",
          source_id: "yt123",
          product_name: `${query} Pro`,
          content: `${query} Pro Review: Worth the Money?`,
          description: `In this video, I review the ${query} Pro and share my honest thoughts after using it for a month.`,
          url: "https://youtube.com/watch?v=yt123",
          created_at: new Date(),
        },
      ];
    }

    // Use real YouTube API
    const { youtubeService } = require("./external");
    return await youtubeService.searchProducts(query);
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
};

/**
 * Combine results from different sources and deduplicate
 * @param {Array} redditResults - Results from Reddit
 * @param {Array} amazonResults - Results from Amazon
 * @param {Array} youtubeResults - Results from YouTube
 * @returns {Array} - Combined results
 */
const combineResults = (redditResults, amazonResults, youtubeResults) => {
  // This is a simplified implementation
  // In a real app, you would need more sophisticated deduplication

  // Extract products from all sources
  const products = new Map();

  // Process Amazon results (they have the most complete product info)
  for (const result of amazonResults) {
    products.set(result.product_name.toLowerCase(), {
      name: result.product_name,
      description: result.description,
      image_url: result.image_url,
      sources: ["amazon"],
      mentions: [
        ...(result.reviews || []).map((review) => ({
          source: "amazon",
          source_id: `${result.source_id}_${Math.random()
            .toString(36)
            .substring(7)}`,
          content: review.content,
          url: result.url,
          created_at: review.created_at,
        })),
      ],
    });
  }

  // Add Reddit results
  for (const result of redditResults) {
    const key = result.product_name.toLowerCase();
    if (products.has(key)) {
      // Product already exists, add this mention
      const product = products.get(key);
      if (!product.sources.includes("reddit")) {
        product.sources.push("reddit");
      }
      product.mentions.push({
        source: "reddit",
        source_id: result.source_id,
        content: result.content,
        url: result.url,
        created_at: result.created_at,
      });
    } else {
      // New product
      products.set(key, {
        name: result.product_name,
        description: "",
        image_url: "",
        sources: ["reddit"],
        mentions: [
          {
            source: "reddit",
            source_id: result.source_id,
            content: result.content,
            url: result.url,
            created_at: result.created_at,
          },
        ],
      });
    }
  }

  // Add YouTube results
  for (const result of youtubeResults) {
    const key = result.product_name.toLowerCase();
    if (products.has(key)) {
      // Product already exists, add this mention
      const product = products.get(key);
      if (!product.sources.includes("youtube")) {
        product.sources.push("youtube");
      }
      product.mentions.push({
        source: "youtube",
        source_id: result.source_id,
        content: result.content,
        url: result.url,
        created_at: result.created_at,
      });
    } else {
      // New product
      products.set(key, {
        name: result.product_name,
        description: result.description || "",
        image_url: "",
        sources: ["youtube"],
        mentions: [
          {
            source: "youtube",
            source_id: result.source_id,
            content: result.content,
            url: result.url,
            created_at: result.created_at,
          },
        ],
      });
    }
  }

  return Array.from(products.values());
};

/**
 * Process sentiment for product mentions
 * @param {Array} products - Products with mentions
 * @returns {Promise<void>}
 */
const processSentiment = async (products) => {
  for (const product of products) {
    const textsToAnalyze = product.mentions.map((mention) => mention.content);
    const sentimentResults = await batchAnalyze(textsToAnalyze);

    // Attach sentiment scores to mentions
    for (let i = 0; i < product.mentions.length; i++) {
      product.mentions[i].sentiment_score = sentimentResults[i].score;
    }
  }
};

/**
 * Calculate overall scores for products based on sentiment analysis
 * @param {Array} products - Products with sentiment-analyzed mentions
 * @returns {Promise<Array>} - Products with scores
 */
const calculateProductScores = async (products) => {
  return products.map((product) => {
    // Group mentions by source
    const redditMentions = product.mentions.filter(
      (m) => m.source === "reddit"
    );
    const amazonMentions = product.mentions.filter(
      (m) => m.source === "amazon"
    );
    const youtubeMentions = product.mentions.filter(
      (m) => m.source === "youtube"
    );

    // Calculate source-specific scores
    const redditScore = calculateAverageScore(redditMentions);
    const amazonScore = calculateAverageScore(amazonMentions);
    const youtubeScore = calculateAverageScore(youtubeMentions);

    // Calculate overall score (weighted average)
    const weights = {
      reddit: 0.3,
      amazon: 0.5,
      youtube: 0.2,
    };

    let overallScore = 0;
    let totalWeight = 0;

    if (redditMentions.length > 0) {
      overallScore += redditScore * weights.reddit;
      totalWeight += weights.reddit;
    }

    if (amazonMentions.length > 0) {
      overallScore += amazonScore * weights.amazon;
      totalWeight += weights.amazon;
    }

    if (youtubeMentions.length > 0) {
      overallScore += youtubeScore * weights.youtube;
      totalWeight += weights.youtube;
    }

    // Normalize score
    overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

    // Calculate confidence score based on sample size
    const totalMentions = product.mentions.length;
    const confidenceScore = Math.min(totalMentions / 10, 1); // Max confidence at 10+ mentions

    return {
      ...product,
      scores: {
        overall: parseFloat(overallScore.toFixed(2)),
        reddit: parseFloat(redditScore.toFixed(2)),
        amazon: parseFloat(amazonScore.toFixed(2)),
        youtube: parseFloat(youtubeScore.toFixed(2)),
        confidence: parseFloat(confidenceScore.toFixed(2)),
        sample_size: totalMentions,
      },
    };
  });
};

/**
 * Calculate average sentiment score for a set of mentions
 * @param {Array} mentions - Product mentions
 * @returns {number} - Average score
 */
const calculateAverageScore = (mentions) => {
  if (mentions.length === 0) return 0;

  const sum = mentions.reduce((total, mention) => {
    return total + (mention.sentiment_score || 0);
  }, 0);

  return sum / mentions.length;
};

/**
 * Apply filters to search results
 * @param {Array} products - Products with scores
 * @param {Object} filters - Filters to apply
 * @returns {Array} - Filtered products
 */
const applyFilters = (products, filters = {}) => {
  let filteredProducts = [...products];

  // Filter by minimum score
  if (filters.minScore) {
    filteredProducts = filteredProducts.filter(
      (product) => product.scores.overall >= filters.minScore
    );
  }

  // Filter by source
  if (filters.sources && filters.sources.length > 0) {
    filteredProducts = filteredProducts.filter((product) => {
      return filters.sources.some((source) => product.sources.includes(source));
    });
  }

  // Filter by minimum confidence
  if (filters.minConfidence) {
    filteredProducts = filteredProducts.filter(
      (product) => product.scores.confidence >= filters.minConfidence
    );
  }

  // Sort results
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "score":
        filteredProducts.sort((a, b) => b.scores.overall - a.scores.overall);
        break;
      case "confidence":
        filteredProducts.sort(
          (a, b) => b.scores.confidence - a.scores.confidence
        );
        break;
      case "mentions":
        filteredProducts.sort(
          (a, b) => b.scores.sample_size - a.scores.sample_size
        );
        break;
      default:
        // Default sort by overall score
        filteredProducts.sort((a, b) => b.scores.overall - a.scores.overall);
    }
  } else {
    // Default sort by overall score
    filteredProducts.sort((a, b) => b.scores.overall - a.scores.overall);
  }

  return filteredProducts;
};

module.exports = {
  searchProducts,
  searchReddit,
  searchAmazon,
  searchYoutube,
};
