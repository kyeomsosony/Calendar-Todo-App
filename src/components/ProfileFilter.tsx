import { User, Group } from '../types/todo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface ProfileFilterProps {
  users: User[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProfileFilter({ users, selectedId, onSelect }: ProfileFilterProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all"
          >
            <div className={`relative transition-all ${selectedId === user.id ? 'opacity-100' : 'opacity-40'}`}>
              {user.isGroup ? (
                <div 
                  className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: user.color ? `${user.color}15` : '#f9fafb' }}
                >
                  👥
                </div>
              ) : (
                <Avatar className="w-12 h-12 border border-gray-200">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              )}
              {selectedId === user.id && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
              )}
            </div>
            <span className={`text-xs transition-all ${selectedId === user.id ? 'text-black' : 'text-gray-400'}`}>
              {user.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
