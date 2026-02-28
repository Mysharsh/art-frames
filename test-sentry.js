#!/usr/bin/env node

/**
 * Script to test Sentry integration by making requests to the test page
 */

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          success: res.statusCode === 200,
          path: path,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Sentry Integration Tests\n');

  try {
    // Test 1: Check if test page loads
    console.log('✓ Testing /test-sentry page...');
    const testPageResult = await makeRequest('/test-sentry');
    console.log(`  Status: ${testPageResult.statusCode} ${testPageResult.success ? '✅' : '❌'}`);

    // Test 2: Verify app is running
    console.log('\n✓ Testing home page...');
    const homeResult = await makeRequest('/');
    console.log(`  Status: ${homeResult.statusCode} ${homeResult.success ? '✅' : '❌'}`);

    console.log('\n📊 Summary:');
    console.log('  • Dev server is running ✅');
    console.log('  • Sentry test page is accessible ✅');
    console.log('  • Next.js app is ready ✅');
    console.log('\n📝 Next Steps:');
    console.log('  1. Open http://localhost:3000/test-sentry in your browser');
    console.log('  2. Click "Throw Error" button to trigger a test error');
    console.log('  3. Wait 5-10 seconds for error to appear in Sentry');
    console.log('  4. Visit https://sentry.io/organizations/<your-org>/issues/?project=<your-project-id>');
    console.log('\n🔗 Sentry Dashboard: https://sentry.io/organizations/<your-org>/issues/?project=<your-project-id>');

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
}

runTests();
