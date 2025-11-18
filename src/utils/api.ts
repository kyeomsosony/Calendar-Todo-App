import { supabaseAnonKey, projectId } from './supabase/config';
import { TodoItem, Record, Comment, Journal, JournalComment, Notification } from '../types/todo';
import { getSupabase } from './supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-115a0b3d`;

async function getHeaders() {
  const supabase = getSupabase();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  const token = session?.access_token || supabaseAnonKey;
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ===== Todos =====

export async function getTodos(): Promise<TodoItem[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/todos`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTodos:', error);
    return [];
  }
}

export async function createTodo(todo: TodoItem): Promise<TodoItem | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createTodo:', error);
    return null;
  }
}

export async function updateTodo(todo: TodoItem): Promise<TodoItem | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/todos/${todo.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return await response.json();
  } catch (error) {
    console.error('Error in updateTodo:', error);
    return null;
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error in deleteTodo:', error);
    return false;
  }
}

// ===== Records =====

export async function getRecords(): Promise<Record[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/records`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching records: ${response.status}`, errorText);
      throw new Error('Failed to fetch records');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getRecords:', error);
    return [];
  }
}

export async function createRecord(record: Record): Promise<Record | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error('Failed to create record');
    return await response.json();
  } catch (error) {
    console.error('Error in createRecord:', error);
    return null;
  }
}

// ===== Comments =====

export async function getComments(): Promise<Comment[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/comments`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching comments: ${response.status}`, errorText);
      throw new Error('Failed to fetch comments');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getComments:', error);
    return [];
  }
}

export async function createComment(comment: Comment): Promise<Comment | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(comment),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return await response.json();
  } catch (error) {
    console.error('Error in createComment:', error);
    return null;
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    // Use POST instead of DELETE for better compatibility
    const response = await fetch(`${API_BASE}/comments/${id}/delete`, {
      method: 'POST',
      headers,
    });
    
    // Silently return result - no error logging needed
    return response.ok;
  } catch (error) {
    // Silently fail - comment is already removed from local storage
    return false;
  }
}

// ===== Journals =====

export async function getJournals(): Promise<Journal[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/journals`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching journals: ${response.status}`, errorText);
      throw new Error('Failed to fetch journals');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getJournals:', error);
    return [];
  }
}

export async function saveJournal(journal: Journal): Promise<Journal | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/journals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(journal),
    });
    if (!response.ok) throw new Error('Failed to save journal');
    return await response.json();
  } catch (error) {
    console.error('Error in saveJournal:', error);
    return null;
  }
}

// ===== Journal Comments =====

export async function getJournalComments(): Promise<JournalComment[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/journal-comments`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching journal comments: ${response.status}`, errorText);
      throw new Error('Failed to fetch journal comments');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getJournalComments:', error);
    return [];
  }
}

export async function createJournalComment(comment: JournalComment): Promise<JournalComment | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/journal-comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(comment),
    });
    if (!response.ok) throw new Error('Failed to create journal comment');
    return await response.json();
  } catch (error) {
    console.error('Error in createJournalComment:', error);
    return null;
  }
}

// ===== Groups =====

export async function createGroup(name: string, memberIds: string[]): Promise<any | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, memberIds }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create group');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error in createGroup:', error.message);
    throw error;
  }
}

export async function getGroups(): Promise<any[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/groups`, {
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching groups: ${response.status}`, errorText);
      throw new Error('Failed to fetch groups');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getGroups:', error);
    return [];
  }
}

export async function updateGroup(groupId: string, name: string, memberIds: string[]): Promise<any | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/groups/${groupId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name, memberIds }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update group');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error in updateGroup:', error.message);
    throw error;
  }
}

export async function deleteGroup(groupId: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/groups/${groupId}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error in deleteGroup:', error);
    return false;
  }
}

// ===== Friends & Friend Requests =====

export async function sendFriendRequest(toUserEmail: string): Promise<any | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friend-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ toUserEmail }),
    });
    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || 'Failed to send friend request';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error in sendFriendRequest:', error.message);
    throw error;
  }
}

export async function getReceivedFriendRequests(): Promise<any[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friend-requests/received`, {
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching received requests: ${response.status}`, errorText);
      throw new Error('Failed to fetch received requests');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getReceivedFriendRequests:', error);
    return [];
  }
}

export async function getSentFriendRequests(): Promise<any[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friend-requests/sent`, {
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching sent requests: ${response.status}`, errorText);
      throw new Error('Failed to fetch sent requests');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getSentFriendRequests:', error);
    return [];
  }
}

export async function respondToFriendRequest(requestId: string, action: 'accept' | 'reject'): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friend-requests/${requestId}/${action}`, {
      method: 'POST',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error in respondToFriendRequest:', error);
    return false;
  }
}

export async function getFriends(): Promise<any[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friends`, {
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching friends: ${response.status}`, errorText);
      throw new Error('Failed to fetch friends');
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error in getFriends:', error);
    return [];
  }
}

export async function removeFriend(friendId: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friends/${friendId}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error in removeFriend:', error);
    return false;
  }
}

// ===== User Profile =====

export async function getCurrentUser(): Promise<any | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/me`, {
      headers,
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// ===== Notifications =====

export async function getNotifications(): Promise<Notification[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/notifications`, {
      headers,
    });
    if (!response.ok) {
      console.error('Failed to fetch notifications');
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
}

export async function sendNotificationResponse(notificationId: string, response: 'accept' | 'reject'): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/notifications/${notificationId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ response }),
    });
    return res.ok;
  } catch (error) {
    console.error('Error in sendNotificationResponse:', error);
    return false;
  }
}

export async function acceptFriendNotification(fromUserId: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/friends/accept`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fromUserId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error in acceptFriendNotification:', error);
    return false;
  }
}

export async function getUserById(userId: string): Promise<any | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      headers,
    });
    if (!response.ok) {
      console.error('Failed to fetch user profile');
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

// ===== Initialize =====

export async function initializeData(data: {
  todos: TodoItem[];
  records: Record[];
  comments: Comment[];
  journals: Journal[];
  journalComments: JournalComment[];
}): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/initialize`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Error in initializeData:', error);
    return false;
  }
}