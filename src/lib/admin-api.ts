import { config } from './config';

const API_BASE_URL = config.apiBaseUrl.replace('/api', '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard stats' }));
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }
  return response.json();
};

// Research Areas
export const createResearchArea = async (data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/research-areas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create research area' }));
    throw new Error(error.message || 'Failed to create research area');
  }
  return response.json();
};

export const updateResearchArea = async (id: number, data: FormData) => {
  // Note: Don't set Content-Type header - browser sets it automatically with boundary
  const response = await fetch(`${API_BASE_URL}/api/admin/research-areas/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      // Content-Type is automatically set by browser for FormData
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update research area' }));
    throw new Error(error.message || 'Failed to update research area');
  }
  return response.json();
};

export const deleteResearchArea = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/research-areas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete research area' }));
    throw new Error(error.message || 'Failed to delete research area');
  }
  return response.json();
};

// Team Members
export const createTeamMember = async (data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/team-members`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create team member' }));
    throw new Error(error.message || 'Failed to create team member');
  }
  return response.json();
};

export const updateTeamMember = async (id: string, data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/team-members/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update team member' }));
    throw new Error(error.message || 'Failed to update team member');
  }
  return response.json();
};

export const deleteTeamMember = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/team-members/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete team member' }));
    throw new Error(error.message || 'Failed to delete team member');
  }
  return response.json();
};

// Publications
export const createPublication = async (data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/publications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create publication' }));
    throw new Error(error.message || 'Failed to create publication');
  }
  return response.json();
};

export const updatePublication = async (id: string, data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/publications/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update publication' }));
    throw new Error(error.message || 'Failed to update publication');
  }
  return response.json();
};

export const deletePublication = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/publications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete publication' }));
    throw new Error(error.message || 'Failed to delete publication');
  }
  return response.json();
};

// Contact Submissions
export const getContactSubmissions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/contact-submissions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch contact submissions' }));
    throw new Error(error.message || 'Failed to fetch contact submissions');
  }
  const rawData = await response.json();
  const data = rawData.data || rawData;
  
  // Normalize _id to id for MongoDB documents
  const normalize = (items: any[]) => {
    return items.map(item => {
      if (item._id && !item.id) {
        item.id = item._id;
      }
      return item;
    });
  };
  
  return Array.isArray(data) ? normalize(data) : data;
};

export const markSubmissionAsRead = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/contact-submissions/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to mark submission as read' }));
    throw new Error(error.message || 'Failed to mark submission as read');
  }
  return response.json();
};

export const deleteContactSubmission = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/contact-submissions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete contact submission' }));
    throw new Error(error.message || 'Failed to delete contact submission');
  }
  return response.json();
};

// Lab Information
export const getLabInfo = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/lab-info`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch lab info' }));
    throw new Error(error.message || 'Failed to fetch lab info');
  }
  
  const data = await response.json();
  return data.data || data;
};

export const updateLabInfo = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/lab-info`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update lab info' }));
    throw new Error(error.message || 'Failed to update lab info');
  }
  
  return response.json();
};

// Reordering Functions
export const reorderResearchAreas = async (orderedIds: number[]) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/research-areas/reorder`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reorder research areas' }));
    throw new Error(error.message || 'Failed to reorder research areas');
  }
  return response.json();
};

export const reorderTeamMembers = async (orderedIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/team-members/reorder`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reorder team members' }));
    throw new Error(error.message || 'Failed to reorder team members');
  }
  return response.json();
};

// Timeline Events
export const createTimelineEvent = async (data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/timeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create timeline event' }));
    throw new Error(error.message || 'Failed to create timeline event');
  }
  return response.json();
};

export const updateTimelineEvent = async (id: number, data: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/timeline/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    },
    body: data,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update timeline event' }));
    throw new Error(error.message || 'Failed to update timeline event');
  }
  return response.json();
};

export const deleteTimelineEvent = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/timeline/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete timeline event' }));
    throw new Error(error.message || 'Failed to delete timeline event');
  }
  return response.json();
};

export const reorderTimelineEvents = async (orderedIds: number[]) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/timeline/reorder`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reorder timeline events' }));
    throw new Error(error.message || 'Failed to reorder timeline events');
  }
  return response.json();
};
