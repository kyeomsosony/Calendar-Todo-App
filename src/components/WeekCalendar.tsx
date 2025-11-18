import { ChevronLeft, ChevronRight } from "lucide-react";
import { TodoItem, User } from "../types/todo";

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onWeekChange: (increment: number) => void;
  onBackToMonth: () => void;
  todos: TodoItem[];
  events: TodoItem[];
  users?: User[];
}

export function WeekCalendar({
  selectedDate,
  onDateSelect,
  onWeekChange,
  onBackToMonth,
  todos,
  events,
  users = [],
}: WeekCalendarProps) {
  // 선택된 날짜가 포함된 주의 일요일 구하기
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  };

  const weekStart = getWeekStart(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getTodosForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return todos.filter((todo) => {
      if (!todo.date) return false;

      // yyyy-MM-dd 형식 (예: 2025-11-11)
      if (todo.date === dateKey) return true;

      // MM/DD or MM.DD 형식 (레거시 데이터 지원)
      const legacyMatch = todo.date.match(
        /(\d{1,2})[./](\d{1,2})/,
      );
      if (legacyMatch) {
        const [_, m, d] = legacyMatch;
        return (
          date.getMonth() + 1 === parseInt(m) &&
          date.getDate() === parseInt(d)
        );
      }

      return false;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return events.filter((event) => {
      if (!event.date) return false;

      // yyyy-MM-dd 형식 (예: 2025-11-11)
      if (event.date === dateKey) return true;

      // MM/DD or MM.DD 형식 (레거시 데이터 지원)
      const legacyMatch = event.date.match(
        /(\d{1,2})[./](\d{1,2})/,
      );
      if (legacyMatch) {
        const [_, m, d] = legacyMatch;
        return (
          date.getMonth() + 1 === parseInt(m) &&
          date.getDate() === parseInt(d)
        );
      }

      return false;
    });
  };

  const getCompletionRate = (date: Date) => {
    const dateTodos = getTodosForDate(date);
    if (dateTodos.length === 0) return null;

    const completedCount = dateTodos.filter(
      (t) => t.isCompleted,
    ).length;
    const totalCount = dateTodos.length;
    const rate = Math.round(
      (completedCount / totalCount) * 100,
    );

    return {
      rate,
      completed: completedCount,
      total: totalCount,
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  return (
    <div className="bg-white border-b border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBackToMonth}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← 월간으로
        </button>
        <h2 className="text-lg">{formatMonth(selectedDate)}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(-1)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onWeekChange(1)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 주간 날짜 */}
      <div className="grid grid-cols-7 px-2">
        {weekDays.map((date, index) => {
          const dayNames = [
            "일",
            "월",
            "화",
            "수",
            "목",
            "금",
            "토",
          ];
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const completionData = getCompletionRate(date);
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;

          // 첫 번째 이벤트의 색상 가져오기 (MonthCalendar와 동일한 로직)
          let eventDotColor = '#3b82f6'; // 기본 파란색
          if (hasEvents && dayEvents[0]) {
            const firstEvent = dayEvents[0];
            const userColor = users.find(u => u.id === firstEvent.userId)?.color;
            const eventColor = ('color' in firstEvent && firstEvent.color) 
              ? firstEvent.color 
              : userColor || '#3b82f6';
            eventDotColor = eventColor;
          }

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center py-3 rounded-lg transition-colors ${
                isSelectedDate
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="text-xs text-gray-500 mb-1">
                {dayNames[index]}
              </span>
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* 완수율 원형 배경 */}
                {completionData && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        completionData.rate === 100
                          ? "#10b981"
                          : `conic-gradient(
                            ${completionData.rate >= 50 ? "#3b82f6" : "#f59e0b"} ${completionData.rate * 3.6}deg,
                            #e5e7eb ${completionData.rate * 3.6}deg
                          )`,
                    }}
                  />
                )}
                {/* 날짜 텍스트 */}
                <span
                  className={`relative text-sm w-10 h-10 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? "bg-black text-white"
                      : completionData
                        ? "bg-white"
                        : isSelectedDate
                          ? "bg-gray-200"
                          : ""
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              {/* 이벤트 점 표시 */}
              {hasEvents && (
                <div 
                  className="w-1 h-1 rounded-full mt-2" 
                  style={{ backgroundColor: eventDotColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}