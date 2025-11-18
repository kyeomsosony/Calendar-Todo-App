import { useState, useEffect, useRef } from 'react';

interface InlineTimePickerProps {
  value: { hour: number; minute: number };
  onChange: (value: { hour: number; minute: number }) => void;
}

export function InlineTimePicker({ value, onChange }: InlineTimePickerProps) {
  // 시간을 오전/오후, 시, 분으로 파싱
  const parseTime = (timeValue: { hour: number; minute: number }) => {
    if (!timeValue) return { period: '오전', hour: 9, minute: 0 };
    
    const hour24 = timeValue.hour;
    const minute = timeValue.minute;
    
    // 5분 단위로 반올림
    const roundedMinute = Math.round(minute / 5) * 5;
    
    const period = hour24 < 12 ? '오전' : '오후';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    
    return { period, hour: hour12, minute: roundedMinute };
  };

  const { period, hour, minute } = parseTime(value);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  const periodRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const periods = ['오전', '오후'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // 스크롤 시 선택된 값 업데이트
  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: (string | number)[],
    setter: (value: any) => void
  ) => {
    if (!ref.current) return;
    
    const container = ref.current;
    const itemHeight = 56; // h-14 = 56px
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    
    setter(items[Math.max(0, Math.min(index, items.length - 1))]);
  };

  // 선택된 값으로 스크롤
  const scrollToValue = (
    ref: React.RefObject<HTMLDivElement>,
    items: (string | number)[],
    value: string | number
  ) => {
    if (!ref.current) return;
    
    const index = items.indexOf(value);
    if (index !== -1) {
      const itemHeight = 56; // h-14 = 56px
      ref.current.scrollTop = index * itemHeight;
    }
  };

  // 초기 스크롤 위치 설정
  useEffect(() => {
    setTimeout(() => {
      scrollToValue(periodRef, periods, selectedPeriod);
      scrollToValue(hourRef, hours, selectedHour);
      scrollToValue(minuteRef, minutes, selectedMinute);
    }, 100);
  }, []);

  // 값이 변경될 때마다 onChange 호출
  useEffect(() => {
    let hour24 = selectedHour;
    if (selectedPeriod === '오후' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === '오전' && selectedHour === 12) {
      hour24 = 0;
    }
    
    const timeValue = { hour: hour24, minute: selectedMinute };
    onChange(timeValue);
  }, [selectedPeriod, selectedHour, selectedMinute]);

  return (
    <div className="bg-white rounded-lg overflow-hidden mt-2 py-6">
      <div className="flex h-64 relative">
        {/* 중앙 선택 영역 표시 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-full h-14 border-y-2 border-gray-200 mx-4"></div>
        </div>

        {/* 그라데이션 페이드 */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/90 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
        </div>

        {/* 오전/오후 */}
        <div
          ref={periodRef}
          className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          onScroll={() => handleScroll(periodRef, periods, setSelectedPeriod)}
        >
          <div className="h-[100px]"></div>
          {periods.map((p) => (
            <div
              key={p}
              className="h-14 flex items-center justify-center cursor-pointer snap-center transition-all"
              onClick={() => {
                setSelectedPeriod(p);
                scrollToValue(periodRef, periods, p);
              }}
            >
              <span className={`transition-all ${
                p === selectedPeriod 
                  ? 'text-black' 
                  : 'text-gray-400'
              }`}>
                {p}
              </span>
            </div>
          ))}
          <div className="h-[100px]"></div>
        </div>

        {/* 시 */}
        <div
          ref={hourRef}
          className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          onScroll={() => handleScroll(hourRef, hours, setSelectedHour)}
        >
          <div className="h-[100px]"></div>
          {hours.map((h) => (
            <div
              key={h}
              className="h-14 flex items-center justify-center cursor-pointer snap-center transition-all"
              onClick={() => {
                setSelectedHour(h);
                scrollToValue(hourRef, hours, h);
              }}
            >
              <span className={`tabular-nums transition-all ${
                h === selectedHour 
                  ? 'text-black' 
                  : 'text-gray-400'
              }`}>
                {h.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
          <div className="h-[100px]"></div>
        </div>

        {/* 구분자 */}
        <div className="flex items-center justify-center w-6">
          <span className="text-gray-400">:</span>
        </div>

        {/* 분 */}
        <div
          ref={minuteRef}
          className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          onScroll={() => handleScroll(minuteRef, minutes, setSelectedMinute)}
        >
          <div className="h-[100px]"></div>
          {minutes.map((m) => (
            <div
              key={m}
              className="h-14 flex items-center justify-center cursor-pointer snap-center transition-all"
              onClick={() => {
                setSelectedMinute(m);
                scrollToValue(minuteRef, minutes, m);
              }}
            >
              <span className={`tabular-nums transition-all ${
                m === selectedMinute 
                  ? 'text-black' 
                  : 'text-gray-400'
              }`}>
                {m.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
          <div className="h-[100px]"></div>
        </div>
      </div>
    </div>
  );
}