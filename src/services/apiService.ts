const API_BASE_URL = 'https://77.37.120.36:8000';

export interface User {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  access_token?: string;
  file_id?: string;
  id?: string;
  rendered_content?: string;
}

export interface FileStatus {
  file_id: string;
  status: string;
  progress?: number;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async makeRequest(url: string, options: RequestInit): Promise<ApiResponse> {
    try {
      console.log(`Making request to: ${url}`);
      console.log('Request options:', options);
      console.log('Current origin:', window.location.origin);
      console.log('Protocol mismatch check:', window.location.protocol === 'https:' && url.startsWith('http:'));
      
      // Check for mixed content issue
      if (window.location.protocol === 'https:' && url.startsWith('http:')) {
        console.warn('Mixed content detected: HTTPS frontend trying to connect to HTTP backend');
        return { 
          error: 'Mixed content error: Cannot connect from HTTPS site to HTTP backend. Please use HTTPS for your backend or run this app on HTTP.' 
        };
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      console.log(`Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        return { error: errorMessage };
      }

      const data = await response.json();
      console.log('Success response:', data);
      return data;
      
    } catch (error) {
      console.error('Request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Request timeout - server took too long to respond' };
        }
        if (error.message.includes('Failed to fetch')) {
          return { 
            error: `Cannot connect to server. This might be due to:
1. Mixed content issue (HTTPS frontend → HTTP backend)
2. CORS configuration 
3. Network connectivity
4. Backend not running

Current setup: ${window.location.protocol} frontend → ${url}` 
          };
        }
        if (error.message.includes('CORS')) {
          return { error: 'CORS error - backend needs to allow requests from this domain' };
        }
        return { error: error.message };
      }
      
      return { error: 'Unknown network error occurred' };
    }
  }

  // Test connectivity to the backend
  async testConnection(): Promise<ApiResponse> {
    console.log('Testing backend connectivity...');
    return this.makeRequest(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
  }

  // Auth endpoints
  async register(userData: User): Promise<ApiResponse> {
    console.log('Attempting registration with:', { name: userData.name, email: userData.email });
    
    return this.makeRequest(`${API_BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password
      })
    });
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    console.log('Attempting login with username:', credentials.username);
    
    return this.makeRequest(`${API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });
  }

  async testToken(): Promise<ApiResponse> {
    return this.makeRequest(`${API_BASE_URL}/api/v1/test-token`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async uploadExcel(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('auth_token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        body: formData
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Upload error response:', errorText);
        return { error: `Upload failed: HTTP ${response.status}` };
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      return { error: 'File upload failed - network error' };
    }
  }

  async checkFileStatus(fileId: string): Promise<ApiResponse<FileStatus>> {
    return this.makeRequest(`${API_BASE_URL}/api/v1/status/${fileId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async renderTemplate(templateData: any): Promise<ApiResponse> {
    return this.makeRequest(`${API_BASE_URL}/api/v1/render_template/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData)
    });
  }

  async getRenderedTemplate(fileId: string): Promise<ApiResponse> {
    return this.makeRequest(`${API_BASE_URL}/api/v1/get_rendered_template/${fileId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
