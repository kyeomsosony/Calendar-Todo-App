import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Globe, Lock, Users, X, Check } from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';

type VisibilityType = 'private' | 'public-all' | 'public-specific';

interface ShareFormProps {
  visibility: VisibilityType;
  selectedGroups: string[];
  selectedUsers: string[];
  onVisibilityChange: (visibility: VisibilityType) => void;
  onGroupsChange: (groups: string[]) => void;
  onUsersChange: (users: string[]) => void;
  onBack: () => void;
}

export function ShareForm({
  visibility,
  selectedGroups,
  selectedUsers,
  onVisibilityChange,
  onGroupsChange,
  onUsersChange,
  onBack
}: ShareFormProps) {
  const { friends, groups } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [localVisibility, setLocalVisibility] = useState<VisibilityType>(visibility);
  const [localSelectedGroups, setLocalSelectedGroups] = useState<string[]>(selectedGroups);
  const [localSelectedUsers, setLocalSelectedUsers] = useState<string[]>(selectedUsers);

  // value가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalVisibility(visibility);
    setLocalSelectedGroups(selectedGroups);
    setLocalSelectedUsers(selectedUsers);
  }, [visibility, selectedGroups, selectedUsers]);

  const handleGroupToggle = (groupId: string) => {
    setLocalSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleUserToggle = (userId: string) => {
    setLocalSelectedUsers(prev => 
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
    onVisibilityChange(localVisibility);
    onGroupsChange(localSelectedGroups);
    onUsersChange(localSelectedUsers);
    onBack();
  };

  const handleVisibilitySelect = (type: VisibilityType) => {
    setLocalVisibility(type);
    if (type === 'private' || type === 'public-all') {
      // 나만 보기나 모두 선택하기를 선택하면 특정 선택 초기화
      setLocalSelectedGroups([]);
      setLocalSelectedUsers([]);
    }
  };

  const sharedCount = localSelectedGroups.length + localSelectedUsers.length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-6 space-y-4">
        {/* 나만 보기 옵션 */}
        <button
          onClick={() => handleVisibilitySelect('private')}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            localVisibility === 'private' 
              ? 'border-black bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium">나만 보기</div>
              <div className="text-xs text-gray-500 mt-0.5">일정이 나에게만 표시됩니다</div>
            </div>
          </div>
          {localVisibility === 'private' && (
            <Check className="w-5 h-5 text-black" />
          )}
        </button>

        {/* 모두 선택하기 옵션 */}
        <button
          onClick={() => handleVisibilitySelect('public-all')}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            localVisibility === 'public-all' 
              ? 'border-black bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium">모두에게 공개</div>
              <div className="text-xs text-gray-500 mt-0.5">일정이 모든 사용자에게 표시됩니다</div>
            </div>
          </div>
          {localVisibility === 'public-all' && (
            <Check className="w-5 h-5 text-black" />
          )}
        </button>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-500">특정 대상 선택</span>
          </div>
        </div>

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
                const isChecked = localSelectedGroups.includes(group.id);
                return (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      handleGroupToggle(group.id);
                      // 특정 대상을 선택하면 자동으로 public-specific으로 변경
                      if (!isChecked && localVisibility !== 'public-specific') {
                        setLocalVisibility('public-specific');
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {
                        handleGroupToggle(group.id);
                        if (!isChecked && localVisibility !== 'public-specific') {
                          setLocalVisibility('public-specific');
                        }
                      }}
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
                const isChecked = localSelectedUsers.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      handleUserToggle(user.id);
                      if (!isChecked && localVisibility !== 'public-specific') {
                        setLocalVisibility('public-specific');
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {
                        handleUserToggle(user.id);
                        if (!isChecked && localVisibility !== 'public-specific') {
                          setLocalVisibility('public-specific');
                        }
                      }}
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
      {sharedCount > 0 && localVisibility === 'public-specific' && (
        <div className="border-t bg-white p-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">선택된 대상 ({sharedCount})</Label>
            <div className="flex flex-wrap gap-2">
              {localSelectedGroups.map((groupId) => {
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
              {localSelectedUsers.map((userId) => {
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