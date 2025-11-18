// Vercel 배포 시 환경 변수 사용, 개발 시 info.tsx의 값 사용
import { projectId as devProjectId, publicAnonKey as devPublicAnonKey } from './info';

// 안전하게 환경 변수 접근
const getEnvVar = (key: string): string | undefined => {
  try {
    return import.meta?.env?.[key];
  } catch {
    return undefined;
  }
};

export const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || `https://${devProjectId}.supabase.co`;
export const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || devPublicAnonKey;
export const projectId = getEnvVar('VITE_SUPABASE_PROJECT_ID') || devProjectId;