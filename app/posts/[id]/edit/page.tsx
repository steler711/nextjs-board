import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import PostForm from "@/components/PostForm";

export default function EditPage({ params }: PageProps<"/posts/[id]/edit">) {
  return (
    <>
      <h1 className="mb-8 font-serif text-2xl font-bold">글 수정</h1>
      <Suspense fallback={<p className="text-pencil">글을 불러오는 중입니다.</p>}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const post = Number.isInteger(id) ? await getPost(id) : null;
  if (!post) notFound();
  return <PostForm mode="edit" post={post} />;
}
