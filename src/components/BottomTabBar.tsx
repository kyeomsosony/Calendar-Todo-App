import { Home, Calendar, Image, Settings } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: 'home' | 'calendar' | 'records' | 'settings';
  onTabChange: (tab: 'home' | 'calendar' | 'records' | 'settings') => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs = [
    { id: 'home' as const, label: '홈', icon: Home },
    { id: 'calendar' as const, label: '캘린더', icon: Calendar },
    { id: 'records' as const, label: '기록', icon: Image },
    { id: 'settings' as const, label: '설정', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
              <span className={`text-xs ${isActive ? '' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
