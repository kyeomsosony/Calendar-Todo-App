import { Event, TodoItem, User } from '../types/todo';
import { ChevronLeft, ChevronRight, Calendar, BarChart3, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MonthCalendarProps {
  currentDate: Date;
  events: (Event | TodoItem)[]; // TodoItem도 받을 수 있도록 수정
  todos: TodoItem[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (increment: number) => void;
  viewMode: 'events' | 'completion';
  onViewModeChange: (mode: 'events' | 'completion') => void;
  isGroupView?: boolean;
  users?: User[];
}

export function MonthCalendar({ currentDate, events, todos, onDateSelect, onMonthChange, viewMode, onViewModeChange, isGroupView = false, users = [] }: MonthCalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 월 선택기 상태
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonthNum, setSelectedMonthNum] = useState(month);
  
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  // 2025년 한국 공휴일 (확장 가능)
  const holidays = [
    '2025-01-01', // 신정
    '2025-01-28', '2025-01-29', '2025-01-30', // 설날
    '2025-03-01', // 삼일절
    '2025-05-05', // 어린이날
    '2025-05-06', // 부처님오신날
    '2025-06-06', // 현충일
    '2025-08-15', // 광복절
    '2025-09-06', '2025-09-07', '2025-09-08', // 추석
    '2025-10-03', // 개천절
    '2025-10-09', // 한글날
    '2025-12-25', // 크리스마스
  ];

  // 달력 생성
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // 일요일부터 시작

  const days = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return events.filter(e => e.date === dateKey).slice(0, 3); // 최대 3개
  };

  const getTodosForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return todos.filter(todo => {
      if (!todo.date) return false;
      
      // yyyy-MM-dd 형식 (예: 2025-11-11)
      if (todo.date === dateKey) return true;
      
      // MM/DD or MM.DD 형식 (레거시 데이터 지원)
      const legacyMatch = todo.date.match(/(\d{1,2})[./](\d{1,2})/);
      if (legacyMatch) {
        const [_, m, d] = legacyMatch;
        return date.getMonth() + 1 === parseInt(m) && date.getDate() === parseInt(d);
      }
      
      return false;
    });
  };

  const hasTodosForDate = (date: Date) => {
    return getTodosForDate(date).length > 0;
  };

  const getCompletionRate = (date: Date) => {
    const dateTodos = getTodosForDate(date);
    if (dateTodos.length === 0) return null;
    
    const completedCount = dateTodos.filter(t => t.isCompleted).length;
    const totalCount = dateTodos.length;
    const rate = Math.round((completedCount / totalCount) * 100);
    
    return { rate, completed: completedCount, total: totalCount };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  // 년월 선택기 핸들러
  const handleMonthClick = () => {
    if (!showMonthPicker) {
      setSelectedYear(year);
      setSelectedMonthNum(month);
    }
    setShowMonthPicker(!showMonthPicker);
  };

  const handleMonthPickerConfirm = () => {
    // 현재 날짜와 선택된 날짜의 월 차이 계산
    const currentMonthTotal = year * 12 + month;
    const selectedMonthTotal = selectedYear * 12 + selectedMonthNum;
    const monthDiff = selectedMonthTotal - currentMonthTotal;
    
    onMonthChange(monthDiff);
    setShowMonthPicker(false);
  };

  // 년도 범위 생성 (현재 년도 기준 -10년 ~ +10년)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 스크롤 처리 함수
  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, values: number[], value: number) => {
    if (!ref.current) return;
    const index = values.indexOf(value);
    if (index !== -1) {
      ref.current.scrollTop = index * 48; // 48px = h-12
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    values: number[],
    setter: (value: number) => void
  ) => {
    if (!ref.current) return;
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / 48);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    setter(values[clampedIndex]);
  };

  // 월 선택기가 열릴 때 현재 값으로 스크롤
  useEffect(() => {
    if (showMonthPicker) {
      setTimeout(() => {
        scrollToValue(yearRef, years, selectedYear);
        scrollToValue(monthRef, months, selectedMonthNum);
      }, 50);
    }
  }, [showMonthPicker]);

  return (
    <div className="bg-white h-full flex flex-col relative">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button
          onClick={handleMonthClick}
          className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
        >
          <h2 className="text-lg">
            {year}년 {month + 1}월
          </h2>
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          {/* 뷰 모드 토글 버튼 */}
          <button
            onClick={() => onViewModeChange(viewMode === 'events' ? 'completion' : 'events')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {viewMode === 'events' ? (
              <>
                <Calendar className="w-4 h-4" />
                <span>이벤트 뷰</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>완수율 뷰</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => onMonthChange(-1)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onMonthChange(1)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 월 선택기 (스크롤 휠 스타일) */}
      {showMonthPicker && (
        <div className="absolute top-20 left-6 right-6 bg-white rounded-lg shadow-lg border overflow-hidden z-20">
          <div className="flex h-64 relative">
            {/* 선택 영역 표시 */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 border-y border-gray-200 pointer-events-none z-10"></div>
            
            {/* 년도 */}
            <div
              ref={yearRef}
              className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
              onScroll={() => handleScroll(yearRef, years, setSelectedYear)}
            >
              <div className="h-24"></div>
              {years.map((y) => (
                <div
                  key={y}
                  className="h-12 flex items-center justify-center cursor-pointer snap-center transition-all"
                  onClick={() => {
                    setSelectedYear(y);
                    scrollToValue(yearRef, years, y);
                  }}
                >
                  <span className={`transition-all ${
                    y === selectedYear 
                      ? 'text-black text-2xl' 
                      : 'text-gray-300 text-xl'
                  }`}>
                    {y}년
                  </span>
                </div>
              ))}
              <div className="h-24"></div>
            </div>

            {/* 월 */}
            <div
              ref={monthRef}
              className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
              onScroll={() => handleScroll(monthRef, months, setSelectedMonthNum)}
            >
              <div className="h-24"></div>
              {months.map((m) => (
                <div
                  key={m}
                  className="h-12 flex items-center justify-center cursor-pointer snap-center transition-all"
                  onClick={() => {
                    setSelectedMonthNum(m);
                    scrollToValue(monthRef, months, m);
                  }}
                >
                  <span className={`transition-all ${
                    m === selectedMonthNum 
                      ? 'text-black text-2xl' 
                      : 'text-gray-300 text-xl'
                  }`}>
                    {m + 1}월
                  </span>
                </div>
              ))}
              <div className="h-24"></div>
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="p-3 border-t">
            <button
              onClick={handleMonthPickerConfirm}
              className="w-full bg-black hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition-colors text-center"
            >
              완료
            </button>
          </div>
        </div>
      )}

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center py-2 text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 - flex-1로 남은 공간 채우기 */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1">
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const hasTodos = hasTodosForDate(date);
          const completionData = getCompletionRate(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isHoliday = holidays.includes(formatDateKey(date));
          const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`p-0.5 border-b border-r border-gray-50 hover:bg-gray-50 transition-colors text-left flex flex-col ${
                !isCurrentMonthDate ? 'bg-gray-50/50' : ''
              }`}
            >
              <div className={`text-sm mb-1 flex-shrink-0 ${
                isTodayDate
                  ? 'bg-black text-white w-6 h-6 rounded-full flex items-center justify-center'
                  : !isCurrentMonthDate
                  ? 'text-gray-300 pl-1.5'
                  : isHoliday || dayOfWeek === 0
                  ? 'text-red-500 pl-1.5'
                  : dayOfWeek === 6
                  ? 'text-blue-500 pl-1.5'
                  : 'text-gray-900 pl-1.5'
              }`}>
                {date.getDate()}
              </div>
              
              {viewMode === 'events' ? (
                <>
                  {/* 이벤트 최대 3개 */}
                  <div className="space-y-0.5 flex-1 overflow-hidden">
                    {dayEvents.map((event) => {
                      // color가 없으면 userId로 사용자 색상을 가져옴
                      const userColor = users.find(u => u.id === event.userId)?.color;
                      const eventColor = 'color' in event && event.color 
                        ? event.color 
                        : userColor || '#6b7280'; // 기본 그레이 색상
                      
                      return (
                        <div
                          key={event.id}
                          className="text-xs px-0.5 py-0.5 rounded overflow-hidden whitespace-nowrap"
                          style={{ backgroundColor: eventColor, color: 'white' }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* 완수율 뷰 */}
                  {completionData ? (
                    <div className="flex-1 flex flex-col justify-center items-center">
                      {/* 원형 프로그레스 - 파이 차트 스타일 */}
                      <div 
                        className="relative w-9 h-9 rounded-full overflow-hidden"
                        style={{
                          background: completionData.rate === 100 
                            ? '#10b981'
                            : `conic-gradient(
                                ${completionData.rate >= 50 ? '#3b82f6' : '#f59e0b'} ${completionData.rate * 3.6}deg,
                                #e5e7eb ${completionData.rate * 3.6}deg
                              )`
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {completionData.completed}/{completionData.total}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}