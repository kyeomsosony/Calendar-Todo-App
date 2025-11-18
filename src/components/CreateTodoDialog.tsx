import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { InlineCalendar } from './InlineCalendar';
import { InlineTimePicker } from './InlineTimePicker';
import { Calendar, Clock, Globe, Lock, UserPlus, ChevronDown, FileText, Repeat, Bell, ArrowLeft } from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { RecurringInfo, Reminder, TodoItem } from '../types/todo';
import { RecurringForm } from './RecurringForm';
import { ReminderForm } from './ReminderForm';
import { ShareForm } from './ShareForm';
import { InviteForm } from './InviteForm';

interface CreateTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'todo' | 'event';
  editTodo?: TodoItem | null;
}

type VisibilityType = 'private' | 'public-all' | 'public-specific';
type ViewType = 'main' | 'recurring' | 'reminder' | 'share' | 'invite';

export function CreateTodoDialog({ open, onOpenChange, defaultType = 'todo', editTodo = null }: CreateTodoDialogProps) {
  const { addTodo, updateTodo, currentUser } = useTodos();
  
  // 현재 보기 상태
  const [view, setView] = useState<ViewType>('main');
  
  // 폼 상태
  const [type, setType] = useState<'todo' | 'event'>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0 });
  
  // 공개 설정
  const [visibility, setVisibility] = useState<VisibilityType>('private');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // 참석자 초대
  const [invitedGroups, setInvitedGroups] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  
  // 반복 및 알림 설정
  const [recurring, setRecurring] = useState<RecurringInfo | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // 접힌 상태
  const [showDescription, setShowDescription] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // 포커스 상태
  const [inviteSearchFocused, setInviteSearchFocused] = useState(false);
  const [shareSearchFocused, setShareSearchFocused] = useState(false);

  // 달력/시간 선택 상태
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // 활성화된 달력 (어떤 날짜를 선택 중인지)
  const [activeCalendar, setActiveCalendar] = useState<'start' | 'end' | null>(null);

  // Refs for click outside detection
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);
  const startTimePickerRef = useRef<HTMLDivElement>(null);
  const endTimePickerRef = useRef<HTMLDivElement>(null);
  const todoDatePickerRef = useRef<HTMLDivElement>(null);
  const todoTimePickerRef = useRef<HTMLDivElement>(null);

  // defaultType이 변경될 때 type 업데이트
  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  // 시작 날짜/시간이 변경되면 종료 날짜/시간을 자동으로 1시간 뒤로 설정
  useEffect(() => {
    // 편집 모드가 아닐 때만 자동 업데이트
    if (!editTodo) {
      const newEndDate = new Date(startDate);
      let newEndHour = startTime.hour + 1;
      let newEndMinute = startTime.minute;
      
      // 24시를 넘어가면 다음 날로
      if (newEndHour >= 24) {
        newEndDate.setDate(newEndDate.getDate() + 1);
        newEndHour = newEndHour - 24;
      }
      
      setEndDate(newEndDate);
      setEndTime({ hour: newEndHour, minute: newEndMinute });
    }
  }, [startDate, startTime, editTodo]);

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setView('main');
      
      if (editTodo) {
        // 편집 모드: 기존 데이터로 초기화
        setType(editTodo.type);
        setTitle(editTodo.title);
        setDescription(editTodo.description || '');
        setIsAllDay(editTodo.isAllDay || false);
        setStartDate(new Date(editTodo.startDate || editTodo.date || new Date()));
        setEndDate(new Date(editTodo.endDate || editTodo.startDate || editTodo.date || new Date()));
        
        // 시간 파싱
        if (editTodo.startTime) {
          const [hour, minute] = editTodo.startTime.split(':').map(Number);
          setStartTime({ hour, minute });
        }
        if (editTodo.endTime) {
          const [hour, minute] = editTodo.endTime.split(':').map(Number);
          setEndTime({ hour, minute });
        }
        
        // ���유 설정
        if (editTodo.sharedWith?.includes('all')) {
          setVisibility('public-all');
        } else if (editTodo.sharedWith && editTodo.sharedWith.length > 0 && !editTodo.sharedWith.includes('me')) {
          setVisibility('public-specific');
          const groups = editTodo.sharedWith.filter(id => id.startsWith('group:')).map(id => id.replace('group:', ''));
          const userIds = editTodo.sharedWith.filter(id => !id.startsWith('group:'));
          setSelectedGroups(groups);
          setSelectedUsers(userIds);
        } else {
          setVisibility('private');
        }
        
        // 참석자 초대
        if (editTodo.invitedUsers && editTodo.invitedUsers.length > 0) {
          const groups = editTodo.invitedUsers.filter(id => id.startsWith('group:')).map(id => id.replace('group:', ''));
          const userIds = editTodo.invitedUsers.filter(id => !id.startsWith('group:'));
          setInvitedGroups(groups);
          setInvitedUsers(userIds);
        }
        
        // 반복 및 알림
        setRecurring(editTodo.recurring || null);
        setReminders(editTodo.reminders || []);
        setShowDescription(!!editTodo.description);
      } else {
        // 새 일정 모드: 초기값으로 리셋
        setType(defaultType);
        setTitle('');
        setDescription('');
        setIsAllDay(false);
        setStartDate(new Date());
        setStartTime({ hour: 9, minute: 0 });
        setEndDate(new Date());
        setEndTime({ hour: 10, minute: 0 });
        setVisibility('public-all');
        setSelectedGroups([]);
        setSelectedUsers([]);
        setInvitedGroups([]);
        setInvitedUsers([]);
        setRecurring(null);
        setReminders([]);
        setShowDescription(false);
      }
      setShowInvite(false);
    }
  }, [open, defaultType, editTodo]);

  // 외부 클릭 감지 - 시작 날짜 달력
  useEffect(() => {
    if (!activeCalendar || activeCalendar !== 'start') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target as Node)) {
        setActiveCalendar(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCalendar]);

  // 외부 클릭 감지 - 종료 날짜 달력
  useEffect(() => {
    if (!activeCalendar || activeCalendar !== 'end') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target as Node)) {
        setActiveCalendar(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCalendar]);

  // 외부 클릭 감지 - 시작 시간 선택기
  useEffect(() => {
    if (!showStartTimePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (startTimePickerRef.current && !startTimePickerRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStartTimePicker]);

  // 외부 클릭 감지 - 종료 시간 선택기
  useEffect(() => {
    if (!showEndTimePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target as Node)) {
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEndTimePicker]);

  // 외부 클릭 감지 - 투두 날짜 선택기
  useEffect(() => {
    if (!showStartDatePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (todoDatePickerRef.current && !todoDatePickerRef.current.contains(event.target as Node)) {
        setShowStartDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStartDatePicker]);

  // 외부 클릭 감지 - 투두 시간 선택기
  useEffect(() => {
    if (!showStartTimePicker && type !== 'todo') return;
    if (type !== 'todo') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (todoTimePickerRef.current && !todoTimePickerRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStartTimePicker, type]);

  const handleSubmit = () => {
    if (!title.trim() || !currentUser) return;

    const todoData = {
      id: editTodo?.id || Date.now().toString(),
      title,
      type,
      completed: editTodo?.completed || false,
      isCompleted: editTodo?.completed || false,
      isPublic: visibility !== 'private', // 🔥 중요: isPublic 필드 추가
      date: format(startDate, 'yyyy-MM-dd'),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      isAllDay,
      startTime: !isAllDay ? `${String(startTime.hour).padStart(2, '0')}:${String(startTime.minute).padStart(2, '0')}` : undefined,
      endTime: !isAllDay ? `${String(endTime.hour).padStart(2, '0')}:${String(endTime.minute).padStart(2, '0')}` : undefined,
      userId: editTodo?.userId || currentUser.id,
      hasRecord: editTodo?.hasRecord || false,
      description,
      sharedWith:
        visibility === 'public-all'
          ? ['all']
          : visibility === 'public-specific'
          ? [...selectedGroups.map(id => `group:${id}`), ...selectedUsers]
          : [currentUser.id],
      invitedUsers: [...invitedGroups.map(id => `group:${id}`), ...invitedUsers],
      recurring: recurring || undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    console.log('🟢 CreateTodoDialog - handleSubmit - todoData:', todoData);
    console.log('🟢 CreateTodoDialog - editTodo:', editTodo);

    if (editTodo) {
      console.log('🟡 Updating todo...');
      updateTodo(todoData);
    } else {
      console.log('🟡 Adding new todo...');
      addTodo(todoData);
    }
    
    onOpenChange(false);
  };

  // 초대된 대상 수 계산
  const invitedCount = invitedGroups.length + invitedUsers.length;
  
  // 공개 설정된 대상 수 계산
  const sharedCount = selectedGroups.length + selectedUsers.length;

  // 반복 설정 표시 텍스트
  const getRecurringText = () => {
    if (!recurring) return '없음';
    
    const patterns: { [key: string]: string } = {
      daily: '매일',
      weekly: '매주',
      monthly: '매월',
      yearly: '매년',
    };
    
    return patterns[recurring.pattern] || '사용자 지정';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-screen max-h-screen overflow-y-auto p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            {(view === 'recurring' || view === 'reminder' || view === 'share' || view === 'invite') && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setView('main')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <DialogTitle>
              {view === 'main' ? '새 일정' : view === 'recurring' ? '반복' : view === 'reminder' ? '알림' : view === 'share' ? '공유' : '참석자 초대'}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {view === 'main' ? '새로운 일정을 작성합니다' : view === 'recurring' ? '반복 설정을 구성합니다' : view === 'reminder' ? '알림을 설정합니다' : view === 'share' ? '공유 설정을 구성합니다' : '참석자를 초대합니다'}
          </DialogDescription>
        </DialogHeader>

        {view === 'main' ? (
          <>
          <div className="flex-1 px-6 overflow-y-auto pb-6">
          {/* 타입 선택 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={type === 'todo' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'todo' ? 'bg-black text-white hover:bg-gray-900' : ''}`}
              onClick={() => setType('todo')}
            >
              투두
            </Button>
            <Button
              variant={type === 'event' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'event' ? 'bg-black text-white hover:bg-gray-900' : ''}`}
              onClick={() => setType('event')}
            >
              이벤트
            </Button>
          </div>

          {/* 제목 */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 투두 타입: 단일 날짜/시간 */}
          {type === 'todo' && (
            <div className="space-y-2 mb-4">
              <Label>날짜 및 시간</Label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <button
                    onClick={() => {
                      setShowStartTimePicker(false);
                      setShowStartDatePicker(!showStartDatePicker);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {format(startDate, 'yyyy. M. d. (EEE)', { locale: ko })}
                    </span>
                  </button>
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => {
                      setShowStartDatePicker(false);
                      setShowStartTimePicker(!showStartTimePicker);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {`${String(startTime.hour).padStart(2, '0')}:${String(startTime.minute).padStart(2, '0')}`}
                    </span>
                  </button>
                </div>
              </div>
              {showStartDatePicker && (
                <div ref={todoDatePickerRef} className="bg-white rounded-lg shadow-lg border">
                  <InlineCalendar
                    selectedDate={startDate}
                    onSelectDate={(date) => {
                      setStartDate(date);
                      setShowStartDatePicker(false);
                    }}
                  />
                </div>
              )}
              {showStartTimePicker && (
                <div ref={todoTimePickerRef} className="bg-white rounded-lg shadow-lg border overflow-hidden">
                  <InlineTimePicker
                    value={startTime}
                    onChange={(time) => {
                      setStartTime(time);
                    }}
                  />
                  
                  {/* 완료 버튼 */}
                  <div className="p-3 border-t">
                    <Button
                      onClick={() => setShowStartTimePicker(false)}
                      className="w-full bg-black hover:bg-gray-900 text-white"
                    >
                      완료
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 종일 토글 - 제목 바로 아래로 이동 */}
          {type === 'event' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <Label htmlFor="all-day" className="cursor-pointer">종일</Label>
              <Switch
                id="all-day"
                checked={isAllDay}
                onCheckedChange={setIsAllDay}
              />
            </div>
          )}

          {/* 날짜 및 시간 */}
          {type === 'event' && (
            <div className="space-y-4 mb-4">
              {/* 시작/종료 날짜 버튼 */}
              <div className="space-y-3">
                {/* 시작 */}
                <div className="space-y-2">
                  <Label>시작</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowStartTimePicker(false);
                        setShowEndTimePicker(false);
                        if (activeCalendar === 'start') {
                          setActiveCalendar(null);
                        } else {
                          setActiveCalendar('start');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                        activeCalendar === 'start' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">
                        {format(startDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                      </span>
                    </button>
                    {!isAllDay && (
                      <button
                        onClick={() => {
                          setActiveCalendar(null);
                          setShowEndTimePicker(false);
                          setShowStartTimePicker(!showStartTimePicker);
                        }}
                        className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-sm">
                          {startTime.hour < 12 ? '오전' : '오후'} {`${String(startTime.hour % 12 || 12)}:${String(startTime.minute).padStart(2, '0')}`}
                        </span>
                      </button>
                    )}
                  </div>
                  
                  {/* 시작 날짜 달력 */}
                  {activeCalendar === 'start' && (
                    <div ref={startCalendarRef} className="bg-white rounded-lg shadow-lg border overflow-hidden">
                      <InlineCalendar
                        selectedDate={startDate}
                        onSelectDate={(date) => {
                          setStartDate(date);
                        }}
                      />
                      
                      {/* 완료 버튼 */}
                      <div className="p-3 border-t">
                        <Button
                          onClick={() => setActiveCalendar(null)}
                          className="w-full bg-black hover:bg-gray-900 text-white"
                        >
                          완료
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* 시작 시간 선택기 */}
                  {showStartTimePicker && (
                    <div ref={startTimePickerRef} className="bg-white rounded-lg shadow-lg border overflow-hidden">
                      <InlineTimePicker
                        value={startTime}
                        onChange={(time) => {
                          setStartTime(time);
                        }}
                      />
                      
                      {/* 완료 버튼 */}
                      <div className="p-3 border-t">
                        <Button
                          onClick={() => setShowStartTimePicker(false)}
                          className="w-full bg-black hover:bg-gray-900 text-white"
                        >
                          완료
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 종료 */}
                <div className="space-y-2">
                  <Label>종료</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowStartTimePicker(false);
                        setShowEndTimePicker(false);
                        if (activeCalendar === 'end') {
                          setActiveCalendar(null);
                        } else {
                          setActiveCalendar('end');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                        activeCalendar === 'end' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">
                        {format(endDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                      </span>
                    </button>
                    {!isAllDay && (
                      <button
                        onClick={() => {
                          setActiveCalendar(null);
                          setShowStartTimePicker(false);
                          setShowEndTimePicker(!showEndTimePicker);
                        }}
                        className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-sm">
                          {endTime.hour < 12 ? '오전' : '오후'} {`${String(endTime.hour % 12 || 12)}:${String(endTime.minute).padStart(2, '0')}`}
                        </span>
                      </button>
                    )}
                  </div>
                  
                  {/* 종료 날짜 달력 */}
                  {activeCalendar === 'end' && (
                    <div ref={endCalendarRef} className="bg-white rounded-lg shadow-lg border overflow-hidden">
                      <InlineCalendar
                        selectedDate={endDate}
                        onSelectDate={(date) => {
                          setEndDate(date);
                        }}
                      />
                      
                      {/* 완료 버튼 */}
                      <div className="p-3 border-t">
                        <Button
                          onClick={() => setActiveCalendar(null)}
                          className="w-full bg-black hover:bg-gray-900 text-white"
                        >
                          완료
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* 종료 시간 선택기 */}
                  {showEndTimePicker && (
                    <div ref={endTimePickerRef} className="bg-white rounded-lg shadow-lg border overflow-hidden">
                      <InlineTimePicker
                        value={endTime}
                        onChange={(time) => {
                          setEndTime(time);
                        }}
                      />
                      
                      {/* 완료 버튼 */}
                      <div className="p-3 border-t">
                        <Button
                          onClick={() => setShowEndTimePicker(false)}
                          className="w-full bg-black hover:bg-gray-900 text-white"
                        >
                          완료
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 모 - Collapsible */}
          {type === 'event' && (
            <div className="mb-4">
              <Collapsible open={showDescription} onOpenChange={setShowDescription}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">메모</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Textarea
                    id="description"
                    placeholder="상세 내용을 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t pt-4 space-y-3">
            {/* 반복 설정 */}
            <button
              onClick={() => setView('recurring')}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-gray-600" />
                <span className="text-sm">반복</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{getRecurringText()}</span>
                {recurring && recurring.endDate && (
                  <span className="text-xs text-gray-400">
                    ~ {format(new Date(recurring.endDate), 'yyyy. M. d.', { locale: ko })}
                  </span>
                )}
              </div>
            </button>

            {/* 알림 설정 */}
            <button
              onClick={() => setView('reminder')}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-sm">알림</span>
              </div>
              <div className="flex items-center gap-2">
                {reminders.length > 0 ? (
                  <span className="text-sm text-gray-600">
                    {reminders.length === 1 
                      ? reminders[0].label 
                      : `${reminders[0].label} 외 ${reminders.length - 1}개`}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">없음</span>
                )}
              </div>
            </button>

            {/* 공유 설정 - 버튼 */}
            <button
              onClick={() => setView('share')}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {visibility === 'private' ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Globe className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm">공유</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {visibility === 'private' ? '나만 보기' : visibility === 'public-all' ? '모두에게 공개' : '특정 대상에게 공개'}
                </span>
                {visibility === 'public-specific' && sharedCount > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {sharedCount}
                  </span>
                )}
              </div>
            </button>

            {/* 참석자 초대 - 버튼 */}
            <button
              onClick={() => setView('invite')}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gray-600" />
                <span className="text-sm">참석자 초대</span>
              </div>
              <div className="flex items-center gap-2">
                {invitedCount > 0 ? (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {invitedCount}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">없음</span>
                )}
              </div>
            </button>
          </div>
          </div>
          
          {/* 저장 버튼 - 고정 하단 */}
          <div className="p-6 pt-4 border-t bg-white">
            <Button
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-gray-900 text-white"
              disabled={!title.trim()}
            >
              저장
            </Button>
          </div>
          </>
        ) : view === 'recurring' ? (
          <div className="flex-1 px-6 overflow-y-auto">
            <RecurringForm
              value={recurring}
              onChange={setRecurring}
              onBack={() => setView('main')}
            />
          </div>
        ) : view === 'reminder' ? (
          <div className="flex-1 px-6 overflow-y-auto">
            <ReminderForm
              value={reminders}
              onChange={setReminders}
              onBack={() => setView('main')}
            />
          </div>
        ) : view === 'share' ? (
          <div className="flex-1 px-6 overflow-y-auto">
            <ShareForm
              visibility={visibility}
              selectedGroups={selectedGroups}
              selectedUsers={selectedUsers}
              onVisibilityChange={setVisibility}
              onGroupsChange={setSelectedGroups}
              onUsersChange={setSelectedUsers}
              onBack={() => setView('main')}
            />
          </div>
        ) : view === 'invite' ? (
          <div className="flex-1 px-6 overflow-y-auto">
            <InviteForm
              invitedGroups={invitedGroups}
              invitedUsers={invitedUsers}
              onGroupsChange={setInvitedGroups}
              onUsersChange={setInvitedUsers}
              onBack={() => setView('main')}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}