import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Reminder } from '../types/todo';
import { Bell, X } from 'lucide-react';

interface ReminderFormProps {
  value: Reminder[] | undefined;
  onChange: (value: Reminder[]) => void;
  onBack: () => void;
}

const reminderOptions = [
  { minutes: 0, label: '정시' },
  { minutes: 5, label: '5분 전' },
  { minutes: 15, label: '15분 전' },
  { minutes: 30, label: '30분 전' },
  { minutes: 60, label: '1시간 전' },
  { minutes: 120, label: '2시간 전' },
  { minutes: 1440, label: '1일 전' },
  { minutes: 2880, label: '2일 전' },
];

export function ReminderForm({ value, onChange, onBack }: ReminderFormProps) {
  const [reminders, setReminders] = useState<Reminder[]>(value || []);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days' | 'weeks'>('minutes');

  // reminders 상태가 변경될 때마다 자동으로 onChange 호출
  useEffect(() => {
    onChange(reminders);
  }, [reminders, onChange]);

  const handleAddReminder = (minutes: number, label: string) => {
    if (reminders.length >= 3) return; // 최대 3개 제한

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      minutes,
      label,
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
  };

  const handleRemoveReminder = (id: string) => {
    const updatedReminders = reminders.filter((r) => r.id !== id);
    setReminders(updatedReminders);
  };

  const handleAddCustomReminder = () => {
    if (!customValue || parseInt(customValue) <= 0 || reminders.length >= 3) return;

    const value = parseInt(customValue);
    let minutes = 0;
    let label = '';

    switch (customUnit) {
      case 'minutes':
        minutes = value;
        label = `${value}분 전`;
        break;
      case 'hours':
        minutes = value * 60;
        label = `${value}시간 전`;
        break;
      case 'days':
        minutes = value * 1440;
        label = `${value}일 전`;
        break;
      case 'weeks':
        minutes = value * 10080;
        label = `${value}주 전`;
        break;
    }

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      minutes,
      label,
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    setShowCustomInput(false);
    setCustomValue('');
    setCustomUnit('minutes');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 py-4 px-6">
        {/* 추가된 알림 목록 */}
        {reminders.length > 0 && (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="text-base">{reminder.label}</span>
                </div>
                <button
                  onClick={() => handleRemoveReminder(reminder.id)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 알림 추가 버튼들 */}
        {reminders.length < 3 && (
          <>
            {reminders.length > 0 && <div className="border-t my-6"></div>}
            <div className="space-y-2">
              {reminderOptions
                .filter(
                  (option) =>
                    !reminders.some((r) => r.minutes === option.minutes)
                )
                .map((option) => (
                  <button
                    key={option.minutes}
                    onClick={() => handleAddReminder(option.minutes, option.label)}
                    className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-base">{option.label}</span>
                  </button>
                ))}
              
              {/* 사용자 지정 버튼/입력 */}
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-base">사용자 지정</span>
                </button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="숫자 입력"
                      className="flex-1"
                    />
                    <Select value={customUnit} onValueChange={(value: 'minutes' | 'hours' | 'days' | 'weeks') => setCustomUnit(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">분</SelectItem>
                        <SelectItem value="hours">시간</SelectItem>
                        <SelectItem value="days">일</SelectItem>
                        <SelectItem value="weeks">주</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomValue('');
                        setCustomUnit('minutes');
                      }}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleAddCustomReminder}
                      disabled={!customValue || parseInt(customValue) <= 0}
                      className="flex-1 bg-black text-white hover:bg-gray-900"
                    >
                      추가
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {reminders.length >= 3 && (
          <div className="text-sm text-gray-500 text-center py-4">
            최대 3개까지만 추가할 수 있습니다
          </div>
        )}
      </div>
    </div>
  );
}
