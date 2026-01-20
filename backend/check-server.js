/**
 * Quick server health check
 * Run this first to verify your server is running
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function checkServer() {
  console.log('🔍 Checking if server is running...');
  console.log(`   URL: ${BASE_URL}\n`);

  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Server is running and responding!');
      console.log(`   Status: ${response.status}`);
      return true;
    } else {
      console.log('⚠️  Server responded but health check failed');
      console.log(`   Response:`, data);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log(`   Error: ${error.message}\n`);
    console.log('💡 Make sure your server is running:');
    console.log('   1. Open a terminal');
    console.log('   2. cd backend');
    console.log('   3. npm run dev');
    return false;
  }
}

checkServer().catch(console.error);

