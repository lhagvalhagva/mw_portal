export const authAPI = {
  async getDatabases(baseUrl: string): Promise<string[]> {
    try {
      const response = await fetch(`${baseUrl}/portal/database/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch databases: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.result) {
        return data.result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching databases:', error);
      return [];
    }
  },

  async login({ baseUrl, db, login, password }: {
    baseUrl: string;
    db: string;
    login: string;
    password: string;
  }) {
    try {
      const response = await fetch(`${baseUrl}/portal/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: { db, login, password },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login API error response:', errorText);
        return { success: false, message: `Login failed with status ${response.status}: ${errorText.substring(0, 100)}...` };
      }

      const data = await response.json();

      if (data.result && data.result.uid) {
        return { success: true, userId: data.result.uid, data: data.result };
      } else {
        return { success: false, message: data.error?.data?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof SyntaxError) {
        console.error('Likely not JSON response. Check network tab for actual response content.');
      }
      return { success: false, message: 'Network error or invalid response from server' };
    }
  },

  async logout(baseUrl: string) {
    try {
      const response = await fetch(`${baseUrl}/portal/session/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: 'Logout failed' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getEmployeeProfile: async (baseUrl: string): Promise<any> => {
    const url = `${baseUrl}/api/auth/employee-profile`;
    console.log('Fetching employee profile from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    console.log('Employee profile data:', data);
    return data;
  },
};
export const attendanceAPI = {
  /**
   * Ирц бүртгүүлэх (Check-in / Check-out)
   * @param baseUrl - Серверийн хаяг
   * @param time - Бүртгүүлэх цаг (Формат: YYYY-MM-DD HH:mm:ss)
   */
  createAttendance: async (baseUrl: string, time: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/attendance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          attendance_time: time,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Ирц бүртгэхэд алдаа гарлаа' };
    } catch (error) {
      console.error('Create attendance error:', error);
      return { success: false, message: 'Сүлжээний алдаа гарлаа' };
    }
  },

  /**
   * Тухайн ажилтны ирцийн түүхийг авах
   */
  getAttendanceList: async (baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/attendance/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Жагсаалт авахад алдаа гарлаа' };
    } catch (error) {
      console.error('Get attendance list error:', error);
      return { success: false, message: 'Сүлжээний алдаа гарлаа' };
    }
  },

  checkAttendanceStatus: async (baseUrl: string) => {
    const response = await fetch(`${baseUrl}/api/attendance/status`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  },
};

export const checklistAPI = {
  getList: async (baseUrl: string) => {
    try {
      console.log(`Fetching: ${baseUrl}/api/checklist/list`);
      const response = await fetch(`${baseUrl}/api/checklist/list`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      console.log('Response Status:', response.status);
      const text = await response.text();
      console.log('Response Body:', text.substring(0, 500));

      if (!response.ok) {
        return { success: false, message: `Server error: ${response.status}` };
      }

      try {
        const data = JSON.parse(text);
        if (data.status === 'success') {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message || 'Error fetching checklist list' };
      } catch (e) {
        console.error('JSON Parse Error:', e);
        return { success: false, message: 'Invalid JSON response from server' };
      }
    } catch (error) {
      console.error('Checklist list error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getNotifications: async (baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/checklist/notifications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status === 'success') {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Error fetching notifications' };
    } catch (error) {
      console.error('Checklist notifications error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getDetail: async (baseUrl: string, id: number) => {
    try {
      const response = await fetch(`${baseUrl}/api/checklist/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status === 'success') {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Error fetching checklist detail' };
    } catch (error) {
      console.error('Checklist detail error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  update: async (baseUrl: string, id: number, payload: { json_data?: any, state?: string, summary?: string }) => {
    try {
      const response = await fetch(`${baseUrl}/api/checklist/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === 'success') {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Error updating checklist' };
    } catch (error) {
      console.error('Checklist update error:', error);
      return { success: false, message: 'Network error' };
    }
  }
};