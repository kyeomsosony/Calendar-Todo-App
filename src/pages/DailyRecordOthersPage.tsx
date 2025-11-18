import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTodos } from '../contexts/TodoContext';
import { JournalComment } from '../types/todo';
import { ChevronLeft, Camera, MessageSquare, Send, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function DailyRecordOthersPage() {
  const { userId, date } = useParams<{ userId: string; date: string }>();
  const navigate = useNavigate();
  const { records, journals, journalComments, addJournalComment, friends, groups, currentUser } = useTodos();
  
  const [commentInput, setCommentInput] = useState('');

  const selectedGroup = groups.find(g => g.id === userId);
  const selectedFriend = friends.find(f => f.friendId === userId);
  const selectedUser = selectedFriend ? {
    id: selectedFriend.friendId,
    name: selectedFriend.friendName,
    email: selectedFriend.friendEmail,
    avatar: selectedFriend.friendAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  } : null;
  const isGroupView = !!selectedGroup;

  // Create users list for group view
  const friendUsers = friends.map(f => ({
    id: f.friendId,
    name: f.friendName,
    email: f.friendEmail,
    avatar: f.friendAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    color: '#10b981',
  }));
  const users = currentUser ? [currentUser, ...friendUsers] : friendUsers;

  // 그룹 뷰일 경우 해당 날짜의 모든 공유 기록
  const dateRecords = records.filter(r => {
    const recordDate = new Date(r.createdAt).toISOString().split('T')[0];
    if (recordDate !== date) return false;
    
    if (isGroupView) {
      // 그룹에 속한 사용자의 기록만 (여기서는 간단히 처리)
      return r.userId !== 'me'; // 실제로는 그룹 멤버 체크 필요
    }
    return r.userId === userId;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // 해당 날짜의 공유된 회고
  const dateJournals = journals.filter(j => {
    if (j.date !== date) return false;
    
    if (isGroupView) {
      return j.isPublic && j.sharedWith?.includes(userId!);
    }
    return j.userId === userId && j.isPublic;
  });

  const allJournalComments = dateJournals.flatMap(j => 
    journalComments.filter(c => c.journalId === j.id)
  );

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

  const handleAddComment = () => {
    if (!commentInput.trim() || dateJournals.length === 0 || !currentUser) return;

    const newComment: JournalComment = {
      id: `jc${Date.now()}`,
      journalId: dateJournals[0].id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentInput,
      createdAt: new Date().toISOString(),
    };
    addJournalComment(newComment);
    setCommentInput('');
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
            <p className="text-xs text-gray-500">
              {isGroupView ? `${selectedGroup?.name} 회고` : `${selectedUser?.name}의 회고`}
            </p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 오늘의 종합 (Activity) */}
        <div className="border-b border-gray-100 px-6 py-6">
          <h2 className="text-sm text-gray-500 mb-4">오늘의 종합</h2>
          
          {dateRecords.length > 0 || dateJournals.length > 0 ? (
            <div className="space-y-4">
              {/* 할 일 기록 */}
              {dateRecords.map((record) => {
                const author = users.find(u => u.id === record.userId);
                return (
                  <div key={record.id} className="flex gap-3">
                    <div className="text-xs text-gray-400 w-12 flex-shrink-0 pt-1">
                      {formatTime(record.createdAt)}
                    </div>
                    <div className="flex-1">
                      {isGroupView && author && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Avatar className="w-5 h-5 border border-gray-200">
                            <AvatarImage src={author.avatar} alt={author.name} />
                            <AvatarFallback>{author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{author.name}</span>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-lg p-3">
                        {record.type === 'photo' && record.photoUrl && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Camera className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-500">사진 기록</span>
                            </div>
                            <img 
                              src={record.photoUrl} 
                              alt="Record" 
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                        {record.type === 'thought' && record.content && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-500">생각 기록</span>
                            </div>
                            <p className="text-sm text-gray-700">{record.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 공유된 하루 회고 */}
              {dateJournals.map((journal) => {
                const author = users.find(u => u.id === journal.userId);
                return (
                  <div key={journal.id} className="flex gap-3 border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-400 w-12 flex-shrink-0 pt-1">
                      회고
                    </div>
                    <div className="flex-1">
                      {isGroupView && author && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Avatar className="w-5 h-5 border border-gray-200">
                            <AvatarImage src={author.avatar} alt={author.name} />
                            <AvatarFallback>{author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{author.name}</span>
                        </div>
                      )}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-600">하루 회고</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{journal.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">공유된 기록이 없습니다</p>
            </div>
          )}
        </div>

        {/* 댓글 */}
        {dateJournals.length > 0 && (
          <div className="px-6 py-6">
            <h3 className="text-sm text-gray-500 mb-4">댓글 {allJournalComments.length}</h3>
            <div className="space-y-4">
              {allJournalComments.map((comment) => (
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
      {dateJournals.length > 0 && (
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
