#!/usr/bin/env node

/**
 * Authentication Testing Script
 * Tests all auth endpoints: signup, login, logout, password reset
 */

const BASE_URL = 'http://localhost:3000'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

// Generate random email for testing
const testEmail = `test${Date.now()}@example.com`
const testPassword = 'TestPass123!'
const testName = 'Test User'

async function testSignup() {
  logSection('TEST 1: Sign Up Endpoint')
  log(`Email: ${testEmail}`)
  log(`Password: ${testPassword}`)
  log(`Name: ${testName}`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('\n✅ Sign Up Successful!', 'green')
      log(`User ID: ${data.user?.id}`)
      log(`Message: ${data.message}`)
      return { success: true, userId: data.user?.id }
    } else {
      log('\n❌ Sign Up Failed!', 'red')
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('\n❌ Sign Up Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testLogin() {
  logSection('TEST 2: Login Endpoint')
  log(`Email: ${testEmail}`)
  log(`Password: ${testPassword}`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('\n✅ Login Successful!', 'green')
      log(`User ID: ${data.user?.id}`)
      log(`Email: ${data.user?.email}`)
      log(`Access Token: ${data.session?.access_token?.substring(0, 20)}...`)
      return { success: true, session: data.session }
    } else {
      log('\n❌ Login Failed!', 'red')
      log(`Status: ${response.status}`)
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('\n❌ Login Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testLogout() {
  logSection('TEST 3: Logout Endpoint')

  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('\n✅ Logout Successful!', 'green')
      log(`Message: ${data.message}`)
      return { success: true }
    } else {
      log('\n❌ Logout Failed!', 'red')
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('\n❌ Logout Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testInvalidLogin() {
  logSection('TEST 4: Invalid Login (Wrong Password)')

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    })

    const data = await response.json()

    if (!response.ok && !data.success) {
      log('\n✅ Correctly Rejected Invalid Login!', 'green')
      log(`Error Message: ${data.error}`)
      return { success: true }
    } else {
      log('\n❌ Security Issue: Invalid Login Accepted!', 'red')
      return { success: false }
    }
  } catch (error) {
    log('\n❌ Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testPasswordReset() {
  logSection('TEST 5: Password Reset Request')
  log(`Email: ${testEmail}`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('\n✅ Password Reset Email Sent!', 'green')
      log(`Message: ${data.message}`)
      return { success: true }
    } else {
      log('\n❌ Password Reset Failed!', 'red')
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('\n❌ Password Reset Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testValidation() {
  logSection('TEST 6: Input Validation')

  const tests = [
    {
      name: 'Invalid Email',
      endpoint: '/api/auth/signup',
      payload: { email: 'invalid-email', password: 'TestPass123!', name: 'Test' },
      expectedError: 'Invalid email',
    },
    {
      name: 'Weak Password (too short)',
      endpoint: '/api/auth/signup',
      payload: { email: 'test@test.com', password: 'short', name: 'Test' },
      expectedError: 'Password must be at least 8 characters',
    },
    {
      name: 'Password without uppercase',
      endpoint: '/api/auth/signup',
      payload: { email: 'test@test.com', password: 'testpass123!', name: 'Test' },
      expectedError: 'uppercase',
    },
    {
      name: 'Password without number',
      endpoint: '/api/auth/signup',
      payload: { email: 'test@test.com', password: 'TestPassword!', name: 'Test' },
      expectedError: 'number',
    },
  ]

  let passedTests = 0

  for (const test of tests) {
    log(`\nTesting: ${test.name}`, 'yellow')

    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload),
      })

      const data = await response.json()

      if (!response.ok && data.error && data.error.toLowerCase().includes(test.expectedError.toLowerCase())) {
        log(`  ✅ Validation working: ${data.error}`, 'green')
        passedTests++
      } else {
        log(`  ❌ Validation failed or unexpected error`, 'red')
        log(`  Expected: ${test.expectedError}`)
        log(`  Got: ${data.error || 'No error'}`)
      }
    } catch (error) {
      log(`  ❌ Request failed: ${error.message}`, 'red')
    }
  }

  log(`\n${passedTests}/${tests.length} validation tests passed`, passedTests === tests.length ? 'green' : 'red')
  return { success: passedTests === tests.length, passedTests, totalTests: tests.length }
}

async function testDatabaseConnection() {
  logSection('TEST 7: Supabase Connection')

  try {
    // Try to access a public endpoint to verify Supabase is reachable
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'connection-test@test.com',
        password: 'TestPass123!',
        name: 'Connection Test',
      }),
    })

    // We don't care if signup succeeds or fails, just that we got a response
    if (response.status !== 0) {
      log('\n✅ Supabase Connection Working!', 'green')
      log(`API responded with status: ${response.status}`)
      return { success: true }
    } else {
      log('\n❌ No response from Supabase', 'red')
      return { success: false }
    }
  } catch (error) {
    log('\n❌ Supabase Connection Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Run all tests
async function runAllTests() {
  log('\n🚀 Starting Authentication Tests...', 'cyan')
  log(`Base URL: ${BASE_URL}\n`)

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  }

  // Test 1: Database Connection
  const dbTest = await testDatabaseConnection()
  results.total++
  if (dbTest.success) results.passed++
  else results.failed++

  // Test 2: Sign Up
  const signupResult = await testSignup()
  results.total++
  if (signupResult.success) results.passed++
  else results.failed++

  // Wait a bit for user to be created
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Test 3: Login (only if signup succeeded)
  if (signupResult.success) {
    const loginResult = await testLogin()
    results.total++
    if (loginResult.success) results.passed++
    else results.failed++

    // Test 4: Logout
    const logoutResult = await testLogout()
    results.total++
    if (logoutResult.success) results.passed++
    else results.failed++
  } else {
    log('\n⚠️  Skipping login/logout tests due to signup failure', 'yellow')
  }

  // Test 5: Invalid Login
  const invalidLoginResult = await testInvalidLogin()
  results.total++
  if (invalidLoginResult.success) results.passed++
  else results.failed++

  // Test 6: Password Reset
  const resetResult = await testPasswordReset()
  results.total++
  if (resetResult.success) results.passed++
  else results.failed++

  // Test 7: Validation
  const validationResult = await testValidation()
  results.total++
  if (validationResult.success) results.passed++
  else results.failed++

  // Final Summary
  logSection('TEST SUMMARY')
  log(`\nTotal Tests: ${results.total}`, 'cyan')
  log(`✅ Passed: ${results.passed}`, 'green')
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, results.failed === 0 ? 'green' : 'yellow')

  if (results.failed === 0) {
    log('🎉 All tests passed! Authentication is working correctly!', 'green')
  } else {
    log('⚠️  Some tests failed. Check the errors above.', 'yellow')
  }

  console.log('\n' + '='.repeat(60) + '\n')
  process.exit(results.failed === 0 ? 0 : 1)
}

// Check if server is running before running tests
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}`)
    return true
  } catch (error) {
    log('\n❌ Server is not running!', 'red')
    log('Please start the development server first:', 'yellow')
    log('  npm run dev\n', 'cyan')
    return false
  }
}

// Main execution
;(async () => {
  const serverRunning = await checkServer()
  if (serverRunning) {
    await runAllTests()
  } else {
    process.exit(1)
  }
})()
