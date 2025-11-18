import { useState } from 'react';
import { Plus, Calendar, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingActionButtonProps {
  onCreateEvent: () => void;
  onCreateTodo: () => void;
}

export function FloatingActionButton({ onCreateEvent, onCreateTodo }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-3 mb-3 items-end"
          >
            {/* 이벤트 등록 버튼 */}
            <button
              onClick={() => {
                onCreateEvent();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-5 py-3 hover:shadow-xl transition-all group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-sm whitespace-nowrap">이벤트 등록</span>
            </button>

            {/* 투두 등록 버튼 */}
            <button
              onClick={() => {
                onCreateTodo();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-5 py-3 hover:shadow-xl transition-all group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <CheckSquare className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-sm whitespace-nowrap">투두 등록</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 FAB 버튼 */}
      <motion.button
        onClick={toggleMenu}
        className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
