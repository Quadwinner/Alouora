#!/usr/bin/env node

/**
 * Basic Auth Endpoint Test
 * Tests if auth routes are accessible and returning responses
 */

const BASE_URL = 'http://localhost:3000'

console.log('🔍 Testing Auth Backend Endpoints...\n')

// Simple test function with timeout
async function testEndpoint(url, data, description) {
  console.log(`Testing: ${description}`)
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    console.log(`✅ Status: ${response.status}`)
    
    try {
      const responseData = await response.json()
      console.log(`   Response: ${JSON.stringify(responseData).substring(0, 100)}...`)
      return { success: true, status: response.status, data: responseData }
    } catch (jsonError) {
      console.log(`   Response: [Non-JSON response]`)
      return { success: true, status: response.status, data: null }
    }
    
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      console.log('❌ Timeout: Endpoint took too long to respond')
    } else {
      console.log(`❌ Error: ${error.message}`)
    }
    return { success: false, error: error.message }
  }
}

async function runBasicTests() {
  console.log('1. Testing Signup Endpoint')
  console.log('─'.repeat(40))
  
  const signupResult = await testEndpoint(
    `${BASE_URL}/api/auth/signup`,
    { email: 'invalid' },
    'Invalid email validation'
  )
  
  console.log('\n2. Testing Login Endpoint')
  console.log('─'.repeat(40))
  
  const loginResult = await testEndpoint(
    `${BASE_URL}/api/auth/login`,
    { email: 'test@example.com' },
    'Missing password validation'
  )
  
  console.log('\n3. Testing Logout Endpoint')
  console.log('─'.repeat(40))
  
  const logoutResult = await testEndpoint(
    `${BASE_URL}/api/auth/logout`,
    {},
    'Logout endpoint'
  )
  
  console.log('\n📊 Summary')
  console.log('═'.repeat(50))
  
  const allEndpoints = [
    { name: 'Signup', result: signupResult },
    { name: 'Login', result: loginResult },
    { name: 'Logout', result: logoutResult }
  ]
  
  const workingEndpoints = allEndpoints.filter(ep => ep.result.success)
  
  console.log(`Working Endpoints: ${workingEndpoints.length}/3`)
  
  allEndpoints.forEach(({ name, result }) => {
    const status = result.success ? '✅ Working' : '❌ Failed'
    console.log(`${name}: ${status}`)
  })
  
  if (workingEndpoints.length === 3) {
    console.log('\n🎉 All auth endpoints are responding!')
    console.log('Your auth backend basic structure is working.')
    console.log('\n💡 Next steps:')
    console.log('   1. Check Supabase configuration in .env.local')
    console.log('   2. Test with valid credentials')
    console.log('   3. Check database connection')
  } else {
    console.log('\n⚠️  Some endpoints are not responding properly.')
    console.log('Check your Next.js server and middleware configuration.')
  }
}

runBasicTests()