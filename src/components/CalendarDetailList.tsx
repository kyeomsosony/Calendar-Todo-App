import { Event, TodoItem, User } from '../types/todo';
import { Camera, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState } from 'react';
import { EventItem } from './EventItem';
import { TodoItem as TodoItemComponent } from './TodoItem';

interface CalendarDetailListProps {
  selectedDate: Date;
  events: Event[];
  todos: TodoItem[];
  onEventClick?: (event: Event) => void;
  onTodoClick?: (todo: TodoItem) => void;
  onEditEvent?: (event: Event) => void;
  onEditTodo?: (todo: TodoItem) => void;
  onToggleComplete?: (id: string) => void;
  canComplete?: boolean;
  isGroupView?: boolean;
  users?: User[];
  currentUserId?: string;
}

export function CalendarDetailList({ 
  selectedDate, 
  events, 
  todos, 
  onEventClick, 
  onTodoClick, 
  onEditEvent,
  onEditTodo,
  onToggleComplete,
  canComplete = true,
  isGroupView = false, 
  users = [],
  currentUserId = 'me'
}: CalendarDetailListProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'todos'>('events');

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const dateKey = formatDateKey(selectedDate);
  
  const dayEvents = events.filter(e => e.date === dateKey);
  
  const dayTodos = todos.filter(todo => {
    if (!todo.date) return false;
    
    // yyyy-MM-dd 형식 (예: 2025-11-11)
    if (todo.date === dateKey) return true;
    
    // MM/DD or MM.DD 형식 (레거시 데이터 지원)
    const legacyMatch = todo.date.match(/(\d{1,2})[./](\d{1,2})/);
    if (legacyMatch) {
      const [_, m, d] = legacyMatch;
      return selectedDate.getMonth() + 1 === parseInt(m) && selectedDate.getDate() === parseInt(d);
    }
    
    return false;
  });

  const formatDate = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* 날짜 헤더 */}
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm text-gray-900">{formatDate(selectedDate)}</h3>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-4 text-sm transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            이벤트 ({dayEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`py-3 px-4 text-sm transition-colors border-b-2 ${
              activeTab === 'todos'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            투두 ({dayTodos.length})
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'events' ? (
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">이벤트가 없습니다</p>
            ) : (
              dayEvents.map((event) => {
                const author = users.find(u => u.id === event.userId);
                const canEdit = event.userId === currentUserId;
                
                return (
                  <EventItem
                    key={event.id}
                    event={event}
                    onSelectEvent={onEventClick || (() => {})}
                    onEdit={onEditEvent || (() => {})}
                    showAuthor={isGroupView}
                    author={author}
                    canEdit={canEdit}
                  />
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dayTodos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">투두가 없습니다</p>
            ) : (
              dayTodos.map((todo) => {
                const author = users.find(u => u.id === todo.userId);
                const canEditTodo = todo.userId === currentUserId;
                
                return (
                  <TodoItemComponent
                    key={todo.id}
                    todo={todo}
                    canComplete={canComplete}
                    onToggleComplete={onToggleComplete || (() => {})}
                    onSelectTodo={onTodoClick || (() => {})}
                    onEdit={onEditTodo || (() => {})}
                    showAuthor={isGroupView}
                    author={author}
                    isPastDue={false}
                    canEdit={canEditTodo}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}