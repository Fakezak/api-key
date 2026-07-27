// test.js
const APIKeyGenerator = require('./index.js');

const generator = new APIKeyGenerator();

// Generate keys
const apiKey = generator.generateApiKey(32);
const secretKey = generator.generateSecretKey(40);

console.log('API Key:', apiKey);
console.log('Secret Key:', secretKey);

// Validate
console.log('Valid API Key:', generator.validateKey(apiKey, 'api'));
console.log('Valid Secret Key:', generator.validateKey(secretKey, 'secret'));
