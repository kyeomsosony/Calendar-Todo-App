import { TodoItem as TodoItemType, User } from "../types/todo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";

interface EventItemProps {
  event: TodoItemType;
  onSelectEvent: (event: TodoItemType) => void;
  onEdit: (event: TodoItemType) => void;
  showAuthor?: boolean;
  author?: User;
  canEdit?: boolean;
}

export function EventItem({
  event,
  onSelectEvent,
  onEdit,
  showAuthor = false,
  author,
  canEdit = true,
}: EventItemProps) {
  const formatTime = (time?: string) => {
    if (!time) return "";
    // 시간에서 "오전/오후" 제거하고 숫자만 추출
    return time.replace(/[^0-9:]/g, "");
  };

  // 시간 표시 로직
  let startTime = "";
  let endTime = "";

  if (event.isAllDay) {
    startTime = "종일";
  } else {
    startTime = formatTime(event.time || event.startTime);
    endTime = formatTime(event.endTime);
  }

  const hasDescription = !!event.description;

  return (
    <div className="bg-white border border-gray-100 rounded-xl flex items-center gap-3 relative px-4 h-[62px] overflow-hidden">
      {/* 왼쪽: 시간과 제목/설명 영역 (클릭 시 상세 페이지로) */}
      <div
        className="flex-1 flex gap-3 cursor-pointer min-w-0 overflow-hidden"
        onClick={() => onSelectEvent(event)}
      >
        {/* 작성자 정보 (그룹뷰일 때만) - 상단에 표시 */}
        <div className="flex-1 m-[0px] min-w-0 overflow-hidden">
          {showAuthor && author && (
            <div className="flex items-center gap-1.5 mb-2">
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

          <div className="flex gap-3 items-center h-full">
            {/* 시간 (왼쪽) - 고정 너비 */}
            <div className="shrink-0 w-16 flex flex-col gap-0.5 justify-center">
              {startTime && (
                <div className="text-sm text-[rgb(0,0,0)] text-center text-[16px]">
                  {startTime}
                </div>
              )}
              {endTime && (
                <div className="text-sm text-[rgb(0,0,0)] text-center text-[16px] bg-[rgba(0,0,0,0)]">
                  {endTime}
                </div>
              )}
            </div>

            {/* 세로 구분선 */}
            <div className="w-px bg-gray-200 shrink-0 self-stretch"></div>

            {/* 제목과 설명 (오른쪽) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
              <div className="w-full min-w-0 overflow-hidden">
                <h3 className={`text-gray-900 truncate ${hasDescription ? 'text-[16px] leading-[1.2]' : ''}`}>
                  {event.title}
                </h3>

                {/* 설명 표시 */}
                {event.description && (
                  <p className="text-[13px] text-gray-400 mt-[2px] truncate leading-[1.2] overflow-hidden">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 수정 버튼 (본인 이벤트에만 표시) */}
      {canEdit && (
        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-[25px] py-[20px] text-[13px]"
          >
            수정
          </Button>
        </div>
      )}
    </div>
  );
}