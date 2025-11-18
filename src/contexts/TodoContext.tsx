import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TodoItem, Record, Comment, Journal, JournalComment, User, Friend, FriendRequest, Group, Notification } from '../types/todo';
import { todos as initialTodos, records as initialRecords, comments as initialComments, journals as initialJournals, journalComments as initialJournalComments } from '../data/mockData';
import * as api from '../utils/api';
import { useAuth } from './AuthContext';

interface TodoContextType {
  todos: TodoItem[];
  records: Record[];
  comments: Comment[];
  journals: Journal[];
  journalComments: JournalComment[];
  isLoading: boolean;
  currentUser: User | null;
  friends: Friend[];
  receivedFriendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  groups: Group[];
  notifications: Notification[];
  addTodo: (todo: TodoItem) => Promise<void>;
  updateTodo: (updatedTodo: TodoItem) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoComplete: (id: string) => Promise<void>;
  addRecord: (todoId: string, type: 'photo' | 'thought', content?: string, photoUrl?: string) => Promise<void>;
  addComment: (todoId: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  updateJournal: (journal: Journal) => Promise<void>;
  addJournalComment: (comment: JournalComment) => Promise<void>;
  sendFriendRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  createGroup: (name: string, memberIds: string[]) => Promise<{ success: boolean; error?: string }>;
  updateGroup: (groupId: string, name: string, memberIds: string[]) => Promise<{ success: boolean; error?: string }>;
  deleteGroup: (groupId: string) => Promise<void>;
  refreshGroups: () => Promise<void>;
  acceptEventInvite: (notificationId: string) => Promise<void>;
  rejectEventInvite: (notificationId: string) => Promise<void>;
  acceptFriendInvite: (notificationId: string) => Promise<void>;
  rejectFriendInvite: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const { user, session, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [journalComments, setJournalComments] = useState<JournalComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<FriendRequest[]>([]);
  const [sentFriendRequests, setSentFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user profile and data when authenticated
  useEffect(() => {
    async function loadData() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }
      
      if (!user || !session) {
        setIsLoading(false);
        setCurrentUser(null);
        setTodos([]);
        setRecords([]);
        setComments([]);
        setJournals([]);
        setJournalComments([]);
        setFriends([]);
        setReceivedFriendRequests([]);
        setSentFriendRequests([]);
        setGroups([]);
        return;
      }
      
      // CRITICAL: Wait for session to be fully persisted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(true);
      try {
        // Load current user profile
        const userProfile = await api.getCurrentUser();
        if (userProfile) {
          setCurrentUser(userProfile);
        }

        // Load friends, friend requests, groups, and notifications
        const [friendsData, receivedRequests, sentRequests, groupsData, notificationsData] = await Promise.all([
          api.getFriends(),
          api.getReceivedFriendRequests(),
          api.getSentFriendRequests(),
          api.getGroups(),
          api.getNotifications(),
        ]);
        setFriends(friendsData);
        setReceivedFriendRequests(receivedRequests);
        setSentFriendRequests(sentRequests);
        setGroups(groupsData);
        setNotifications(notificationsData);

        const [todosData, recordsData, commentsData, journalsData, journalCommentsData] = await Promise.all([
          api.getTodos(),
          api.getRecords(),
          api.getComments(),
          api.getJournals(),
          api.getJournalComments(),
        ]);

        // If no data exists, initialize with mock data (replacing 'me' with actual user ID)
        if (todosData.length === 0 && userProfile) {
          // Replace 'me' userId with actual user ID in mock data
          const userTodos = initialTodos.map(todo => ({
            ...todo,
            userId: todo.userId === 'me' ? userProfile.id : todo.userId
          }));
          const userRecords = initialRecords.map(record => ({
            ...record,
            userId: record.userId === 'me' ? userProfile.id : record.userId
          }));
          const userComments = initialComments.map(comment => ({
            ...comment,
            userId: comment.userId === 'me' ? userProfile.id : comment.userId,
            userName: comment.userId === 'me' ? userProfile.name : comment.userName,
            userAvatar: comment.userId === 'me' ? userProfile.avatar : comment.userAvatar,
          }));
          const userJournals = initialJournals.map(journal => ({
            ...journal,
            userId: journal.userId === 'me' ? userProfile.id : journal.userId
          }));
          
          const initSuccess = await api.initializeData({
            todos: userTodos,
            records: userRecords,
            comments: userComments,
            journals: userJournals,
            journalComments: initialJournalComments,
          });
          
          if (initSuccess) {
            setTodos(userTodos);
            setRecords(userRecords);
            setComments(userComments);
            setJournals(userJournals);
            setJournalComments(initialJournalComments);
            setIsInitialized(true);
          }
        } else {
          setTodos(todosData);
          setRecords(recordsData);
          setComments(commentsData);
          setJournals(journalsData);
          setJournalComments(journalCommentsData);
        }
      } catch (error) {
        console.error('❌ TodoContext - Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, session]);

  const addTodo = async (todo: TodoItem) => {
    const created = await api.createTodo(todo);
    if (created) {
      setTodos((prev) => [...prev, created]);
    }
  };

  const updateTodo = async (updatedTodo: TodoItem) => {
    const updated = await api.updateTodo(updatedTodo);
    if (updated) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updated.id ? updated : todo))
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const deleted = await api.deleteTodo(id);
    if (deleted) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  const toggleTodoComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const updated = { ...todo, isCompleted: !todo.isCompleted };
      await updateTodo(updated);
    }
  };

  const addRecord = async (todoId: string, type: 'photo' | 'thought', content?: string, photoUrl?: string) => {
    if (!currentUser) return;
    
    const newRecord: Record = {
      id: `r${Date.now()}`,
      todoId,
      type,
      content,
      photoUrl,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    
    const created = await api.createRecord(newRecord);
    if (created) {
      setRecords((prev) => [...prev, created]);
      
      // Update todo's hasRecord and recordType
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        const todoRecords = [...records.filter(r => r.todoId === todoId), created];
        const hasPhoto = todoRecords.some(r => r.type === 'photo');
        const hasThought = todoRecords.some(r => r.type === 'thought');
        
        let recordType: 'photo' | 'thought' | 'both' | undefined;
        if (hasPhoto && hasThought) recordType = 'both';
        else if (hasPhoto) recordType = 'photo';
        else if (hasThought) recordType = 'thought';
        
        await updateTodo({ ...todo, hasRecord: true, recordType });
      }
    }
  };

  const addComment = async (todoId: string, content: string) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      todoId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };
    
    const created = await api.createComment(newComment);
    if (created) {
      setComments((prev) => [...prev, created]);
    }
  };

  const deleteComment = async (id: string) => {
    // Optimistic update - remove from state first
    setComments((prev) => prev.filter((comment) => comment.id !== id));
    
    // Delete from server
    const success = await api.deleteComment(id);
    if (!success) {
      // If server deletion fails, reload comments from server
      const commentsData = await api.getComments();
      setComments(commentsData);
    }
  };

  const updateJournal = async (journal: Journal) => {
    const saved = await api.saveJournal(journal);
    if (saved) {
      setJournals((prev) => {
        const existing = prev.find(j => j.id === saved.id);
        if (existing) {
          return prev.map(j => j.id === saved.id ? saved : j);
        }
        return [...prev, saved];
      });
    }
  };

  const addJournalComment = async (comment: JournalComment) => {
    const created = await api.createJournalComment(comment);
    if (created) {
      setJournalComments((prev) => [...prev, created]);
    }
  };

  const sendFriendRequest = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.sendFriendRequest(email);
      // Refresh sent requests
      const sentRequests = await api.getSentFriendRequests();
      setSentFriendRequests(sentRequests);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const success = await api.respondToFriendRequest(requestId, 'accept');
    if (success) {
      await refreshFriends();
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    const success = await api.respondToFriendRequest(requestId, 'reject');
    if (success) {
      // Remove from received requests
      setReceivedFriendRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const removeFriend = async (friendId: string) => {
    const success = await api.removeFriend(friendId);
    if (success) {
      setFriends(prev => prev.filter(f => f.friendId !== friendId));
    }
  };

  const refreshFriends = async () => {
    const [friendsData, receivedRequests, sentRequests] = await Promise.all([
      api.getFriends(),
      api.getReceivedFriendRequests(),
      api.getSentFriendRequests(),
    ]);
    setFriends(friendsData);
    setReceivedFriendRequests(receivedRequests);
    setSentFriendRequests(sentRequests);
  };

  const createGroup = async (name: string, memberIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.createGroup(name, memberIds);
      await refreshGroups();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateGroup = async (groupId: string, name: string, memberIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.updateGroup(groupId, name, memberIds);
      await refreshGroups();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteGroup = async (groupId: string) => {
    const success = await api.deleteGroup(groupId);
    if (success) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const refreshGroups = async () => {
    const groupsData = await api.getGroups();
    setGroups(groupsData);
  };

  const refreshNotifications = async () => {
    const notificationsData = await api.getNotifications();
    setNotifications(notificationsData);
  };

  const acceptEventInvite = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !notification.eventId || !currentUser) return;

    // 내 일정에 추가
    const event = todos.find(t => t.id === notification.eventId);
    if (event) {
      const newTodo: TodoItem = {
        ...event,
        id: `${event.id}_${currentUser.id}_${Date.now()}`,
        userId: currentUser.id,
        isCompleted: false,
      };
      await addTodo(newTodo);
    }

    // 초대 보낸 사람에게 수락 알림 전송
    await api.sendNotificationResponse(notificationId, 'accept');
    
    // 알림 업데이트
    await refreshNotifications();
  };

  const rejectEventInvite = async (notificationId: string) => {
    // 초대 보낸 사람에게 거절 알림 전송
    await api.sendNotificationResponse(notificationId, 'reject');
    
    // 알림 업데이트
    await refreshNotifications();
  };

  const acceptFriendInvite = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // 친구 관계 맺기
    await api.acceptFriendNotification(notification.fromUserId);
    
    // 초대 보낸 사람에게 수락 알림 전송
    await api.sendNotificationResponse(notificationId, 'accept');
    
    // 친구 목록 및 알림 업데이트
    await refreshFriends();
    await refreshNotifications();
  };

  const rejectFriendInvite = async (notificationId: string) => {
    // 초대 보낸 사람에게 거절 알림 전송
    await api.sendNotificationResponse(notificationId, 'reject');
    
    // 알림 업데이트
    await refreshNotifications();
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        records,
        comments,
        journals,
        journalComments,
        isLoading,
        currentUser,
        friends,
        receivedFriendRequests,
        sentFriendRequests,
        groups,
        notifications,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoComplete,
        addRecord,
        addComment,
        deleteComment,
        updateJournal,
        addJournalComment,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        refreshFriends,
        createGroup,
        updateGroup,
        deleteGroup,
        refreshGroups,
        acceptEventInvite,
        rejectEventInvite,
        acceptFriendInvite,
        rejectFriendInvite,
        refreshNotifications,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}