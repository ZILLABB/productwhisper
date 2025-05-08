const { searchProducts } = require('./src/services/productSearch');

// Set environment variables for mocking
process.env.USE_MOCK_DB = 'true';
process.env.USE_MOCK_REDIS = 'true';

// Test function
async function testSearch() {
  try {
    console.log('Testing product search with query: "headphones"');
    
    const results = await searchProducts('headphones');
    
    console.log('\nSearch Results:');
    console.log('---------------');
    console.log(`Found ${results.length} products\n`);
    
    results.forEach((product, index) => {
      console.log(`Product ${index + 1}: ${product.name}`);
      console.log(`Sources: ${product.sources.join(', ')}`);
      console.log(`Mentions: ${product.mentions.length}`);
      console.log(`Overall Score: ${product.scores.overall}`);
      console.log(`Confidence: ${product.scores.confidence}`);
      console.log('---');
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSearch();
