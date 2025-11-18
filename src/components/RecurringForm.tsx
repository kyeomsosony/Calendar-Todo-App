import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { RecurringType, RecurringInfo } from '../types/todo';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { InlineCalendar } from './InlineCalendar';

interface RecurringFormProps {
  value: RecurringInfo | undefined;
  onChange: (value: RecurringInfo | undefined) => void;
  onBack: () => void;
}

export function RecurringForm({ value, onChange, onBack }: RecurringFormProps) {
  const [selectedType, setSelectedType] = useState<RecurringType>(value?.type || 'none');
  const [endDate, setEndDate] = useState<Date | undefined>(
    value?.endDate ? new Date(value.endDate) : undefined
  );
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // value가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setSelectedType(value?.type || 'none');
    setEndDate(value?.endDate ? new Date(value.endDate) : undefined);
  }, [value]);

  const recurringOptions: { value: RecurringType; label: string }[] = [
    { value: 'none', label: '반복 안 함' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'weekdays', label: '주중' },
    { value: 'monthly', label: '매월' },
    { value: 'yearly', label: '매년' },
    { value: 'custom', label: '사용자 설정' },
  ];

  const handleSave = () => {
    if (selectedType === 'none') {
      onChange(undefined);
    } else {
      onChange({
        type: selectedType,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      });
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 py-4 pb-20">
        {/* 반복 종류 선택 */}
        <div className="space-y-3">
          <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as RecurringType)}>
            {recurringOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-4 rounded-lg"
              >
                <span className="text-base">{option.label}</span>
                <RadioGroupItem value={option.value} />
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* 구분선 */}
        {selectedType !== 'none' && (
          <>
            <div className="border-t my-6"></div>

            {/* 반복 종료 */}
            <div className="space-y-3">
              <div className="space-y-0">
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-gray-600 w-16">반복 종료</Label>
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                      className={`w-40 justify-center text-center border-gray-200 hover:bg-gray-100 ${
                        showEndDatePicker ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-50'
                      }`}
                    >
                      {endDate ? format(endDate, 'yyyy. M. d.', { locale: ko }) : '종료 날짜 선택'}
                    </Button>
                  </div>
                </div>
                {showEndDatePicker && (
                  <InlineCalendar
                    selectedDate={endDate || new Date()}
                    onSelectDate={(date) => {
                      setEndDate(date);
                      setShowEndDatePicker(false);
                    }}
                  />
                )}
              </div>
              {endDate && (
                <Button
                  variant="ghost"
                  onClick={() => setEndDate(undefined)}
                  className="w-full text-sm text-gray-500"
                >
                  종료 날짜 제거
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-6 pt-4 border-t bg-white mt-auto">
        <Button onClick={handleSave} className="w-full bg-black text-white hover:bg-gray-900">
          완료
        </Button>
      </div>
    </div>
  );
}