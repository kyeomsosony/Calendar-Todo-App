import { User, Group } from '../types/todo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Plus } from 'lucide-react';

interface UserHeaderProps {
  user?: User;
  group?: Group;
}

export function UserHeader({ user, group }: UserHeaderProps) {
  if (group) {
    return (
      <div className="px-6 py-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border border-gray-200 rounded-full bg-gray-50 flex items-center justify-center text-3xl">
              {group.avatar}
            </div>
            <div>
              <h2 className="text-xl text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-400">{group.memberIds.length}명의 멤버</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-6 py-6 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border border-gray-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-400">each task shapes who we become.</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
