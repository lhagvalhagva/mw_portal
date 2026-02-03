/** Odoo type='json' route-д POST + JSON-RPC илгээж, result буцаана */
async function jsonRpc(baseUrl: string, path: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params, id: 1 }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error('RPC not available');
  const data = JSON.parse(text) as { error?: unknown; result?: unknown };
  if (data.error) throw new Error((data.error as { data?: { message?: string }; message?: string })?.data?.message || (data.error as { message?: string })?.message || 'RPC error');
  return data.result;
}

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
    try {
      const res = await jsonRpc(baseUrl, '/api/auth/employee-profile') as { status: string; data?: unknown; message?: string };
      return res;
    } catch {
      return { status: 'error', message: 'API not available' };
    }
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
      const data = await jsonRpc(baseUrl, '/api/attendance/create', { attendance_time: time }) as { success?: boolean; data?: unknown; message?: string };
      if (data.success) return { success: true, data: data.data };
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
      const data = await jsonRpc(baseUrl, '/api/attendance/list') as { success?: boolean; data?: unknown; message?: string };
      if (data.success) return { success: true, data: data.data };
      return { success: false, message: data.message || 'Жагсаалт авахад алдаа гарлаа' };
    } catch (error) {
      console.error('Get attendance list error:', error);
      return { success: false, message: 'Сүлжээний алдаа гарлаа' };
    }
  },

  checkAttendanceStatus: async (baseUrl: string) => {
    try {
      const res = await jsonRpc(baseUrl, '/api/attendance/status') as { success?: boolean; is_working?: boolean; last_time?: string | null };
      return res;
    } catch {
      return { success: false, is_working: false, last_time: null, count: 0 };
    }
  },
};

export const checklistAPI = {
  getList: async (baseUrl: string) => {
    try {
      const data = await jsonRpc(baseUrl, '/api/checklist/list') as { status?: string; data?: unknown; message?: string };
      if (data.status === 'success') return { success: true, data: data.data };
      return { success: false, message: data.message || 'Error fetching checklist list' };
    } catch (error) {
      console.error('Checklist list error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getNotifications: async (baseUrl: string) => {
    try {
      const data = await jsonRpc(baseUrl, '/api/checklist/notifications') as { status?: string; data?: { count: number; jobs: unknown[] }; message?: string };
      if (data.status === 'success') return { success: true, data: data.data };
      return { success: false, message: data.message || 'Error fetching notifications' };
    } catch {
      return { success: false, message: 'Network error' };
    }
  },

  getDetail: async (baseUrl: string, id: number) => {
    try {
      const data = await jsonRpc(baseUrl, `/api/checklist/${id}`) as { status?: string; data?: unknown; message?: string };
      if (data.status === 'success') return { success: true, data: data.data };
      return { success: false, message: data.message || 'Error fetching checklist detail' };
    } catch (error) {
      console.error('Checklist detail error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  update: async (baseUrl: string, id: number, payload: { json_data?: unknown; state?: string; summary?: string }) => {
    try {
      const data = await jsonRpc(baseUrl, `/api/checklist/${id}/update`, payload) as { status?: string; data?: unknown; message?: string };
      if (data.status === 'success') return { success: true, data: data.data };
      return { success: false, message: data.message || 'Error updating checklist' };
    } catch (error) {
      console.error('Checklist update error:', error);
      return { success: false, message: 'Network error' };
    }
  }
};