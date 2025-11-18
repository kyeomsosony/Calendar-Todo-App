export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  isMe?: boolean;
  isGroup?: boolean; // 그룹인지 개인인지 구분
  color?: string; // 그룹 뷰에서 사용자별 색상 구분
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserEmail: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserEmail: string;
  toUserId?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  friendAvatar?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  memberIds: string[]; // 그룹에 속한 사용자 ID 목록
  createdBy: string; // 그룹 생성자 ID
  createdAt: string;
  color?: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

export interface Invitation {
  userId: string;
  status: 'pending' | 'accepted' | 'declined'; // 대기/승인/거절
}

export type RecurringType = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'yearly' | 'custom';

export interface RecurringInfo {
  pattern: RecurringType; // type에서 pattern으로 변경
  endDate?: string; // 반복 종료 날짜 (YYYY-MM-DD)
  customDays?: number[]; // 사용자 설정 시 요일 (0=일요일, 6=토요일)
}

export interface Reminder {
  id: string;
  minutes: number; // 몇 분 전에 알림 (15, 30, 60, 1440 등)
  label: string; // 표시용 라벨 (15분 전, 1시간 전 등)
}

export interface TodoItem {
  id: string;
  title: string;
  type?: 'todo' | 'event'; // 투두 또는 이벤트 구분
  date?: string;
  time?: string;
  isCompleted: boolean;
  isPublic: boolean;
  userId: string;
  hasRecord: boolean; // 사진/생각 기록 여부
  recordType?: 'photo' | 'thought' | 'both';
  description?: string;
  tags?: string[];
  sharedWith?: string[]; // 공개 대상 (그룹 ID 또는 사용자 ID) - Visibility 용도
  invitations?: Invitation[]; // 초대 목록 - 상대방 캘린더에 추가
  invitedUsers?: string[]; // 초대된 사용자/그룹 ID 목록
  location?: string; // 이벤트 위치
  startDate?: string; // 이벤트 시작 날짜
  startTime?: string; // 이벤트 시작 시간
  endTime?: string; // 이벤트 종료 시간
  endDate?: string; // 이벤트 종료 날짜
  isAllDay?: boolean; // 종일 이벤트 여부
  recurring?: RecurringInfo; // 반복 설정
  reminders?: Reminder[]; // 알림 설정 (최대 3개)
}

export interface Record {
  id: string;
  todoId: string;
  type: 'photo' | 'thought';
  content?: string; // 생각일 경우
  photoUrl?: string; // 사진일 경우
  createdAt: string;
  userId: string;
}

export interface Comment {
  id: string;
  todoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Journal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  content: string;
  isPublic: boolean;
  sharedWith?: string[]; // 공유 대상 (그룹 ID 또는 사용자 ID)
  createdAt: string;
  updatedAt: string;
}

export interface JournalComment {
  id: string;
  journalId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  location?: string;
  isPublic: boolean;
  userId: string;
  color?: string;
  description?: string;
  sharedWith?: string[]; // 공개 대상 (그룹 ID 또는 사용자 ID) - Visibility 용도
  invitations?: Invitation[]; // 초대 목록 - 상대방 캘린더에 추가
}

export type DateCategory = 'past' | 'today' | 'future';

export interface Notification {
  id: string;
  type: 'event_invite' | 'friend_request' | 'event_response' | 'friend_response';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  // 일정 초대 관련
  eventId?: string;
  eventTitle?: string;
  eventDate?: string;
  // 응답 알림 관련
  responseType?: 'accept' | 'reject';
}