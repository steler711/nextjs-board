import { createPost, InputError, listPosts } from "@/lib/posts";

// GET /api/posts : 글 목록
export async function GET() {
  return Response.json(await listPosts());
}

// POST /api/posts : 새 글 등록 (이름, 비밀번호, 제목, 내용)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  try {
    const post = await createPost(body);
    return Response.json(post, { status: 201 });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
