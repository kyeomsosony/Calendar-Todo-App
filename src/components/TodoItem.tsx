import { TodoItem as TodoItemType, User } from "../types/todo";
import { Checkbox } from "./ui/checkbox";
import {
  Bell,
  Image,
  MessageSquare,
  Flag,
  Camera,
  Edit,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";

interface TodoItemProps {
  todo: TodoItemType;
  canComplete: boolean;
  onToggleComplete: (id: string) => void;
  onSelectTodo: (todo: TodoItemType) => void;
  onEdit: (todo: TodoItemType) => void;
  showAuthor?: boolean;
  author?: User;
  isPastDue?: boolean;
  canEdit?: boolean;
}

export function TodoItem({
  todo,
  canComplete,
  onToggleComplete,
  onSelectTodo,
  onEdit,
  showAuthor = false,
  author,
  isPastDue = false,
  canEdit = true,
}: TodoItemProps) {
  const getRecordIcon = () => {
    if (!todo.hasRecord) return null;

    const iconClass = "w-4 h-4";
    if (todo.recordType === "photo") {
      return <Camera className={iconClass} />;
    } else if (todo.recordType === "thought") {
      return <MessageSquare className={iconClass} />;
    } else if (todo.recordType === "both") {
      return (
        <>
          <Camera className={iconClass} />
          <MessageSquare className={iconClass} />
        </>
      );
    }
  };

  // 날짜를 "MM월 DD일" 형식으로 변환
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "";

    // yyyy-MM-dd 형식
    const isoMatch = dateStr.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
    );
    if (isoMatch) {
      const [_, year, month, day] = isoMatch;
      return `${parseInt(month)}월 ${parseInt(day)}일`;
    }

    // MM/DD or MM.DD 형식
    const dateMatch = dateStr.match(/(\d{1,2})[./](\d{1,2})/);
    if (dateMatch) {
      const [_, month, day] = dateMatch;
      return `${parseInt(month)}월 ${parseInt(day)}일`;
    }

    return dateStr;
  };

  // 표시할 시간/날짜 정보
  const getDisplayTime = () => {
    if (isPastDue) {
      // 과거 투두는 날짜 표시
      return formatDate(todo.date);
    } else {
      // 현재/미래 투두는 시간 표시
      return todo.time || todo.startTime;
    }
  };

  const displayTime = getDisplayTime();

  return (
    <div className="bg-white border border-gray-100 rounded-xl flex items-center gap-3 pt-[0px] pr-[16px] pb-[0px] pl-[0px]">
      <div
        onClick={() => canComplete && onToggleComplete(todo.id)}
        className={`${canComplete ? "cursor-pointer" : "cursor-default"} pl-4 py-4.5`}
      >
        <Checkbox
          checked={todo.isCompleted}
          onCheckedChange={() =>
            canComplete && onToggleComplete(todo.id)
          }
          disabled={!canComplete}
          className="w-5 h-5 rounded-full border border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onSelectTodo(todo)}
        >
          <div className="flex items-center gap-2 mb-0.5">
            {showAuthor && author && (
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5 border border-gray-200">
                  <AvatarImage
                    src={author.avatar}
                    alt={author.name}
                  />
                  <AvatarFallback>
                    {author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {author.name}
                </span>
              </div>
            )}
          </div>
          <h3
            className={`mb-0.5 ${todo.isCompleted ? "line-through text-gray-400" : isPastDue ? "text-red-500" : "text-gray-900"}`}
          >
            {todo.title}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {displayTime && (
              <span
                className={
                  isPastDue ? "text-red-500" : "text-gray-400"
                }
              >
                {displayTime}
              </span>
            )}
            <div className="flex items-center gap-1 text-gray-400">
              {getRecordIcon()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {todo.hasRecord && (
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
            )}
            {!todo.isPublic && (
              <div className="text-gray-300 text-xs">🔒</div>
            )}
          </div>

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(todo);
              }}
              className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 mx-[0px] m-[0px] px-[25px] py-[20px] text-[13px]"
            >
              수정
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}