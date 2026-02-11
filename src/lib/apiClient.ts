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

/** Checklist API: jsonRpc дуудаад status/success буцаах давталтыг багасгана */
async function checklistRpc<T = unknown>(
  baseUrl: string,
  path: string,
  params: Record<string, unknown> = {},
  fallbackMessage = 'Network error'
): Promise<{ success: true; data: T } | { success: false; message: string }> {
  try {
    const data = await jsonRpc(baseUrl, path, params) as { status?: string; data?: T; message?: string };
    if (data.status === 'success') return { success: true, data: data.data as T };
    return { success: false, message: data.message || fallbackMessage };
  } catch (error) {
    console.error(error);
    return { success: false, message: fallbackMessage };
  }
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

      if (!response.ok) {throw new Error(`Failed to fetch databases: ${response.statusText}`);}
      const data = await response.json();
      if (data.result) {return data.result;}
      return [];
    } catch (error) {console.error('Error fetching databases:', error); return [];}
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

  getMe: async (baseUrl: string): Promise<{ status: string; data?: { uid: number; name: string; is_group_user: boolean }; message?: string }> => {
    try {
      const res = await jsonRpc(baseUrl, '/api/auth/me') as { status: string; data?: { uid: number; name: string; is_group_user: boolean }; message?: string };
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

/** Send-rows хоёр endpoint нэг RPC — path болон body л өөр */
type SendRowsResult = { success: true; message?: string; data: { json_data?: unknown; responsible_ids?: string[] } } | { success: false; message: string };
async function sendRowsRpc(baseUrl: string, path: string, body: Record<string, unknown>): Promise<SendRowsResult> {
  try {
    const data = await jsonRpc(baseUrl, path, body) as { status?: string; message?: string; data?: { json_data?: unknown; responsible_ids?: string[] } };
    if (data.status === 'success') return { success: true, message: data.message, data: data.data ?? {} };
    return { success: false, message: data.message || 'Илгээхэд алдаа гарлаа' };
  } catch (error) {
    console.error('Send rows error:', error);
    return { success: false, message: 'Сүлжээний алдаа' };
  }
}

export const checklistAPI = {
  getList: (baseUrl: string) =>
    checklistRpc(baseUrl, '/api/checklist/list', {}, 'Error fetching checklist list'),

  getMyDepartments: (baseUrl: string) =>
    checklistRpc(baseUrl, '/api/checklist/my-departments', {}, 'Error fetching my departments').then(r => (r.success && r.data == null ? { success: true as const, data: [] } : r)),

  getDepartmentBranches: (baseUrl: string, departmentId: number) =>
    checklistRpc(baseUrl, `/api/checklist/department/${departmentId}/branches`, {}, 'Error fetching branches').then(r => (r.success && r.data == null ? { success: true as const, data: [] } : r)),

  getBranchConfigs: (baseUrl: string, branchId: number) =>
    checklistRpc(baseUrl, `/api/checklist/branch/${branchId}/configs`, {}, 'Error fetching configs').then(r => (r.success && r.data == null ? { success: true as const, data: [] } : r)),

  getBranchJobs: (baseUrl: string, branchId: number) =>
    checklistRpc(baseUrl, `/api/checklist/branch/${branchId}/jobs`, {}, 'Error fetching branch jobs').then(r => (r.success && r.data == null ? { success: true as const, data: [] } : r)),

  getChecklistUsers: (baseUrl: string) =>
    checklistRpc(baseUrl, '/api/checklist/users', {}, 'Error fetching users').then(r => (r.success && r.data == null ? { success: true as const, data: [] } : r)),

  createJob: (baseUrl: string, payload: { branch_id: number; checklist_conf_id?: number; date: string; summary?: string; responsible_user_ids?: number[] }) =>
    checklistRpc(baseUrl, '/api/checklist/job/create', payload, 'Error creating job'),

  getDepartmentList: (baseUrl: string) =>
    checklistRpc(baseUrl, '/api/checklist/department/list', {}, 'Error fetching department checklist'),

  getDepartmentDetail: (baseUrl: string, id: number) =>
    checklistRpc(baseUrl, `/api/checklist/department/${id}`, {}, 'Error fetching department checklist detail'),

  updateDepartmentJob: (baseUrl: string, id: number, payload: { json_data?: unknown; summary?: string; state?: string }) =>
    checklistRpc(baseUrl, `/api/checklist/department/${id}/update`, payload, 'Error updating department job'),

  sendRowTask: (baseUrl: string, jobId: number, rowIndices: number[], userIds: number[]) =>
    sendRowsRpc(baseUrl, `/api/checklist/department/${jobId}/send-rows`, { row_indices: rowIndices, user_ids: userIds }),

  sendRowTaskChecklist: (baseUrl: string, jobId: number, sentSequences: number[], userIds: number[]) =>
    sendRowsRpc(baseUrl, `/api/checklist/${jobId}/send-rows`, { sent_sequences: sentSequences, user_ids: userIds }),

  getNotifications: (baseUrl: string) =>
    checklistRpc(baseUrl, '/api/checklist/notifications', {}, 'Error fetching notifications'),

  getDetail: (baseUrl: string, id: number) =>
    checklistRpc(baseUrl, `/api/checklist/${id}`, {}, 'Error fetching checklist detail'),

  update: (baseUrl: string, id: number, payload: { json_data?: unknown; state?: string; summary?: string }) =>
    checklistRpc(baseUrl, `/api/checklist/${id}/update`, payload, 'Error updating checklist'),
};