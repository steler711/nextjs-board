// posts.json을 어디에 저장할지 정하는 곳.
//
// - 내 컴퓨터(npm run dev): 프로젝트의 data/posts.json 파일을 읽고 쓴다.
// - Vercel: 배포된 폴더는 읽기 전용이라 파일을 쓸 수 없다.
//   그래서 같은 posts.json을 Vercel Blob(파일 저장소)에 올려 두고 읽고 쓴다.
//
// Blob 저장소가 프로젝트에 연결되면 Vercel이 BLOB_READ_WRITE_TOKEN 환경변수를 넣어 준다.
// 이 값이 있으면 Blob, 없으면 로컬 파일을 쓴다.
import { promises as fs } from "fs";
import path from "path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import seedPosts from "@/data/posts.json";
import type { Post } from "./posts";

const LOCAL_FILE = path.join(process.cwd(), "data", "posts.json");
const BLOB_PATH = "board/posts.json";

export const usingBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// etag = 파일의 "버전 표시". 저장할 때 내가 읽은 버전과 같은지 확인하는 데 쓴다.
export type Snapshot = { posts: Post[]; etag?: string };

export async function readPosts(): Promise<Snapshot> {
  if (usingBlob()) {
    // 비밀번호 해시가 들어 있으므로 private(비공개)로 저장한다.
    // useCache: false = 캐시된 옛날 내용이 아니라 항상 최신 내용을 읽는다.
    const res = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) {
      // Blob에 아직 파일이 없으면(첫 배포) 프로젝트에 들어 있던 posts.json을 처음 내용으로 쓴다.
      return { posts: structuredClone(seedPosts) as Post[] };
    }
    const text = await new Response(res.stream).text();
    return { posts: JSON.parse(text) as Post[], etag: res.blob.etag };
  }

  try {
    const text = await fs.readFile(LOCAL_FILE, "utf-8");
    return { posts: JSON.parse(text) as Post[] };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { posts: [] };
    throw err;
  }
}

// 저장하려는 사이에 다른 요청이 먼저 저장했으면 false를 돌려준다. (그러면 다시 읽고 다시 시도)
export async function savePosts(posts: Post[], etag?: string): Promise<boolean> {
  const json = JSON.stringify(posts, null, 2) + "\n";

  if (usingBlob()) {
    try {
      await put(BLOB_PATH, json, {
        access: "private",
        contentType: "application/json; charset=utf-8",
        addRandomSuffix: false,
        allowOverwrite: true,
        ifMatch: etag, // 내가 읽은 버전일 때만 덮어쓴다
      });
      return true;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError) return false;
      throw err;
    }
  }

  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, json, "utf-8");
  return true;
}
