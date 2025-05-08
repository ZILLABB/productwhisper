const axios = require("axios");
require("dotenv").config();

const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL || "http://localhost:5000";

/**
 * Analyze sentiment of a single text
 * @param {string} text - The text to analyze
 * @param {string} productName - Optional product name for entity recognition
 * @returns {Promise<Object>} - Sentiment analysis result
 */
const analyzeText = async (text, productName = null) => {
  try {
    if (!text || typeof text !== "string") {
      return {
        score: 0,
        details: { compound: 0, neg: 0, neu: 1, pos: 0 },
        entities: [],
        aspects: [],
      };
    }

    const response = await axios.post(`${SENTIMENT_API_URL}/analyze`, {
      text,
      product_name: productName,
    });

    // Transform response to include entities and aspects
    const result = response.data;

    // Add a simplified score property for backward compatibility
    if (!result.score && result.sentiment) {
      result.score = result.sentiment.compound;
    }

    return result;
  } catch (error) {
    console.error("Sentiment analysis error:", error.message);
    // Return neutral sentiment if service is unavailable
    return {
      score: 0,
      details: { compound: 0, neg: 0, neu: 1, pos: 0 },
      entities: [],
      aspects: [],
      error: error.message,
    };
  }
};

/**
 * Analyze sentiment of multiple texts in batch
 * @param {string[]} texts - Array of texts to analyze
 * @param {string[]} productNames - Optional array of product names for entity recognition
 * @returns {Promise<Object[]>} - Array of sentiment analysis results
 */
const batchAnalyze = async (texts, productNames = null) => {
  try {
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    // If there are too many texts, process in smaller batches
    if (texts.length > 100) {
      return processBatchesSequentially(texts, productNames);
    }

    const response = await axios.post(`${SENTIMENT_API_URL}/batch-analyze`, {
      texts,
      product_names: productNames,
    });

    // Transform response to include entities and aspects
    const results = response.data.results.map((result) => {
      // Add a simplified score property for backward compatibility
      if (!result.score && result.sentiment) {
        result.score = result.sentiment.compound;
      }
      return result;
    });

    return results;
  } catch (error) {
    console.error("Batch sentiment analysis error:", error.message);
    // Return neutral sentiments if service is unavailable
    return texts.map(() => ({
      score: 0,
      details: { compound: 0, neg: 0, neu: 1, pos: 0 },
      entities: [],
      aspects: [],
      error: error.message,
    }));
  }
};

/**
 * Process large batches of texts sequentially
 * @param {string[]} texts - Array of texts to analyze
 * @param {string[]} productNames - Optional array of product names for entity recognition
 * @returns {Promise<Object[]>} - Array of sentiment analysis results
 */
const processBatchesSequentially = async (texts, productNames = null) => {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchProductNames = productNames
      ? productNames.slice(i, i + batchSize)
      : null;

    try {
      const response = await axios.post(`${SENTIMENT_API_URL}/batch-analyze`, {
        texts: batch,
        product_names: batchProductNames,
      });

      // Transform response to include entities and aspects
      const batchResults = response.data.results.map((result) => {
        // Add a simplified score property for backward compatibility
        if (!result.score && result.sentiment) {
          result.score = result.sentiment.compound;
        }
        return result;
      });

      results.push(...batchResults);
    } catch (error) {
      console.error(
        `Error processing batch ${i}-${i + batch.length}:`,
        error.message
      );
      // Add neutral sentiments for failed batch
      const neutralResults = batch.map(() => ({
        score: 0,
        details: { compound: 0, neg: 0, neu: 1, pos: 0 },
        entities: [],
        aspects: [],
        error: error.message,
      }));
      results.push(...neutralResults);
    }
  }

  return results;
};

module.exports = {
  analyzeText,
  batchAnalyze,
};
