import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTodos } from '../contexts/TodoContext';
import { users } from '../data/mockData';
import { Journal, JournalComment, TodoItem, Record as RecordType } from '../types/todo';
import { ChevronLeft, Camera, MessageSquare, Send, Lock, Globe, ChevronDown, ChevronUp, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

export function DailyRecordPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { journals, records, journalComments, updateJournal, addJournalComment, todos, currentUser } = useTodos();
  
  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const existingJournal = journals.find(j => j.date === date && currentUser && j.userId === currentUser.id);
  
  // 해당 날짜의 할 일 기록들
  const dateRecords = records.filter(r => {
    const recordDate = new Date(r.createdAt).toISOString().split('T')[0];
    return recordDate === date && currentUser && r.userId === currentUser.id;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // 해당 날짜의 투두와 이벤트 가져오기
  const dateTodos = todos.filter(todo => {
    if (!currentUser || todo.userId !== currentUser.id) return false;
    
    // 투두인 경우
    if (todo.type === 'todo' && todo.date === date) return true;
    
    // 이벤트인 경우
    if (todo.type === 'event') {
      const startDate = todo.startDate || todo.date;
      return startDate === date;
    }
    
    return false;
  });

  // 투두/이벤트와 기록을 통합하여 시간순으로 정렬
  type TimelineItem = {
    id: string;
    type: 'todo' | 'event';
    time: string;
    title: string;
    isCompleted?: boolean;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    thoughtRecord?: RecordType;
    photoRecord?: RecordType;
  };

  const timelineItems: TimelineItem[] = dateTodos.map(todo => {
    const thoughtRec = dateRecords.find(r => r.todoId === todo.id && r.type === 'thought');
    const photoRec = dateRecords.find(r => r.todoId === todo.id && r.type === 'photo');
    
    return {
      id: todo.id,
      type: todo.type || 'todo',
      time: todo.time || todo.startTime || '00:00',
      title: todo.title,
      isCompleted: todo.isCompleted,
      description: todo.description,
      location: todo.location,
      startTime: todo.startTime,
      endTime: todo.endTime,
      isAllDay: todo.isAllDay,
      thoughtRecord: thoughtRec,
      photoRecord: photoRec,
    };
  }).sort((a, b) => {
    // 종일 이벤트는 맨 위로
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    
    // 시간순 정렬
    const timeA = a.time.replace(/[^0-9:]/g, '');
    const timeB = b.time.replace(/[^0-9:]/g, '');
    return timeA.localeCompare(timeB);
  });

  // 통계 계산
  const totalTodos = dateTodos.filter(t => t.type === 'todo').length;
  const completedTodos = dateTodos.filter(t => t.type === 'todo' && t.isCompleted).length;
  const totalEvents = dateTodos.filter(t => t.type === 'event').length;

  const journalCommentsForDate = existingJournal 
    ? journalComments.filter(c => c.journalId === existingJournal.id)
    : [];

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return `${month}월 ${day}일 ${dayName}요일`;
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSaveJournal = async () => {
    if (!journalContent.trim() || !currentUser) return;

    if (existingJournal) {
      // 수정
      await updateJournal({
        ...existingJournal,
        content: journalContent,
        isPublic,
        updatedAt: new Date().toISOString()
      });
    } else {
      // 새로 작성
      const newJournal: Journal = {
        id: `j${Date.now()}`,
        userId: currentUser.id,
        date: date!,
        content: journalContent,
        isPublic,
        sharedWith: isPublic ? ['family', 'company'] : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await updateJournal(newJournal);
    }
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setJournalContent(existingJournal?.content || '');
    setIsPublic(existingJournal?.isPublic || false);
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !existingJournal || !currentUser) return;

    const newComment: JournalComment = {
      id: `jc${Date.now()}`,
      journalId: existingJournal.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentInput,
      createdAt: new Date().toISOString(),
    };
    await addJournalComment(newComment);
    setCommentInput('');
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatDisplayTime = (time?: string, isAllDay?: boolean) => {
    if (isAllDay) return '종일';
    if (!time) return '';
    return time.replace(/[^0-9:]/g, '');
  };

  return (
    <div className="flex flex-col h-screen bg-white pb-16">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/records')} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg text-gray-900">{formatDate(date || '')}</h1>
            <p className="text-xs text-gray-500">나의 하루 기록</p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 오늘의 종합 (Activity) */}
        <div className="border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-500">오늘의 종합</h2>
            {timelineItems.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {totalTodos > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {completedTodos}/{totalTodos} 완료
                  </span>
                )}
                {totalEvents > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {totalEvents}개 일정
                  </span>
                )}
              </div>
            )}
          </div>
          
          {timelineItems.length > 0 ? (
            <div className="relative">
              {timelineItems.map((item, index) => {
                const isExpanded = expandedItems.has(item.id);
                const hasThought = !!item.thoughtRecord;
                const hasPhoto = !!item.photoRecord;
                const isFirst = index === 0;
                const isLast = index === timelineItems.length - 1;
                
                // 시간 범위 표시
                let timeDisplay = formatDisplayTime(item.time, item.isAllDay);
                if (item.endTime && !item.isAllDay) {
                  timeDisplay = `${timeDisplay} ~ ${formatDisplayTime(item.endTime)}`;
                }
                
                return (
                  <div key={item.id} className="flex gap-3 relative">
                    {/* 타임라인 점과 선 */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                      {/* 위쪽 선 */}
                      {!isFirst && (
                        <div className="w-0.5 bg-gray-200 h-2 -mt-2"></div>
                      )}
                      
                      {/* 점 */}
                      <div className="w-2 h-2 rounded-full bg-gray-900 flex-shrink-0"></div>
                      
                      {/* 아래쪽 선 */}
                      {!isLast && (
                        <div className="w-0.5 bg-gray-200 flex-1 min-h-[40px]"></div>
                      )}
                    </div>
                    
                    {/* 콘텐츠 영역 */}
                    <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-2'}`}>
                      <div className="flex gap-4">
                        {/* 왼쪽: 정보 */}
                        <div className="flex-1 min-w-0">
                          {/* 시간 */}
                          <div className="text-sm text-gray-900 mb-2">
                            {timeDisplay}
                          </div>
                          
                          {/* 제목 */}
                          <h3 className={`text-gray-900 mb-2 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {item.title}
                          </h3>
                          
                          {/* 위치 정보 */}
                          {item.location && (
                            <p className="text-sm text-gray-500 mb-2">
                              📍 {item.location}
                            </p>
                          )}
                          
                          {/* 설명 */}
                          {item.description && (
                            <p className="text-sm text-gray-400 mb-2">
                              {item.description}
                            </p>
                          )}
                          
                          {/* 생각 기록 토글 */}
                          {hasThought && (
                            <div>
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                              >
                                {item.thoughtRecord?.content && (
                                  <span className="line-clamp-1">
                                    {item.thoughtRecord.content}
                                  </span>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                )}
                              </button>
                              
                              {/* 생각 기록 펼침 영역 */}
                              {isExpanded && item.thoughtRecord?.content && (
                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                  {item.thoughtRecord.content}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* 오른쪽: 사진 */}
                        {hasPhoto && item.photoRecord?.photoUrl && (
                          <div className="w-[140px] h-[100px] flex-shrink-0">
                            <img
                              src={item.photoRecord.photoUrl}
                              alt="기록 사진"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">오늘 등록한 할 일이 없습니다</p>
            </div>
          )}
        </div>

        {/* 하루 회고 (Journal) */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-500">하루 회고</h2>
            {existingJournal && !isEditing && (
              <Button 
                onClick={handleStartEdit}
                variant="ghost" 
                size="sm"
              >
                수정
              </Button>
            )}
          </div>

          {isEditing || !existingJournal ? (
            <div className="space-y-4">
              <Textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="오늘 하루를 되돌아보며 회고를 작성해보세요..."
                className="min-h-[200px] resize-none border-gray-200"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="journal-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="journal-public" className="text-sm text-gray-600 cursor-pointer">
                    {isPublic ? (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        공개
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4" />
                        나만 보기
                      </span>
                    )}
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  {existingJournal && (
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="ghost" 
                      size="sm"
                    >
                      취소
                    </Button>
                  )}
                  <Button 
                    onClick={handleSaveJournal}
                    size="sm"
                    disabled={!journalContent.trim()}
                  >
                    저장
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingJournal.content}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {existingJournal.isPublic ? (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    공개
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    나만 보기
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 댓글 */}
        {existingJournal && !isEditing && (
          <div className="px-6 py-6">
            <h3 className="text-sm text-gray-500 mb-4">댓글 {journalCommentsForDate.length}</h3>
            <div className="space-y-4">
              {journalCommentsForDate.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 댓글 입력 (회고가 있을 때만) */}
      {existingJournal && !isEditing && (
        <div className="border-t border-gray-100 px-6 py-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="댓글을 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
