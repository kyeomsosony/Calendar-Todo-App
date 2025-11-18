import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';

interface InviteFormProps {
  invitedGroups: string[];
  invitedUsers: string[];
  onGroupsChange: (groups: string[]) => void;
  onUsersChange: (users: string[]) => void;
  onBack: () => void;
}

export function InviteForm({
  invitedGroups,
  invitedUsers,
  onGroupsChange,
  onUsersChange,
  onBack
}: InviteFormProps) {
  const { friends, groups } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [localInvitedGroups, setLocalInvitedGroups] = useState<string[]>(invitedGroups);
  const [localInvitedUsers, setLocalInvitedUsers] = useState<string[]>(invitedUsers);

  // value가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalInvitedGroups(invitedGroups);
    setLocalInvitedUsers(invitedUsers);
  }, [invitedGroups, invitedUsers]);

  const handleGroupToggle = (groupId: string) => {
    setLocalInvitedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleUserToggle = (userId: string) => {
    setLocalInvitedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredGroups = groups.filter(g => 
    searchQuery === '' || g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const users = friends.map(f => ({
    id: f.friendId,
    name: f.friendName,
    email: f.friendEmail,
    avatar: f.friendAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  }));

  const filteredUsers = searchQuery === '' 
    ? users 
    : users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBack = () => {
    // 자동 저장
    onGroupsChange(localInvitedGroups);
    onUsersChange(localInvitedUsers);
    onBack();
  };

  const invitedCount = localInvitedGroups.length + localInvitedUsers.length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-6 space-y-4">
        {/* 안내 문구 */}
        <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          초대한 사용자가 승인하면 그들의 캘린더에도 추가됩니다
        </p>

        {/* 검색 */}
        <div className="space-y-2">
          <Input
            placeholder="그룹 또는 사용자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* 그룹 리스트 */}
        {filteredGroups.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">그룹</Label>
            <div className="space-y-1">
              {filteredGroups.map((group) => {
                const isChecked = localInvitedGroups.includes(group.id);
                return (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleGroupToggle(group.id)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleGroupToggle(group.id)}
                    />
                    <span className="text-xl">{group.avatar}</span>
                    <span>{group.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 사용자 리스트 */}
        {filteredUsers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">사용자</Label>
            <div className="space-y-1">
              {filteredUsers.map((user) => {
                const isChecked = localInvitedUsers.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {searchQuery !== '' && filteredUsers.length === 0 && filteredGroups.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            검색 결과 없음
          </p>
        )}
      </div>

      {/* 선택된 대상 표시 - 고정 영역 */}
      {invitedCount > 0 && (
        <div className="border-t bg-white p-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">초대된 대상 ({invitedCount})</Label>
            <div className="flex flex-wrap gap-2">
              {localInvitedGroups.map((groupId) => {
                const group = groups.find((g) => g.id === groupId);
                return (
                  <div
                    key={groupId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    <span className="text-base">{group?.avatar}</span>
                    <span className="text-sm">{group?.name}</span>
                    <button
                      onClick={() => handleGroupToggle(groupId)}
                      className="ml-0.5 hover:text-gray-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {localInvitedUsers.map((userId) => {
                const user = users.find((u) => u.id === userId);
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm">{user?.name}</span>
                    <button
                      onClick={() => handleUserToggle(userId)}
                      className="ml-0.5 hover:text-gray-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="border-t bg-white p-4">
        <Button
          onClick={handleBack}
          className="w-full bg-black hover:bg-gray-900 text-white"
        >
          완료
        </Button>
      </div>
    </div>
  );
}