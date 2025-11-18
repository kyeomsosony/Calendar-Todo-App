import { useState } from 'react';
import { ProfileFilter } from '../components/ProfileFilter';
import { NotificationPanel, NotificationBadge } from '../components/NotificationPanel';
import { useTodos } from '../contexts/TodoContext';
import { Journal } from '../types/todo';
import { Grid3x3, Bell, Plus, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecordsPage() {
  const { journals, currentUser, friends, groups, notifications } = useTodos();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  // Set current user as selected when loaded
  if (selectedId === null && currentUser) {
    setSelectedId(currentUser.id);
  }

  // Create user list with current user, friends, and groups
  const friendUsers = friends.map(f => ({
    id: f.friendId,
    name: f.friendName,
    email: f.friendEmail,
    avatar: f.friendAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    color: '#10b981',
  }));
  const groupUsers = groups.map(g => ({
    id: g.id,
    name: g.name,
    avatar: g.avatar,
    isGroup: true,
    color: g.color || '#8b5cf6',
  }));
  const allUsers = currentUser ? [currentUser, ...groupUsers, ...friendUsers] : [];

  const selectedGroup = groups.find((g) => g.id === selectedId);
  const isMyView = currentUser && selectedId === currentUser.id;
  const isGroupView = !!selectedGroup;

  // 필터링된 회고 목록
  const filteredJournals = journals.filter((journal) => {
    if (currentUser && selectedId === currentUser.id) {
      return journal.userId === currentUser.id;
    }
    
    // 그룹 뷰: 그룹의 모든 멤버의 공개 회고 표시
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedId);
      if (group) {
        return journal.isPublic && group.memberIds.includes(journal.userId);
      }
    }
    
    // 개인 뷰 (친구)
    return journal.userId === selectedId && journal.isPublic;
  });

  // 날짜별로 그룹화
  const journalsByDate = filteredJournals.reduce((acc, journal) => {
    const date = journal.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(journal);
    return acc;
  }, {} as Record<string, Journal[]>);

  // 날짜 정렬 (최신순)
  const sortedDates = Object.keys(journalsByDate).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 ${dayName}요일`;
  };

  const handleDateClick = (date: string) => {
    if (isMyView) {
      navigate(`/records/my/${date}`);
    } else {
      navigate(`/records/others/${selectedId}/${date}`);
    }
  };

  const handleCreateToday = () => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/records/my/${today}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white pb-16">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <Grid3x3 className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <NotificationBadge count={notifications.filter(n => n.status === 'pending').length} />
          </button>
        </div>

        {/* 프로필 필터 */}
        <ProfileFilter
          users={allUsers}
          groups={groups}
          selectedId={selectedId || ''}
          onSelect={setSelectedId}
        />
      </div>

      {/* 날짜별 회고 목록 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-6">
          <div className="mb-4">
            <h2 className="text-lg text-gray-900">
              {isMyView ? '나의 회고' : isGroupView ? `${selectedGroup?.name} 회고` : `${allUsers.find(u => u.id === selectedId)?.name}의 회고`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedDates.length > 0 ? `총 ${sortedDates.length}일의 기록` : '아직 기록이 없습니다'}
            </p>
          </div>

          <div className="space-y-3">
            {sortedDates.map((date) => {
              const dateJournals = journalsByDate[date];
              const author = allUsers.find(u => u.id === dateJournals[0].userId);
              
              return (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!isMyView && author && (
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: author.color }}
                            />
                            <span className="text-xs text-gray-500">{author.name}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-gray-900 mb-1">{formatDate(date)}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {dateJournals[0].content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </button>
              );
            })}

            {sortedDates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">아직 기록이 없습니다</p>
                {isMyView && (
                  <p className="text-xs text-gray-400 mt-1">오늘의 회고를 작성해보세요</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오늘의 회고 작성 버튼 (내 뷰에만 표시) */}
      {isMyView && (
        <div className="fixed bottom-20 left-0 right-0 px-6 max-w-2xl mx-auto">
          <button
            onClick={handleCreateToday}
            className="w-full bg-black text-white py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>오늘의 회고 작성하기</span>
          </button>
        </div>
      )}

      {/* 알림 패널 */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}