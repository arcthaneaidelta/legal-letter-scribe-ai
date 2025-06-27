
const API_BASE_URL = 'http://77.37.120.36:8000';

export interface User {
  username: string;
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
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth endpoints
  async register(userData: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      return { error: 'Registration failed' };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      return { error: 'Login failed' };
    }
  }

  async testToken(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/test-token`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { error: 'Token validation failed' };
    }
  }

  // Excel endpoints
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
        body: formData
      });
      return await response.json();
    } catch (error) {
      return { error: 'File upload failed' };
    }
  }

  async checkFileStatus(fileId: string): Promise<ApiResponse<FileStatus>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/status/${fileId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { error: 'Status check failed' };
    }
  }

  // Template rendering endpoints
  async renderTemplate(templateData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/render_template/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });
      return await response.json();
    } catch (error) {
      return { error: 'Template rendering failed' };
    }
  }

  async getRenderedTemplate(fileId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/get_rendered_template/${fileId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to get rendered template' };
    }
  }

  // Utility methods
  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
