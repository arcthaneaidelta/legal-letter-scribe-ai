
const API_BASE_URL = 'http://77.37.120.36:8000';

export interface User {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
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

  // Auth endpoints
  async register(userData: User): Promise<ApiResponse> {
    try {
      console.log('Attempting registration with:', { email: userData.email, username: userData.username });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(userData)
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Registration error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return { error: error instanceof Error ? error.message : 'Registration failed. Please check your connection.' };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      console.log('Attempting login with email:', credentials.email);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(credentials)
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Login error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        console.log('Token stored successfully');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { error: error instanceof Error ? error.message : 'Login failed. Please check your connection.' };
    }
  }

  async testToken(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/test-token`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Token validation error:', error);
      return { error: 'Token validation failed' };
    }
  }

  async uploadExcel(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      return { error: 'File upload failed' };
    }
  }

  async checkFileStatus(fileId: string): Promise<ApiResponse<FileStatus>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/status/${fileId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return { error: 'Status check failed' };
    }
  }

  async renderTemplate(templateData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/render_template/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        mode: 'cors',
        body: JSON.stringify(templateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Template rendering error:', error);
      return { error: 'Template rendering failed' };
    }
  }

  async getRenderedTemplate(fileId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/get_rendered_template/${fileId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get rendered template error:', error);
      return { error: 'Failed to get rendered template' };
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
