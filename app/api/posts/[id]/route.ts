import { deletePost, getPost, InputError, updatePost, type MutationResult } from "@/lib/posts";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function failure(result: Extract<MutationResult, { ok: false }>) {
  if (result.reason === "not_found") {
    return Response.json({ error: "글을 찾을 수 없습니다. 이미 지워졌을 수 있습니다." }, { status: 404 });
  }
  return Response.json({ error: "비밀번호가 맞지 않습니다." }, { status: 403 });
}

async function readBody(request: Request) {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
}

// GET /api/posts/:id : 글 하나
export async function GET(_request: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const post = id ? await getPost(id) : null;
  if (!post) return Response.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  return Response.json(post);
}

// PUT /api/posts/:id : 글 수정 (비밀번호 필요)
export async function PUT(request: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const body = await readBody(request);
  if (!id || !body) return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  try {
    const result = await updatePost(id, body);
    return result.ok ? Response.json(result.post) : failure(result);
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}

// DELETE /api/posts/:id : 글 삭제 (비밀번호 필요)
export async function DELETE(request: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const body = await readBody(request);
  if (!id || !body) return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  try {
    const result = await deletePost(id, body);
    return result.ok ? new Response(null, { status: 204 }) : failure(result);
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
