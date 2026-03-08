const API_URL = import.meta.env.VITE_API_URL;

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper to set auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Helper to handle API responses
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};

// Auth API
export const auth = {
  signup: async (email, password) => {
    try {
      console.log('API URL:', API_URL);
      console.log('Signup request to:', `${API_URL}/api/auth/signup`);

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', res.status);
      const data = await handleResponse(res);
      if (data.token) localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Auth.signup error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('API URL:', API_URL);
      console.log('Login request to:', `${API_URL}/api/auth/login`);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', res.status);
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Set online status
        await fetch(`${API_URL}/api/users/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({ is_online: true })
        });
      }
      return data;
    } catch (error) {
      console.error('Auth.login error:', error);
      throw error;
    }
  },

  getUser: async () => {
    const res = await fetch(`${API_URL}/api/auth/user`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  logout: async () => {
    const token = getToken();
    if (token) {
      // Set offline status before logout
      try {
        await fetch(`${API_URL}/api/users/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ is_online: false })
        });
      } catch (error) {
        console.error('Error setting offline status:', error);
      }
    }
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

// Profiles API
export const profiles = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/profiles`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  getById: async (userId) => {
    const res = await fetch(`${API_URL}/api/profiles/${userId}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  createOrUpdate: async (profileData) => {
    const res = await fetch(`${API_URL}/api/profiles/update`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // PUT method for updating profile (RESTful)
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_URL}/api/profiles/update`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  search: async (location) => {
    const res = await fetch(`${API_URL}/api/profiles/search?location=${encodeURIComponent(location)}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/api/profiles/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    return handleResponse(res);
  },

  getSuggestions: async () => {
    const res = await fetch(`${API_URL}/api/profiles/suggestions`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  }
};

// Connections API
export const connections = {
  send: async (receiver_id) => {
    const res = await fetch(`${API_URL}/api/connections`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ receiver_id })
    });
    return handleResponse(res);
  },

  getIncoming: async () => {
    const res = await fetch(`${API_URL}/api/connections/incoming`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  getAccepted: async () => {
    const res = await fetch(`${API_URL}/api/connections/accepted`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  updateStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/api/connections/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};

// Messages API
export const messages = {
  get: async (receiverId) => {
    const res = await fetch(`${API_URL}/api/messages/${receiverId}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  send: async (receiver_id, content) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ receiver_id, content })
    });
    return handleResponse(res);
  },
  delete: async (messageId) => {
    const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  }
};

// Notifications API
export const notifications = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  getUnreadCount: async () => {
    const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  markAsRead: async (notification_id = null) => {
    const res = await fetch(`${API_URL}/api/notifications/read`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ notification_id })
    });
    return handleResponse(res);
  },
  delete: async (notificationId) => {
    const res = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  },
  clearAll: async () => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  }
};

// Users API
export const users = {
  getOnline: async () => {
    const res = await fetch(`${API_URL}/api/users/online`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  setStatus: async (is_online) => {
    const res = await fetch(`${API_URL}/api/users/status`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ is_online })
    });
    return handleResponse(res);
  },

  getInfo: async (id) => {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  getPreferences: async () => {
    const res = await fetch(`${API_URL}/api/users/preferences`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  updatePreferences: async (preferences) => {
    const res = await fetch(`${API_URL}/api/users/preferences`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(preferences)
    });
    return handleResponse(res);
  }
};
