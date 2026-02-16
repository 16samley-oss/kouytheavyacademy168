import api from './api';

// Regular user endpoints
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// NEW: Get all users with pagination handling
export const getAllUsers = async (params = {}) => {
  try {
    console.log('🔍 Fetching all users from /admin/users');
    
    // First request to get first page and total count
    const initialResponse = await api.get('/admin/users', { 
      params: { 
        limit: 10000, // Request max per page
        skip: 0,
        ...params 
      } 
    });

    console.log('Initial response:', initialResponse);

    // Handle different response formats
    let users = [];
    let totalCount = 0;

    // Case 1: Response is an array directly
    if (Array.isArray(initialResponse.data)) {
      users = initialResponse.data;
      totalCount = users.length;
      console.log('Response is array with length:', users.length);
    } 
    // Case 2: Response has users array and total count
    else if (initialResponse.data && initialResponse.data.users) {
      users = initialResponse.data.users;
      totalCount = initialResponse.data.total || users.length;
      console.log('Response has users array:', {
        usersLength: users.length,
        total: initialResponse.data.total
      });
    }
    // Case 3: Response has data field
    else if (initialResponse.data && initialResponse.data.data) {
      users = initialResponse.data.data;
      totalCount = initialResponse.data.total || users.length;
    }
    // Case 4: Check headers for total count
    else {
      users = initialResponse.data || [];
      // Check if total count is in headers
      const headerTotal = initialResponse.headers['x-total-count'] || 
                         initialResponse.headers['total-count'] ||
                         initialResponse.headers['x-total'];
      
      totalCount = headerTotal ? parseInt(headerTotal) : users.length;
    }

    // If there's a total count and it's more than what we got, fetch all pages
    if (totalCount > users.length) {
      console.log(`📊 Total records: ${totalCount}, Current: ${users.length}. Fetching all pages...`);
      
      const perPage = 100; // Match your API's max per page
      const totalPages = Math.ceil(totalCount / perPage);
      let allUsers = [...users];
      
      console.log(`🔄 Fetching ${totalPages} total pages...`);
      
      // Fetch remaining pages
      for (let page = 1; page < totalPages; page++) {
        try {
          console.log(`Fetching page ${page + 1}/${totalPages}...`);
          
          const response = await api.get('/admin/users', {
            params: {
              limit: perPage,
              skip: page * perPage,
              ...params
            }
          });
          
          // Extract users from response
          let pageUsers = [];
          if (Array.isArray(response.data)) {
            pageUsers = response.data;
          } else if (response.data && response.data.users) {
            pageUsers = response.data.users;
          } else if (response.data && response.data.data) {
            pageUsers = response.data.data;
          }
          
          allUsers = [...allUsers, ...pageUsers];
          console.log(`✅ Page ${page + 1} complete. Total now: ${allUsers.length}`);
          
        } catch (pageError) {
          console.error(`❌ Error fetching page ${page + 1}:`, pageError);
          // Continue with what we have
        }
      }
      
      console.log(`✅ COMPLETE: Fetched ${allUsers.length} users`);
      return allUsers;
    }

    console.log(`✅ Returned ${users.length} users`);
    return users;
    
  } catch (error) {
    console.error('❌ Get all users error:', error);
    
    // Handle 404 specifically
    if (error.response?.status === 404) {
      console.warn('⚠️ Users endpoint not found (404).');
    }
    
    throw error;
  }
};

// NEW: Paginated version for better performance
export const getPaginatedUsers = async (page = 1, limit = 50, filters = {}) => {
  try {
    const response = await api.get('/admin/users', {
      params: {
        limit,
        skip: (page - 1) * limit,
        ...filters
      }
    });
    
    // Return with pagination metadata
    if (response.data && response.data.users) {
      return {
        users: response.data.users,
        total: response.data.total || response.data.users.length,
        page,
        limit,
        totalPages: Math.ceil((response.data.total || response.data.users.length) / limit)
      };
    } else if (Array.isArray(response.data)) {
      return {
        users: response.data,
        total: response.data.length,
        page,
        limit,
        totalPages: Math.ceil(response.data.length / limit)
      };
    }
    
    // Check headers for total count
    const headerTotal = response.headers['x-total-count'] || 
                       response.headers['total-count'] ||
                       response.headers['x-total'];
    
    const total = headerTotal ? parseInt(headerTotal) : response.data?.length || 0;
    
    return {
      users: response.data || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Get paginated users error:', error);
    throw error;
  }
};

// Keep existing functions
export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const response = await api.post(`/admin/users/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    throw error;
  }
};

// NEW: Search users
export const searchUsers = async (query, params = {}) => {
  try {
    const response = await api.get('/admin/users/search', {
      params: { q: query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
};

// NEW: Get user statistics
export const getUserStats = async () => {
  try {
    const response = await api.get('/admin/users/stats');
    return response.data;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

// NEW: Debug function to test endpoint
export const testUsersEndpoint = async () => {
  try {
    console.log('🔍 Testing /admin/users endpoint...');
    
    const response = await api.get('/admin/users', { 
      params: { limit: 5 } 
    });
    
    console.log('✅ Test successful!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));
    console.log('Data preview:', response.data);
    
    // Check for total in headers
    const headerTotal = response.headers['x-total-count'] || 
                       response.headers['total-count'] ||
                       response.headers['x-total'];
    
    if (headerTotal) {
      console.log('Total from headers:', headerTotal);
    }
    
    if (response.data && response.data.users) {
      console.log('Users array length:', response.data.users.length);
      console.log('Total records:', response.data.total);
    }
    
    return {
      success: true,
      status: response.status,
      headers: response.headers,
      data: response.data,
      hasUsers: !!(response.data?.users || Array.isArray(response.data)),
      totalFromHeaders: headerTotal
    };
  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
    
    return {
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    };
  }
};

// NEW: Mock data generator for testing
export const getMockUsers = (count = 150) => {
  const roles = ['student', 'instructor', 'admin'];
  const statuses = ['active', 'inactive', 'suspended'];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const mockUsers = [];
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
    
    const lastLogin = Math.random() > 0.3 ? new Date() : null;
    if (lastLogin) {
      lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 30));
    }
    
    mockUsers.push({
      id: i,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
      email: email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      is_active: Math.random() > 0.2,
      email_verified: Math.random() > 0.1,
      profile_image: null,
      phone: `+855${Math.floor(Math.random() * 100000000)}`,
      address: `${Math.floor(Math.random() * 1000)} Main St, Phnom Penh`,
      bio: `Bio for ${fullName}`,
      last_login: lastLogin ? lastLogin.toISOString() : null,
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString(),
      enrolled_courses: Math.floor(Math.random() * 20),
      completed_courses: Math.floor(Math.random() * 10),
      total_spent: parseFloat((Math.random() * 1000).toFixed(2))
    });
  }
  
  // Sort by created_at descending (newest first)
  return mockUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};