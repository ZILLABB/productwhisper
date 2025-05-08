const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('./src/config/jwt');

// Set environment variables
process.env.JWT_SECRET = 'test_secret_key';

// Test function
async function testAuth() {
  try {
    console.log('Testing authentication functionality\n');
    
    // Test password hashing
    console.log('Testing password hashing:');
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log(`Original password: ${password}`);
    console.log(`Hashed password: ${hashedPassword}`);
    
    // Verify password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`Password verification: ${isMatch ? 'Success' : 'Failed'}`);
    
    // Test JWT
    console.log('\nTesting JWT tokens:');
    const userId = 123;
    
    // Generate tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    console.log(`Access token: ${accessToken}`);
    console.log(`Refresh token: ${refreshToken}`);
    
    // Verify tokens
    const decodedAccess = verifyToken(accessToken);
    const decodedRefresh = verifyToken(refreshToken);
    
    console.log(`\nVerified access token: ${JSON.stringify(decodedAccess)}`);
    console.log(`Verified refresh token: ${JSON.stringify(decodedRefresh)}`);
    
    // Test invalid token
    const invalidToken = accessToken + 'invalid';
    const decodedInvalid = verifyToken(invalidToken);
    
    console.log(`\nVerified invalid token: ${decodedInvalid === null ? 'Correctly rejected' : 'Incorrectly accepted'}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();
