import { X, Check, UserPlus, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useTodos } from '../contexts/TodoContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { 
    currentUser, 
    notifications, 
    acceptEventInvite, 
    rejectEventInvite,
    acceptFriendInvite,
    rejectFriendInvite 
  } = useTodos();

  if (!isOpen) return null;

  // pending 상태의 초대/요청 알림과 모든 응답 알림 표시
  const displayNotifications = notifications.filter(n => 
    n.status === 'pending' || 
    n.type === 'event_response' || 
    n.type === 'friend_response'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  const handleAccept = async (notification: any) => {
    if (notification.type === 'event_invite') {
      await acceptEventInvite(notification.id);
    } else if (notification.type === 'friend_request') {
      await acceptFriendInvite(notification.id);
    }
  };

  const handleReject = async (notification: any) => {
    if (notification.type === 'event_invite') {
      await rejectEventInvite(notification.id);
    } else if (notification.type === 'friend_request') {
      await rejectFriendInvite(notification.id);
    }
  };

  return (
    <>
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* 알림 패널 */}
      <div className="fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="text-lg text-gray-900">알림</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 알림 목록 */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-400">새로운 알림이 없습니다</p>
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <div key={notification.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  {notification.type === 'event_invite' ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{notification.fromUserName}</span>님이 일정에 초대했습니다
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{notification.eventTitle}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.eventDate}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(notification)}
                          className="flex-1 bg-black hover:bg-gray-900 text-white h-9"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          수락
                        </Button>
                        <Button
                          onClick={() => handleReject(notification)}
                          variant="outline"
                          className="flex-1 h-9"
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                  ) : notification.type === 'friend_request' ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{notification.fromUserName}</span>님이 친구 요청을 보냈습니다
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(notification)}
                          className="flex-1 bg-black hover:bg-gray-900 text-white h-9"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          수락
                        </Button>
                        <Button
                          onClick={() => handleReject(notification)}
                          variant="outline"
                          className="flex-1 h-9"
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 응답 알림 (event_response, friend_response)
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.responseType === 'accept' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {notification.responseType === 'accept' ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{notification.fromUserName}</span>님이{' '}
                            {notification.type === 'event_response' ? '일정 초대를' : '친구 요청을'}{' '}
                            <span className={notification.responseType === 'accept' ? 'text-green-600' : 'text-red-600'}>
                              {notification.responseType === 'accept' ? '수락' : '거절'}
                            </span>했습니다
                          </p>
                          {notification.eventTitle && (
                            <p className="text-sm text-gray-600 mt-1">{notification.eventTitle}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
