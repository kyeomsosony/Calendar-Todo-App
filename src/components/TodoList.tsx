import { TodoItem as TodoItemType, DateCategory, User } from '../types/todo';
import { TodoItem } from './TodoItem';
import { EventItem } from './EventItem';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TodoListProps {
  todos: TodoItemType[];
  canComplete: boolean;
  onToggleComplete: (id: string) => void;
  onSelectTodo: (todo: TodoItemType) => void;
  onEdit: (todo: TodoItemType) => void;
  isGroupView?: boolean;
  users?: User[];
  currentUserId?: string;
}

export function TodoList({ todos, canComplete, onToggleComplete, onSelectTodo, onEdit, isGroupView = false, users = [], currentUserId = 'me' }: TodoListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['todayEvents', 'todayTodos'])
  );

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // 시간을 분 단위로 변환하는 헬퍼 함수
  const timeToMinutes = (todo: TodoItemType): number => {
    // startTime을 우선적으로 사용, 없으면 time 사용
    const timeStr = todo.startTime || todo.time;
    if (!timeStr) return 9999; // 시간이 없는 경우 맨 뒤로
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 9999;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  };

  const categorizeTodos = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      todayEvents: [] as TodoItemType[],
      todayTodos: [] as TodoItemType[],
    };

    console.log('🟡 TodoList - categorizeTodos - today:', today);
    console.log('🟡 TodoList - categorizeTodos - todos.length:', todos.length);

    todos.forEach((todo) => {
      // 이벤트는 오늘 날짜만 체크
      if (todo.type === 'event') {
        const isToday = !todo.date || (() => {
          // yyyy-MM-dd 형식 (예: 2025-11-11)
          const isoMatch = todo.date?.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (isoMatch) {
            const [_, year, month, day] = isoMatch;
            const todoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            todoDate.setHours(0, 0, 0, 0);
            return todoDate.getTime() === today.getTime();
          }
          
          // MM/DD or MM.DD 형식
          const dateMatch = todo.date?.match(/(\d{1,2})[./](\d{1,2})/);
          if (dateMatch) {
            const [_, month, day] = dateMatch;
            const todoMonth = parseInt(month);
            const todoDay = parseInt(day);
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            return todoMonth === currentMonth && todoDay === currentDay;
          }
          
          return false;
        })();

        if (isToday) {
          categorized.todayEvents.push(todo);
        }
      } else {
        // 투두는 오늘 또는 과거의 미완료 투두를 포함
        const checkDate = (dateStr?: string) => {
          if (!dateStr) return { isToday: true, isPast: false };
          
          // yyyy-MM-dd 형식
          const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (isoMatch) {
            const [_, year, month, day] = isoMatch;
            const todoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            todoDate.setHours(0, 0, 0, 0);
            const isToday = todoDate.getTime() === today.getTime();
            const isPast = todoDate.getTime() < today.getTime();
            return { isToday, isPast };
          }
          
          // MM/DD or MM.DD 형식
          const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})/);
          if (dateMatch) {
            const [_, month, day] = dateMatch;
            const todoMonth = parseInt(month);
            const todoDay = parseInt(day);
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            const todoDate = new Date(today.getFullYear(), todoMonth - 1, todoDay);
            todoDate.setHours(0, 0, 0, 0);
            const isToday = todoMonth === currentMonth && todoDay === currentDay;
            const isPast = todoDate.getTime() < today.getTime();
            return { isToday, isPast };
          }
          
          return { isToday: false, isPast: false };
        };

        const { isToday, isPast } = checkDate(todo.date);
        
        // 오늘 투두 또는 (과거 투두 && 미완료 && 완료 상태가 아닌 것)
        if (isToday || (isPast && !todo.isCompleted)) {
          categorized.todayTodos.push(todo);
        }
      }
    });

    console.log('🟢 TodoList - todayEvents.length:', categorized.todayEvents.length);
    console.log('🟢 TodoList - todayTodos.length:', categorized.todayTodos.length);

    // 시간 순으로 정렬 (종일 이벤트는 맨 앞에)
    categorized.todayEvents.sort((a, b) => {
      // 종일 이벤트는 맨 앞에
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      if (a.isAllDay && b.isAllDay) return 0;
      
      // 시간으로 정렬
      return timeToMinutes(a) - timeToMinutes(b);
    });

    // 투두 정렬: 날짜순(과거->오늘), 같은 날짜 내에서는 시간순
    categorized.todayTodos.sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const getDateTimestamp = (dateStr?: string): number => {
        if (!dateStr) return today.getTime();
        
        // yyyy-MM-dd 형식
        const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (isoMatch) {
          const [_, year, month, day] = isoMatch;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }
        
        // MM/DD or MM.DD 형식
        const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})/);
        if (dateMatch) {
          const [_, month, day] = dateMatch;
          const date = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }
        
        return today.getTime();
      };
      
      const aDate = getDateTimestamp(a.date);
      const bDate = getDateTimestamp(b.date);
      
      // 날짜가 다르면 날짜순 정렬 (과거가 먼저)
      if (aDate !== bDate) {
        return aDate - bDate;
      }
      
      // 같은 날짜면 시간순 정렬
      return timeToMinutes(a) - timeToMinutes(b);
    });

    return categorized;
  };

  const categorized = categorizeTodos();
  const sections: Array<{ key: string; label: string }> = [
    { key: 'todayEvents', label: '오늘의 이벤트' },
    { key: 'todayTodos', label: '오늘의 투두' },
  ];

  return (
    <div className="flex-1 bg-gray-50 px-6 py-6 space-y-6 overflow-y-auto">
      {sections.map(({ key, label }) => {
        const sectionTodos = categorized[key as keyof typeof categorized];
        const isExpanded = expandedSections.has(key);

        return (
          <div key={key} className="space-y-3">
            <button
              onClick={() => toggleSection(key)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              <span>{label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
            
            {isExpanded && sectionTodos.length > 0 && (
              <div className="space-y-2">
                {sectionTodos.map((todo) => {
                  const author = users.find(u => u.id === todo.userId);
                  
                  // 이벤트 타입은 EventItem으로 렌더링
                  if (todo.type === 'event') {
                    const canEdit = todo.userId === currentUserId;
                    return (
                      <EventItem
                        key={todo.id}
                        event={todo}
                        onSelectEvent={onSelectTodo}
                        onEdit={onEdit}
                        showAuthor={isGroupView}
                        author={author}
                        canEdit={canEdit}
                      />
                    );
                  }
                  
                  // 투두 타입은 TodoItem으로 렌더링
                  // 과거 투두인지 체크
                  const isPastDue = (() => {
                    if (!todo.date) return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // yyyy-MM-dd 형식
                    const isoMatch = todo.date.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                    if (isoMatch) {
                      const [_, year, month, day] = isoMatch;
                      const todoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      todoDate.setHours(0, 0, 0, 0);
                      return todoDate.getTime() < today.getTime() && !todo.isCompleted;
                    }
                    
                    // MM/DD or MM.DD 형식
                    const dateMatch = todo.date.match(/(\d{1,2})[./](\d{1,2})/);
                    if (dateMatch) {
                      const [_, month, day] = dateMatch;
                      const todoDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
                      todoDate.setHours(0, 0, 0, 0);
                      return todoDate.getTime() < today.getTime() && !todo.isCompleted;
                    }
                    
                    return false;
                  })();
                  
                  const canEditTodo = todo.userId === currentUserId;
                  return (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      canComplete={canComplete}
                      onToggleComplete={onToggleComplete}
                      onSelectTodo={onSelectTodo}
                      onEdit={onEdit}
                      showAuthor={isGroupView}
                      author={author}
                      isPastDue={isPastDue}
                      canEdit={canEditTodo}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}