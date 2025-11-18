import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { User, LogOut, UserPlus, Users, Check, X, Trash2, Edit, Plus, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Group } from '../types/todo';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { 
    friends, 
    receivedFriendRequests, 
    sentFriendRequests,
    groups,
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useTodos();
  
  const [friendEmail, setFriendEmail] = useState('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // PWA 설치 상태 체크
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // PWA 상태 확인
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWAInstalled(isStandalone);
    
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다');
    }
  };

  const handleSendRequest = async () => {
    if (!friendEmail.trim()) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    if (friendEmail === user?.email) {
      toast.error('자기 자신에게 친구 요청을 보낼 수 없습니다');
      return;
    }

    const result = await sendFriendRequest(friendEmail);
    if (result.success) {
      toast.success('친구 요청을 보냈습니다');
      setFriendEmail('');
    } else {
      // 에러 메시지를 더 친절하게 변환
      let errorMessage = result.error || '친구 요청에 실패했습니다';
      
      if (errorMessage.includes('does not exist')) {
        errorMessage = '해당 이메일의 사용자를 찾을 수 없습니다';
      } else if (errorMessage.includes('already sent')) {
        errorMessage = '이미 친구 요청을 보냈습니다';
      } else if (errorMessage.includes('Already friends')) {
        errorMessage = '이미 친구입니다';
      } else if (errorMessage.includes('already sent you')) {
        errorMessage = '상대방이 이미 친구 요청을 보냈습니다. 받은 요청을 확인해주세요';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleAcceptRequest = async (requestId: string, fromUserName: string) => {
    await acceptFriendRequest(requestId);
    toast.success(`${fromUserName}님과 친구가 되었습니다`);
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
    toast.success('친구 요청을 거절했습니다');
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (confirm(`${friendName}님을 친구 목록에서 삭제하시겠습니까?`)) {
      await removeFriend(friendId);
      toast.success('친구를 삭제했습니다');
    }
  };

  const handleOpenCreateGroupDialog = () => {
    setEditingGroup(null);
    setGroupName('');
    setSelectedMemberIds([]);
    setIsGroupDialogOpen(true);
  };

  const handleOpenEditGroupDialog = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    // Exclude current user from selected members
    setSelectedMemberIds(group.memberIds.filter(id => id !== user?.id));
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast.error('그룹 이름을 입력해주세요');
      return;
    }

    if (selectedMemberIds.length === 0) {
      toast.error('최소 1명의 멤버를 선택해주세요');
      return;
    }

    if (editingGroup) {
      // Update existing group
      const result = await updateGroup(editingGroup.id, groupName, selectedMemberIds);
      if (result.success) {
        toast.success('그룹이 수정되었습니다');
        setIsGroupDialogOpen(false);
      } else {
        toast.error(result.error || '그룹 수정에 실패했습니다');
      }
    } else {
      // Create new group
      const result = await createGroup(groupName, selectedMemberIds);
      if (result.success) {
        toast.success('그룹이 생성되었습니다');
        setIsGroupDialogOpen(false);
      } else {
        toast.error(result.error || '그룹 생성에 실패했습니다');
      }
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (confirm(`"${groupName}" 그룹을 삭제하시겠습니까?`)) {
      await deleteGroup(groupId);
      toast.success('그룹이 삭제되었습니다');
    }
  };

  const toggleMember = (friendId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl">설정</h1>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* 사용자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              사용자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">이름</p>
              <p className="mt-1">{user?.user_metadata?.name || '사용자'}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">이메일</p>
              <p className="mt-1">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* 친구 초대 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              친구 초대
            </CardTitle>
            <CardDescription>
              이메일로 친구를 초대하여 일정을 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="친구 이메일 입력"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
              />
              <Button onClick={handleSendRequest}>
                초대
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 받은 친구 요청 */}
        {receivedFriendRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                받은 친구 요청
                <Badge variant="secondary">{receivedFriendRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {receivedFriendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.fromUserAvatar} alt={request.fromUserName} />
                      <AvatarFallback>{request.fromUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.fromUserName}</p>
                      <p className="text-sm text-gray-500">{request.fromUserEmail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id, request.fromUserName)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 보낸 친구 요청 */}
        {sentFriendRequests.filter(r => r.status === 'pending').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                보낸 친구 요청
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sentFriendRequests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.toUserEmail}</p>
                      <p className="text-sm text-gray-500">대기 중</p>
                    </div>
                    <Badge variant="outline">대기</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* 그룹 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  그룹 관리
                  {groups.length > 0 && (
                    <Badge variant="secondary">{groups.length}</Badge>
                  )}
                </CardTitle>
              </div>
              <Button size="sm" onClick={handleOpenCreateGroupDialog}>
                <Plus className="w-4 h-4 mr-1" />
                그룹 생성
              </Button>
            </div>
            <CardDescription>
              가족, 연인 등 그룹을 만들어 일정을 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                아직 그룹이 없습니다
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-gray-500">멤버 {group.memberIds.length}명</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditGroupDialog(group)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-13">
                    {group.memberIds
                      .filter(id => id !== user?.id)
                      .map((memberId) => {
                        const friend = friends.find(f => f.friendId === memberId);
                        return friend ? (
                          <Badge key={memberId} variant="outline" className="text-xs">
                            {friend.friendName}
                          </Badge>
                        ) : null;
                      })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 친구 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              친구 목록
              {friends.length > 0 && (
                <Badge variant="secondary">{friends.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              일정을 공유하는 친구들
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {friends.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                아직 친구가 없습니다
              </p>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.friendAvatar} alt={friend.friendName} />
                      <AvatarFallback>{friend.friendName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.friendName}</p>
                      <p className="text-sm text-gray-500">{friend.friendEmail}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFriend(friend.friendId, friend.friendName)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 앱 설치 정보 (PWA) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              앱 설치
            </CardTitle>
            <CardDescription>
              홈 화면에 앱을 추가하여 더 편리하게 사용하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">설치 상태</p>
                  {isPWAInstalled ? (
                    <Badge className="bg-green-600">설치됨</Badge>
                  ) : (
                    <Badge variant="outline">미설치</Badge>
                  )}
                </div>
                {isPWAInstalled ? (
                  <p className="text-sm text-gray-600">
                    앱이 홈 화면에 설치되어 있습니다
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {isIOS ? (
                        <>
                          Safari 브라우저 하단의 <span className="inline-block px-1">⎙</span> 버튼을 눌러 
                          '홈 화면에 추가'를 선택하세요
                        </>
                      ) : (
                        '브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택하세요'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>💡 앱 설치 시 장점:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
                <li>홈 화면에서 바로 실행</li>
                <li>전체 화면으로 사용 가능</li>
                <li>오프라인에서도 일부 기능 사용</li>
                <li>더 빠른 로딩 속도</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 그룹 생성/수정 다이얼로그 */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? '그룹 수정' : '새 그룹 만들기'}
              </DialogTitle>
              <DialogDescription>
                그룹 이름을 입력하고 멤버를 선택하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>그룹 이름</Label>
                <Input
                  placeholder="예: 가족, 연인, 프로젝트팀"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>멤버 선택</Label>
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-500">친구를 먼저 추가해주세요</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {friends.map((friend) => (
                      <div key={friend.friendId} className="flex items-center space-x-2">
                        <Checkbox
                          id={friend.friendId}
                          checked={selectedMemberIds.includes(friend.friendId)}
                          onCheckedChange={() => toggleMember(friend.friendId)}
                        />
                        <Label
                          htmlFor={friend.friendId}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={friend.friendAvatar} alt={friend.friendName} />
                            <AvatarFallback>{friend.friendName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{friend.friendName}</p>
                            <p className="text-xs text-gray-500">{friend.friendEmail}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSaveGroup}>
                {editingGroup ? '수정' : '생성'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 디버그 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>디버그 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <p><strong>이메일:</strong> {user?.email}</p>
              <p><strong>localStorage 키:</strong></p>
              <div className="pl-4 text-xs text-gray-500 max-h-20 overflow-auto">
                {Object.keys(localStorage).filter(k => k.includes('sb-')).map(k => (
                  <div key={k}>{k}</div>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const stored = localStorage.getItem('sb-custom-session');
                console.log('📦 Custom session:', stored ? 'EXISTS' : 'NOT FOUND');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  console.log('  - User:', parsed.user?.email);
                  console.log('  - Token:', parsed.access_token?.substring(0, 40) + '...');
                }
                toast.success('콘솔 확인');
              }}
            >
              세션 확인
            </Button>
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}