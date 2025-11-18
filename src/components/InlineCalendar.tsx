import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, setMonth, setYear, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface InlineCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose?: () => void;
}

export function InlineCalendar({ selectedDate, onSelectDate, onClose }: InlineCalendarProps) {
  // 유효한 날짜인지 확인하고, 아니면 오늘 날짜 사용
  const validDate = isValid(selectedDate) ? selectedDate : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(validDate);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(currentMonth.getMonth());
  
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 첫 번째 날의 요일 (0 = 일요일)
  const firstDayOfWeek = monthStart.getDay();

  // 빈 칸 채우기
  const emptyDays = Array(Math.max(0, firstDayOfWeek)).fill(null);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleMonthClick = () => {
    if (!showMonthPicker) {
      setSelectedYear(currentMonth.getFullYear());
      setSelectedMonthNum(currentMonth.getMonth());
    }
    setShowMonthPicker(!showMonthPicker);
  };

  const handleMonthPickerConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonthNum);
    setCurrentMonth(newDate);
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

  // 외부 클릭 감지 - 월 선택기
  useEffect(() => {
    if (!showMonthPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

  return (
    <div ref={containerRef} className="p-4 relative bg-[rgba(0,0,0,0)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleMonthClick}
          className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
        >
          <span className="text-lg">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
          <ChevronDown className="w-5 h-5 text-black" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* 월 선택기 (스크롤 휠 스타일) */}
      {showMonthPicker && (
        <div ref={monthPickerRef} className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg border overflow-hidden z-20">
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
      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center py-2 text-sm ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {daysInMonth.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dayOfWeek = day.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                aspect-square flex items-center justify-center rounded-full text-lg transition-colors
                ${isSelected 
                  ? 'bg-black text-white hover:bg-gray-900' 
                  : isToday
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'hover:bg-gray-50'
                }
                ${!isSelected && isSunday ? 'text-red-500' : ''}
                ${!isSelected && isSaturday ? 'text-blue-500' : ''}
                ${!isSelected && !isSunday && !isSaturday ? 'text-gray-900' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}