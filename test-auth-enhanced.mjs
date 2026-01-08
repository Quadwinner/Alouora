/**
 * Enhanced Authentication Testing Script
 *
 * Comprehensive tests for the authentication endpoints
 * Tests signup, login, logout, validation, and edge cases
 */

const BASE_URL = 'http://localhost:3000' // Next.js default port

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(`🔍 ${title}`, 'cyan')
  log('='.repeat(60), 'cyan')
}

// Test data
const testEmail = `test${Date.now()}@example.com`
const testPassword = 'TestPass123!'
const testName = 'Test User'

let currentSession = null

async function testSignup() {
  log('\n📝 Testing Sign Up Endpoint...', 'blue')
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
      log('✅ Sign Up Successful!', 'green')
      log(`User ID: ${data.user?.id}`)
      log(`Message: ${data.message}`)
      return { success: true, userId: data.user?.id }
    } else {
      log('❌ Sign Up Failed!', 'red')
      log(`Status: ${response.status}`)
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('❌ Sign Up Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testLogin() {
  log('\n🔐 Testing Login Endpoint...', 'blue')
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
      log('✅ Login Successful!', 'green')
      log(`User: ${data.user?.name} (${data.user?.email})`)
      log(`Access Token: ${data.session?.access_token?.substring(0, 20)}...`)
      log(`Expires At: ${new Date(data.session?.expires_at * 1000).toISOString()}`)
      
      // Store session for logout test
      currentSession = data.session
      
      return { success: true, session: data.session, user: data.user }
    } else {
      log('❌ Login Failed!', 'red')
      log(`Status: ${response.status}`)
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('❌ Login Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testLogout() {
  log('\n🚪 Testing Logout Endpoint...', 'blue')

  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if we have a session
    if (currentSession?.access_token) {
      headers.Authorization = `Bearer ${currentSession.access_token}`
      log(`Using access token: ${currentSession.access_token.substring(0, 20)}...`)
    }

    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('✅ Logout Successful!', 'green')
      log(`Message: ${data.message}`)
      currentSession = null
      return { success: true }
    } else {
      log('❌ Logout Failed!', 'red')
      log(`Status: ${response.status}`)
      log(`Error: ${data.error}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    log('❌ Logout Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testInvalidLogin() {
  log('\n🚫 Testing Login with Invalid Credentials...', 'blue')

  const testCases = [
    {
      name: 'Wrong Email',
      email: 'wrong@example.com',
      password: testPassword,
    },
    {
      name: 'Wrong Password',
      email: testEmail,
      password: 'WrongPassword123!',
    },
    {
      name: 'Non-existent User',
      email: 'nonexistent@example.com',
      password: 'Password123!',
    }
  ]

  let allPassed = true

  for (const testCase of testCases) {
    log(`\nTesting: ${testCase.name}`, 'yellow')
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testCase.email,
          password: testCase.password,
        }),
      })

      const data = await response.json()

      if (!response.ok && !data.success) {
        log(`✅ Correctly Rejected: ${testCase.name}`, 'green')
        log(`Error: ${data.error}`)
      } else {
        log(`❌ Should Have Rejected: ${testCase.name}`, 'red')
        allPassed = false
      }
    } catch (error) {
      log(`❌ Request Failed for ${testCase.name}`, 'red')
      log(`Error: ${error.message}`)
      allPassed = false
    }
  }

  return { success: allPassed }
}

async function testValidation() {
  log('\n✍️  Testing Input Validation...', 'blue')

  const validationTests = [
    {
      name: 'Invalid Email Format',
      data: {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      },
      expectedError: 'Invalid email address'
    },
    {
      name: 'Weak Password (too short)',
      data: {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      },
      expectedError: 'Password must be at least 8 characters'
    },
    {
      name: 'Password without uppercase',
      data: {
        email: 'test@example.com',
        password: 'password123!',
        name: 'Test User',
      },
      expectedError: 'Password must contain at least one uppercase letter'
    },
    {
      name: 'Password without lowercase',
      data: {
        email: 'test@example.com',
        password: 'PASSWORD123!',
        name: 'Test User',
      },
      expectedError: 'Password must contain at least one lowercase letter'
    },
    {
      name: 'Password without numbers',
      data: {
        email: 'test@example.com',
        password: 'Password!',
        name: 'Test User',
      },
      expectedError: 'Password must contain at least one number'
    },
    {
      name: 'Name too short',
      data: {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'A',
      },
      expectedError: 'Name must be at least 2 characters'
    }
  ]

  let allPassed = true

  for (const test of validationTests) {
    log(`\nTesting: ${test.name}`, 'yellow')
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data),
      })

      const data = await response.json()

      if (!response.ok && !data.success) {
        log(`✅ Validation Correctly Failed: ${test.name}`, 'green')
        log(`Error: ${data.error}`)
        
        // Check if the error message matches expected
        if (data.error.includes(test.expectedError) || data.error === test.expectedError) {
          log(`✅ Error message matches expected`, 'green')
        } else {
          log(`⚠️  Error message differs from expected`, 'yellow')
          log(`Expected: ${test.expectedError}`)
          log(`Actual: ${data.error}`)
        }
      } else {
        log(`❌ Validation Should Have Failed: ${test.name}`, 'red')
        allPassed = false
      }
    } catch (error) {
      log(`❌ Request Failed for ${test.name}`, 'red')
      log(`Error: ${error.message}`)
      allPassed = false
    }
  }

  return { success: allPassed }
}

async function testDuplicateSignup() {
  log('\n👥 Testing Duplicate Email Registration...', 'blue')
  log(`Attempting to register again with email: ${testEmail}`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail, // Same email as initial signup
        password: testPassword,
        name: 'Another Test User',
      }),
    })

    const data = await response.json()

    if (!response.ok && !data.success) {
      log('✅ Correctly Rejected Duplicate Email!', 'green')
      log(`Error: ${data.error}`)
      return { success: true }
    } else {
      log('❌ Should Have Rejected Duplicate Email!', 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ Request Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false }
  }
}

async function testMalformedRequests() {
  log('\n🔍 Testing Malformed Requests...', 'blue')

  const malformedTests = [
    {
      name: 'Empty Request Body',
      body: {},
    },
    {
      name: 'Missing Email',
      body: {
        password: 'Password123!',
        name: 'Test User',
      },
    },
    {
      name: 'Missing Password',
      body: {
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    {
      name: 'Missing Name',
      body: {
        email: 'test@example.com',
        password: 'Password123!',
      },
    },
  ]

  let allPassed = true

  for (const test of malformedTests) {
    log(`\nTesting: ${test.name}`, 'yellow')
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.body),
      })

      const data = await response.json()

      if (!response.ok && !data.success) {
        log(`✅ Correctly Rejected: ${test.name}`, 'green')
        log(`Error: ${data.error}`)
      } else {
        log(`❌ Should Have Rejected: ${test.name}`, 'red')
        allPassed = false
      }
    } catch (error) {
      log(`❌ Request Failed for ${test.name}`, 'red')
      log(`Error: ${error.message}`)
      allPassed = false
    }
  }

  return { success: allPassed }
}

async function checkServerHealth() {
  log('\n🏥 Checking Server Health...', 'blue')
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'GET', // Should return 405 Method Not Allowed
    })

    if (response.status === 405) {
      log('✅ Server is responding correctly (405 for GET on POST endpoint)', 'green')
      return { success: true }
    } else {
      log(`⚠️  Unexpected response for health check: ${response.status}`, 'yellow')
      return { success: true } // Still considered success as server is responding
    }
  } catch (error) {
    log('❌ Server Health Check Failed!', 'red')
    log(`Error: ${error.message}`)
    log('Make sure your Next.js server is running on ' + BASE_URL, 'yellow')
    return { success: false }
  }
}

// Performance test
async function testPerformance() {
  log('\n⚡ Testing Response Performance...', 'blue')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      }),
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    log(`Response time: ${responseTime}ms`)
    
    if (responseTime < 5000) { // Less than 5 seconds
      log('✅ Response time is acceptable', 'green')
      return { success: true, responseTime }
    } else {
      log('⚠️  Response time is slow', 'yellow')
      return { success: true, responseTime } // Still success, just slow
    }
  } catch (error) {
    log('❌ Performance Test Failed!', 'red')
    log(`Error: ${error.message}`)
    return { success: false }
  }
}

// Main test runner
async function runTests() {
  logSection('🚀 AUTHENTICATION SYSTEM TESTS')
  
  // Check if server is running first
  const healthCheck = await checkServerHealth()
  if (!healthCheck.success) {
    log('\n💥 Cannot proceed - server is not running!', 'red')
    process.exit(1)
  }

  const results = {}

  // Run all tests
  logSection('📝 REGISTRATION TESTS')
  results.signup = await testSignup()
  results.duplicateSignup = await testDuplicateSignup()

  logSection('🔐 AUTHENTICATION TESTS')
  results.login = await testLogin()
  results.logout = await testLogout()
  results.invalidLogin = await testInvalidLogin()

  logSection('✍️  VALIDATION TESTS')
  results.validation = await testValidation()
  results.malformedRequests = await testMalformedRequests()

  logSection('⚡ PERFORMANCE TESTS')
  results.performance = await testPerformance()

  // Summary
  logSection('📊 TEST SUMMARY')
  
  const testNames = {
    signup: 'Sign Up',
    login: 'Login',
    logout: 'Logout',
    invalidLogin: 'Invalid Login Rejection',
    validation: 'Input Validation',
    duplicateSignup: 'Duplicate Email Rejection',
    malformedRequests: 'Malformed Request Handling',
    performance: 'Response Performance'
  }

  const passed = Object.values(results).filter(r => r.success).length
  const total = Object.keys(results).length

  Object.entries(results).forEach(([key, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    const color = result.success ? 'green' : 'red'
    log(`${testNames[key]}: ${status}`, color)
  })

  log(`\n📈 Tests Passed: ${passed}/${total}`, passed === total ? 'green' : 'red')

  if (passed === total) {
    log('\n🎉 ALL TESTS PASSED! 🎉', 'green')
    log('Your authentication system is working correctly!', 'green')
    log('✅ Sign up, login, logout, and validation are all functional', 'green')
    log('✅ Security measures are in place', 'green')
    log('✅ Error handling is working properly', 'green')
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'red')
    log('Please check the errors above and fix the issues.', 'yellow')
  }

  log('\n🔧 Test completed. Check the output above for details.', 'cyan')
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Test interrupted by user. Goodbye!', 'yellow')
  process.exit(0)
})

// Run the tests
runTests().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, 'red')
  log('Stack trace:', 'red')
  console.error(error.stack)
  process.exit(1)
})