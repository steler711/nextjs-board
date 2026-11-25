// 게시물 저장소: DB 대신 posts.json 파일 하나에 모든 글을 저장한다.
// 파일이 실제로 어디 있는지(내 컴퓨터 / Vercel Blob)는 storage.ts가 정한다.
// 서버에서만 import 할 것.
import crypto from "crypto";
import { connection } from "next/server";
import { LIMITS } from "./limits";
import { readPosts, savePosts } from "./storage";

export type Post = {
  id: number;
  author: string;
  title: string;
  content: string;
  passwordHash: string; // 비밀번호 원문은 저장하지 않는다
  createdAt: string;
  updatedAt?: string;
};

// 화면과 API 응답에 내보내는 모양 (비밀번호 해시 제외)
export type PublicPost = Omit<Post, "passwordHash">;

// ---------- 파일 읽기/쓰기 ----------

async function readAll(): Promise<Post[]> {
  return (await readPosts()).posts;
}

// 동시에 두 요청이 파일을 쓰면 한쪽 내용이 사라질 수 있어서, 쓰기 작업을 한 줄로 세운다.
let queue: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

// 읽기 → 고치기 → 저장을 한 번에 한다.
// change가 { save: true }를 돌려줄 때만 저장한다.
// Vercel에서는 서버가 여러 대일 수 있어서, 그사이 다른 서버가 먼저 저장했으면 처음부터 다시 한다.
async function mutate<T>(change: (posts: Post[]) => { result: T; save: boolean }): Promise<T> {
  return withWriteLock(async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { posts, etag } = await readPosts();
      const { result, save } = change(posts);
      if (!save || (await savePosts(posts, etag))) return result;
    }
    throw new Error("다른 사람이 동시에 글을 저장하고 있습니다. 잠시 후 다시 시도하세요.");
  });
}

// ---------- 비밀번호 ----------

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const input = crypto.scryptSync(password, salt, 32);
  const saved = Buffer.from(hash, "hex");
  return saved.length === input.length && crypto.timingSafeEqual(saved, input);
}

function toPublic(post: Post): PublicPost {
  const { id, author, title, content, createdAt, updatedAt } = post;
  return { id, author, title, content, createdAt, updatedAt };
}

// ---------- 입력 검사 ----------

export class InputError extends Error {}

function text(value: unknown, label: string, limit: { min: number; max: number }, trim = true): string {
  if (typeof value !== "string") throw new InputError(`${label}을(를) 입력하세요.`);
  const v = trim ? value.trim() : value;
  if (v.length < limit.min) throw new InputError(`${label}을(를) 입력하세요.`);
  if (v.length > limit.max) throw new InputError(`${label}은(는) ${limit.max}자까지 쓸 수 있습니다.`);
  return v;
}

function password(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new InputError("비밀번호를 입력하세요.");
  if (value.length < LIMITS.password.min || value.length > LIMITS.password.max) {
    throw new InputError(`비밀번호는 ${LIMITS.password.min}~${LIMITS.password.max}자로 정하세요.`);
  }
  return value;
}

// ---------- 공개 함수 ----------

// 읽기 함수는 connection()으로 "요청이 올 때마다 파일을 새로 읽으라"고 Next.js에 알린다.
// 이게 없으면 빌드할 때 한 번 읽은 목록이 그대로 굳어 버린다.
export async function listPosts(): Promise<PublicPost[]> {
  await connection();
  const posts = await readAll();
  return posts.sort((a, b) => b.id - a.id).map(toPublic);
}

export async function getPost(id: number): Promise<PublicPost | null> {
  await connection();
  const post = (await readAll()).find((p) => p.id === id);
  return post ? toPublic(post) : null;
}

export async function createPost(input: Record<string, unknown>): Promise<PublicPost> {
  const author = text(input.author, "이름", LIMITS.author);
  const pw = password(input.password);
  const title = text(input.title, "제목", LIMITS.title);
  const content = text(input.content, "내용", LIMITS.content);

  const passwordHash = hashPassword(pw);

  return mutate((posts) => {
    const id = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const post: Post = {
      id,
      author,
      title,
      content,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    posts.push(post); // 기존 글은 그대로 두고 새 글을 뒤에 추가
    return { result: toPublic(post), save: true };
  });
}

export type MutationResult = { ok: true; post?: PublicPost } | { ok: false; reason: "not_found" | "wrong_password" };

export async function updatePost(id: number, input: Record<string, unknown>): Promise<MutationResult> {
  const pw = password(input.password);
  const title = text(input.title, "제목", LIMITS.title);
  const content = text(input.content, "내용", LIMITS.content);

  return mutate<MutationResult>((posts) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return { result: { ok: false, reason: "not_found" }, save: false };
    if (!checkPassword(pw, post.passwordHash)) return { result: { ok: false, reason: "wrong_password" }, save: false };
    post.title = title;
    post.content = content;
    post.updatedAt = new Date().toISOString();
    return { result: { ok: true, post: toPublic(post) }, save: true };
  });
}

export async function deletePost(id: number, input: Record<string, unknown>): Promise<MutationResult> {
  const pw = password(input.password);

  return mutate<MutationResult>((posts) => {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return { result: { ok: false, reason: "not_found" }, save: false };
    if (!checkPassword(pw, posts[index].passwordHash)) return { result: { ok: false, reason: "wrong_password" }, save: false };
    posts.splice(index, 1);
    return { result: { ok: true }, save: true };
  });
}
