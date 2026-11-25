// 입력값 길이 제한. 화면(클라이언트)과 서버가 같이 쓴다.
export const LIMITS = {
  author: { min: 1, max: 20 },
  password: { min: 4, max: 20 },
  title: { min: 1, max: 100 },
  content: { min: 1, max: 5000 },
} as const;
