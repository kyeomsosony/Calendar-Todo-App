import { useState } from 'react';
import { ProfileFilter } from '../components/ProfileFilter';
import { MonthCalendar } from '../components/MonthCalendar';
import { WeekCalendar } from '../components/WeekCalendar';
import { CalendarDetailList } from '../components/CalendarDetailList';
import { TodoDetailDialog } from '../components/TodoDetailDialog';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { CreateTodoDialog } from '../components/CreateTodoDialog';
import { NotificationPanel, NotificationBadge } from '../components/NotificationPanel';
import { useTodos } from '../contexts/TodoContext';
import { Event, TodoItem } from '../types/todo';
import { Grid3x3, Bell } from 'lucide-react';

export function CalendarPage() {
  const { todos, records, comments, updateTodo, addRecord, addComment, deleteComment, deleteTodo, currentUser, friends, groups, notifications } = useTodos();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<'events' | 'completion'>('events');
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<'todo' | 'event'>('todo');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Set current user as selected when loaded
  if (selectedId === null && currentUser) {
    setSelectedId(currentUser.id);
  }

  // Create user list with current user, friends, and groups
  const friendUsers = friends.map(f => ({
    id: f.friendId,
    name: f.friendName,
    email: f.friendEmail,
    avatar: f.friendAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    color: '#10b981',
  }));
  const groupUsers = groups.map(g => ({
    id: g.id,
    name: g.name,
    avatar: g.avatar,
    isGroup: true,
    color: g.color || '#8b5cf6',
  }));
  const allUsers = currentUser ? [currentUser, ...groupUsers, ...friendUsers] : [];

  const selectedGroup = groups.find((g) => g.id === selectedId);
  const isViewingOwnCalendar = currentUser && selectedId === currentUser.id;
  const isGroupView = !!selectedGroup;

  // 선택된 사용자/그룹의 이벤트/투두 필터링
  const filteredEvents = todos.filter((todo) => {
    // 이벤트 타입만 필터��
    if (todo.type !== 'event') return false;

    if (currentUser && selectedId === currentUser.id) {
      return todo.userId === currentUser.id;
    }
    
    // 그룹 뷰: 그룹의 모든 멤버의 공개 일정 표시
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedId);
      if (group) {
        return todo.isPublic && group.memberIds.includes(todo.userId);
      }
    }
    
    // 개인 뷰 (친구)
    return todo.userId === selectedId && todo.isPublic;
  });

  const filteredTodos = todos.filter((todo) => {
    // 투두 타입만 필터링
    if (todo.type !== 'todo') return false;

    if (currentUser && selectedId === currentUser.id) {
      return todo.userId === currentUser.id;
    }
    
    // 그룹 뷰: 그룹의 모든 멤버의 공개 일정 표시
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedId);
      if (group) {
        return todo.isPublic && group.memberIds.includes(todo.userId);
      }
    }
    
    // 개인 뷰 (친구)
    return todo.userId === selectedId && todo.isPublic;
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode('week');
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const handleWeekChange = (increment: number) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + increment * 7);
    setSelectedDate(newDate);
  };

  const handleBackToMonth = () => {
    setViewMode('month');
    setSelectedDate(null);
  };

  const handleTodoClick = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setIsDialogOpen(true);
  };

  const handleSaveTodo = (updatedTodo: TodoItem) => {
    updateTodo(updatedTodo);
  };

  const handleAddComment = (todoId: string, content: string) => {
    addComment(todoId, content);
  };

  const handleAddRecord = (todoId: string, type: 'photo' | 'thought', content?: string, photoUrl?: string) => {
    addRecord(todoId, type, content, photoUrl);
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsDialogOpen(false);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todoId);
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      // 수정 모드였다면 상세 페이지 다시 열기
      if (editingTodo) {
        // 수정된 todo를 다시 가져오기 위해 약간의 지연
        setTimeout(() => {
          const updatedTodo = todos.find(t => t.id === editingTodo.id);
          if (updatedTodo) {
            setSelectedTodo(updatedTodo);
            setIsDialogOpen(true);
          }
        }, 100);
      }
      setEditingTodo(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white pb-16">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <Grid3x3 className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <NotificationBadge count={notifications.filter(n => n.status === 'pending').length} />
          </button>
        </div>

        {/* 프로필 필터 */}
        <ProfileFilter
          users={allUsers}
          groups={groups}
          selectedId={selectedId || ''}
          onSelect={setSelectedId}
        />
      </div>

      {/* 캘린더 뷰 */}
      {viewMode === 'month' ? (
        <div className="flex-1 overflow-y-auto">
          <MonthCalendar
            currentDate={currentDate}
            events={filteredEvents}
            todos={filteredTodos}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            viewMode={calendarViewMode}
            onViewModeChange={setCalendarViewMode}
            isGroupView={isGroupView}
            users={allUsers}
          />
        </div>
      ) : (
        <>
          <WeekCalendar
            selectedDate={selectedDate || new Date()}
            onDateSelect={setSelectedDate}
            onWeekChange={handleWeekChange}
            onBackToMonth={handleBackToMonth}
            todos={filteredTodos}
            events={filteredEvents}
            users={allUsers}
          />
          <CalendarDetailList
            selectedDate={selectedDate || new Date()}
            events={filteredEvents}
            todos={filteredTodos}
            onEventClick={handleTodoClick}
            onTodoClick={handleTodoClick}
            onEditEvent={handleEditTodo}
            onEditTodo={handleEditTodo}
            onToggleComplete={(id) => {
              const todo = todos.find(t => t.id === id);
              if (todo && isViewingOwnCalendar) {
                updateTodo({ ...todo, isCompleted: !todo.isCompleted });
              }
            }}
            canComplete={isViewingOwnCalendar}
            isGroupView={isGroupView}
            users={allUsers}
            currentUserId={currentUser?.id || 'me'}
          />
        </>
      )}

      {/* 투두 상세 다이얼로그 */}
      <TodoDetailDialog
        todo={selectedTodo}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        canEdit={isViewingOwnCalendar && currentUser && selectedTodo?.userId === currentUser.id}
        records={records}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={deleteComment}
        onAddRecord={handleAddRecord}
        onDelete={handleDeleteTodo}
        onEdit={handleEditTodo}
      />

      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton
        onCreateEvent={() => {
          setCreateDialogType('event');
          setIsCreateDialogOpen(true);
        }}
        onCreateTodo={() => {
          setCreateDialogType('todo');
          setIsCreateDialogOpen(true);
        }}
      />

      {/* 일정 등록 다이얼로그 */}
      <CreateTodoDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseCreateDialog}
        defaultType={createDialogType}
        editTodo={editingTodo}
      />

      {/* 알림 패널 */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}