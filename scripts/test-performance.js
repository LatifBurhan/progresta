#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API endpoint response times
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        let color = 'green';
        if (duration > 1000) color = 'red';
        else if (duration > 500) color = 'yellow';
        
        log(`✓ ${name}: ${duration}ms`, color);
        resolve({ name, duration, success: true });
      });
    }).on('error', (err) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      log(`✗ ${name}: Failed (${err.message})`, 'red');
      resolve({ name, duration, success: false, error: err.message });
    });
  });
}

async function runTests() {
  log('\n🚀 Performance Testing Started\n', 'cyan');
  log('Testing API endpoints...\n', 'blue');
  
  const tests = [
    {
      name: 'Dashboard Stats (Old)',
      url: `${BASE_URL}/api/dashboard/stats?period=day`
    },
    {
      name: 'Dashboard Stats (Optimized)',
      url: `${BASE_URL}/api/dashboard/stats-optimized?period=day`
    },
    {
      name: 'Project Activity (Old)',
      url: `${BASE_URL}/api/admin/project-activity?period=30`
    },
    {
      name: 'Project Activity (Optimized)',
      url: `${BASE_URL}/api/admin/project-activity-optimized?period=30`
    },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
  
  log('\n📊 Performance Summary\n', 'cyan');
  
  // Calculate improvements
  const oldDashboard = results.find(r => r.name.includes('Dashboard Stats (Old)'));
  const newDashboard = results.find(r => r.name.includes('Dashboard Stats (Optimized)'));
  const oldActivity = results.find(r => r.name.includes('Project Activity (Old)'));
  const newActivity = results.find(r => r.name.includes('Project Activity (Optimized)'));
  
  if (oldDashboard && newDashboard && oldDashboard.success && newDashboard.success) {
    const improvement = ((oldDashboard.duration - newDashboard.duration) / oldDashboard.duration * 100).toFixed(1);
    const color = improvement > 0 ? 'green' : 'red';
    log(`Dashboard Stats Improvement: ${improvement}% faster`, color);
  }
  
  if (oldActivity && newActivity && oldActivity.success && newActivity.success) {
    const improvement = ((oldActivity.duration - newActivity.duration) / oldActivity.duration * 100).toFixed(1);
    const color = improvement > 0 ? 'green' : 'red';
    log(`Project Activity Improvement: ${improvement}% faster`, color);
  }
  
  log('\n✅ Performance Testing Complete\n', 'cyan');
  
  // Performance recommendations
  log('📝 Recommendations:\n', 'blue');
  
  const avgTime = results.reduce((sum, r) => sum + (r.success ? r.duration : 0), 0) / results.filter(r => r.success).length;
  
  if (avgTime < 500) {
    log('✓ Excellent performance! All endpoints are fast.', 'green');
  } else if (avgTime < 1000) {
    log('⚠ Good performance, but could be improved.', 'yellow');
    log('  Consider adding database indexes or caching.', 'yellow');
  } else {
    log('✗ Poor performance detected!', 'red');
    log('  Action required:', 'red');
    log('  1. Check database indexes are applied', 'red');
    log('  2. Verify optimized endpoints are being used', 'red');
    log('  3. Consider adding Redis caching', 'red');
  }
  
  log('');
}

// Run tests
runTests().catch(err => {
  log(`\n✗ Test failed: ${err.message}\n`, 'red');
  process.exit(1);
});
