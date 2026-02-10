const testEndpoints = async () => {
  const baseUrl = 'http://localhost:8000';
  const endpoints = [
    '/health',
    '/',
    '/docs',
    '/me',
    '/token',
    '/register',
    '/admin/users',
    '/admin/courses/all',
    '/admin/enrollments',
    '/payments'
  ];
  
  console.log('Testing backend endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${endpoint}: ERROR - ${error.message}`);
    }
  }
};

// Run in browser console
testEndpoints();