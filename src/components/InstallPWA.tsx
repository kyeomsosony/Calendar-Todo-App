import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS 체크
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Standalone 모드 체크 (이미 설치됨)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // beforeinstallprompt 이벤트 리스너 (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 이전에 배너를 닫았는지 확인
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS에서 배너 표시 여부 결정
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // 이미 설치되었거나 배너를 표시하지 않을 경우
  if (!showInstallBanner || isStandalone) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 shadow-lg z-50 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Download className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {isIOS ? (
              <div className="space-y-1">
                <p className="font-medium">앱으로 설치하기</p>
                <p className="text-sm text-blue-100">
                  Safari 하단의 <span className="inline-block mx-1">⎙</span> 버튼을 누른 후 '홈 화면에 추가'를 선택하세요
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium">앱으로 설치하기</p>
                <p className="text-sm text-blue-100">
                  홈 화면에 추가하여 더 편리하게 사용하세요
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-500 hover:bg-blue-50"
            >
              설치
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-600 rounded"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
