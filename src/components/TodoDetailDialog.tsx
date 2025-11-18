import { TodoItem, Record, Comment } from '../types/todo';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, Clock, Repeat, Bell, Globe, Lock, UserPlus, FileText, ChevronRight, Edit2, X, Trash2, Image, MessageSquare, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { users, groups } from '../data/mockData';

interface TodoDetailDialogProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onEdit?: (todo: TodoItem) => void;
  onDelete?: (id: string) => void;
  records: Record[];
  comments: Comment[];
  onAddComment: (todoId: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onAddRecord: (todoId: string, type: 'photo' | 'thought', content?: string, photoUrl?: string) => void;
}

export function TodoDetailDialog({ 
  todo, 
  isOpen, 
  onClose, 
  canEdit,
  onEdit,
  onDelete,
  records,
  comments,
  onAddComment,
  onDeleteComment,
  onAddRecord
}: TodoDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [commentInput, setCommentInput] = useState('');
  const [newThought, setNewThought] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // useEffect는 항상 조건문 이전에 호출되어야 함
  useEffect(() => {
    if (isOpen) {
      commentInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  if (!todo) return null;

  // 디버깅용
  console.log('TodoDetailDialog - todo:', todo);
  console.log('TodoDetailDialog - todo.type:', todo.type);
  console.log('TodoDetailDialog - todo.startDate:', todo.startDate);
  console.log('TodoDetailDialog - todo.reminders:', todo.reminders);
  console.log('TodoDetailDialog - todo.recurring:', todo.recurring);
  console.log('TodoDetailDialog - todo.invitedUsers:', todo.invitedUsers);

  const todoRecords = records.filter(r => r.todoId === todo.id);
  const todoComments = comments.filter(c => c.todoId === todo.id);

  const handleEdit = () => {
    if (onEdit && todo) {
      onEdit(todo);
    }
  };

  const handleDelete = () => {
    if (onDelete && todo && confirm('정말 삭제하시겠습니까?')) {
      onDelete(todo.id);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (commentInput.trim() && onAddComment) {
      onAddComment(todo.id, commentInput);
      setCommentInput('');
    }
  };

  const handleAddThought = () => {
    if (newThought.trim() && onAddRecord) {
      onAddRecord(todo.id, 'thought', newThought);
      setNewThought('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  // 반복 설정 텍스트
  const getRecurringText = () => {
    if (!todo.recurring) return null;
    
    const patterns: { [key: string]: string } = {
      daily: '매일',
      weekly: '매주',
      monthly: '매월',
      yearly: '매년',
    };
    
    let text = patterns[todo.recurring.pattern] || '사용자 지정';
    
    if (todo.recurring.endDate) {
      const endDate = new Date(todo.recurring.endDate);
      if (!isNaN(endDate.getTime())) {
        text += ` (${format(endDate, 'yyyy. M. d.', { locale: ko })}까지)`;
      }
    }
    
    return text;
  };

  // 알림 텍스트
  const getRemindersText = () => {
    if (!todo.reminders || todo.reminders.length === 0) return null;
    
    // 모든 알림을 쉼표로 구분하여 표시
    return todo.reminders.map(r => r.label).join(', ');
  };

  // 공유 설정 텍스트
  const getShareText = () => {
    if (!todo.sharedWith || todo.sharedWith.length === 0 || todo.sharedWith.includes('me')) {
      return '나만 보기';
    }
    
    if (todo.sharedWith.includes('all')) {
      return '모두에게 공개';
    }
    
    // 특정 대상에게 공유: 모든 이름 표시
    const sharedGroups = todo.sharedWith.filter(id => id.startsWith('group:')).map(id => id.replace('group:', ''));
    const sharedUserIds = todo.sharedWith.filter(id => !id.startsWith('group:'));
    
    const groupNames = sharedGroups.map(id => {
      const group = groups.find(g => g.id === id);
      return group ? group.name : '';
    }).filter(Boolean);
    
    const userNames = sharedUserIds.map(id => {
      const user = users.find(u => u.id === id);
      return user ? user.name : '';
    }).filter(Boolean);
    
    const allNames = [...groupNames, ...userNames];
    
    if (allNames.length === 0) return '나만 보기';
    return allNames.join(', ');
  };

  // 참석자 정보
  const getInvitedText = () => {
    if (!todo.invitedUsers || todo.invitedUsers.length === 0) return null;
    
    const invitedGroups = todo.invitedUsers.filter(id => id.startsWith('group:')).map(id => id.replace('group:', ''));
    const invitedUserIds = todo.invitedUsers.filter(id => !id.startsWith('group:'));
    
    const groupNames = invitedGroups.map(id => {
      const group = groups.find(g => g.id === id);
      return group ? group.name : '';
    }).filter(Boolean);
    
    const userNames = invitedUserIds.map(id => {
      const user = users.find(u => u.id === id);
      return user ? user.name : '';
    }).filter(Boolean);
    
    const allNames = [...groupNames, ...userNames];
    
    if (allNames.length === 0) return null;
    // 모든 이름을 쉼표로 구분하여 표시
    return allNames.join(', ');
  };

  // 작성자 정보 가져오기
  const getAuthorInfo = () => {
    if (todo.userId === 'me') {
      return { name: '나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me' };
    }
    const author = users.find(u => u.id === todo.userId);
    return author || { name: '알 수 없음', avatar: '' };
  };

  const recurringText = getRecurringText();
  const remindersText = getRemindersText();
  const shareText = getShareText();
  const invitedText = getInvitedText();
  const author = getAuthorInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-screen max-h-screen p-0 flex flex-col">
        <VisuallyHidden>
          <DialogTitle>{todo.title}</DialogTitle>
          <DialogDescription>할 일 상세 정보 및 기록</DialogDescription>
        </VisuallyHidden>

        {/* 탭 헤더 */}
        <div className="border-b px-6 pt-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">일정 상세</h2>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
              <TabsTrigger 
                value="schedule" 
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-black rounded-none pb-3"
              >
                일정
              </TabsTrigger>
              <TabsTrigger 
                value="record" 
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-black rounded-none pb-3"
              >
                기록
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 탭 콘텐츠 + 댓글 영역 (스크롤) */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          <div className="px-6">
            <Tabs value={activeTab} className="w-full">
              {/* 일정 탭 */}
              <TabsContent value="schedule" className="mt-0 pt-6">
                {/* 제목 */}
                <div className="mb-8">
                  <h1 className="text-2xl text-center text-[32px] mx-[0px] my-[-20px] font-bold">{todo.title}</h1>
                </div>

                {/* 날짜/시간 정보 */}
                {todo.type === 'event' && todo.startDate && (() => {
                  const startDate = new Date(todo.startDate);
                  const endDate = new Date(todo.endDate || todo.startDate);
                  
                  if (isNaN(startDate.getTime())) return null;
                  
                  return (
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-6 mx-[0px] my-[-10px]">
                        {/* 시작 */}
                        <div className="flex flex-col items-center">
                          <div className="text-sm text-gray-600 mb-2">
                            {format(startDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                          </div>
                          <div className="text-4xl">
                            {todo.isAllDay ? '종일' : (todo.startTime || todo.time || '00:00')}
                          </div>
                        </div>

                        {/* 화살표 */}
                        <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mb-2" />

                        {/* 종료 */}
                        <div className="flex flex-col items-center">
                          <div className="text-sm text-gray-600 mb-2">
                            {!isNaN(endDate.getTime()) ? format(endDate, 'yyyy년 M월 d일 (EEE)', { locale: ko }) : format(startDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                          </div>
                          <div className="text-4xl">
                            {todo.isAllDay ? '종일' : (todo.endTime || todo.time || '00:00')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 할 일인 경우 날짜만 표시 */}
                {todo.type === 'todo' && (todo.date || todo.startDate) && (() => {
                  const dateStr = todo.date || todo.startDate;
                  if (!dateStr) return null;
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) return null;
                  
                  return (
                    <div className="mb-8 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span>{format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</span>
                      {(todo.time || todo.startTime) && (
                        <>
                          <Clock className="w-5 h-5 text-gray-600 ml-4" />
                          <span>{todo.time || todo.startTime}</span>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* 메모 */}
                {todo.description && (
                  <div className="mb-[13px] p-4 bg-gray-50 rounded-lg mt-[0px] mr-[0px] ml-[0px]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">메모</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{todo.description}</p>
                  </div>
                )}

                {/* 상세 정보 */}
                <div className="space-y-3 mb-8">
                  {/* 알림 */}
                  {remindersText && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">{remindersText}</span>
                    </div>
                  )}

                  {/* 반복 */}
                  {recurringText && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Repeat className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">{recurringText}</span>
                    </div>
                  )}

                  {/* 참석자 */}
                  {invitedText && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">{invitedText}</span>
                    </div>
                  )}

                  {/* 공유 설정 */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {shareText === '나만 보기' ? (
                      <Lock className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-gray-600" />
                    )}
                    <span className="text-sm">{shareText}</span>
                  </div>
                </div>

                {/* 수정/삭제 버튼 */}
                {canEdit && (
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </Button>
                    <Button
                      onClick={handleEdit}
                      className="flex-1 bg-black hover:bg-gray-900 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      수정
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* 기록 탭 */}
              <TabsContent value="record" className="mt-0 pt-6">
                <div className="space-y-4 mb-6">
                  {/* 기록 작성 영역 */}
                  {canEdit && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">생각 기록하기</span>
                      </div>
                      <Textarea
                        value={newThought}
                        onChange={(e) => setNewThought(e.target.value)}
                        placeholder="오늘 이 할 일에 대한 생각을 기록해보세요..."
                        rows={3}
                        className="border-gray-200"
                      />
                      <Button 
                        onClick={handleAddThought} 
                        disabled={!newThought.trim()}
                        className="w-full bg-black hover:bg-gray-800"
                        size="sm"
                      >
                        기록 추가
                      </Button>
                    </div>
                  )}

                  {/* 기록 목록 */}
                  <div className="space-y-3">
                    {todoRecords.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">
                        아직 기록이 없습니다
                      </div>
                    ) : (
                      todoRecords.map((record) => (
                        <div key={record.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {record.type === 'photo' ? (
                              <Image className="w-4 h-4" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                            <span>{formatTime(record.createdAt)}</span>
                          </div>
                          
                          {record.type === 'photo' && record.photoUrl && (
                            <img
                              src={record.photoUrl}
                              alt="기록 사진"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          
                          {record.type === 'thought' && record.content && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {record.content}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* 댓글 영역 (공통, 스크롤 내부) */}
            <div className="border-t pt-6 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">댓글 {todoComments.length}</span>
              </div>
              
              <div className="space-y-4">
                {todoComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    첫 댓글을 남겨보세요
                  </div>
                ) : (
                  todoComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                          {comment.userId === 'me' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteComment(comment.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                            >
                              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 입력창 (하단 고정) */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Input
              ref={commentInputRef}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 border-gray-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
            <Button 
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              size="icon"
              className="bg-black hover:bg-gray-800 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}