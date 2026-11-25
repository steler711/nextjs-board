import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { formatDayTime } from "@/lib/format";
import DeletePost from "@/components/DeletePost";
import { secondaryClass } from "@/components/ButtonLink";

export default function PostPage({ params }: PageProps<"/posts/[id]">) {
  return (
    <Suspense fallback={<p className="text-pencil">글을 불러오는 중입니다.</p>}>
      <PostDetail params={params} />
    </Suspense>
  );
}

async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const post = Number.isInteger(id) ? await getPost(id) : null;
  if (!post) notFound();

  return (
    <article>
      <h1 className="font-serif text-3xl leading-snug font-bold text-ink sm:text-4xl">{post.title}</h1>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-b-2 border-rule pb-4 text-sm text-pencil">
        <span className="font-medium text-graphite">{post.author}</span>
        <time dateTime={post.createdAt}>{formatDayTime(post.createdAt)}</time>
        {post.updatedAt && <span>수정됨 {formatDayTime(post.updatedAt)}</span>}
      </p>

      <div className="ruled mt-6 min-h-48 text-[1.0625rem] break-words whitespace-pre-wrap">{post.content}</div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/" className={secondaryClass}>
          목록
        </Link>
        <Link href={`/posts/${post.id}/edit`} className={secondaryClass}>
          수정
        </Link>
        <DeletePost id={post.id} />
      </div>
    </article>
  );
}
