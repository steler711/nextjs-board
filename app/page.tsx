import { Suspense } from "react";
import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { formatDay } from "@/lib/format";
import { primaryClass } from "@/components/ButtonLink";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold text-graphite">글 목록</h1>
        <Link href="/write" className={primaryClass}>
          글쓰기
        </Link>
      </div>
      <Suspense fallback={<p className="mt-8 text-pencil">목록을 불러오는 중입니다.</p>}>
        <PostList />
      </Suspense>
    </>
  );
}

async function PostList() {
  const posts = await listPosts();

  if (posts.length === 0) {
    return (
      <div className="mt-8 border-y border-rule py-12">
        <p className="text-lg">아직 글이 없어요.</p>
        <p className="mt-1 text-pencil">오른쪽 위 글쓰기 버튼으로 첫 글을 남겨 보세요.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="mb-2 text-sm text-pencil">글 {posts.length}개</p>
      <div
        aria-hidden
        className="hidden grid-cols-[3rem_1fr_7rem_6.5rem] gap-x-4 border-b-2 border-rule pb-2 text-sm text-pencil sm:grid"
      >
        <span>번호</span>
        <span>제목</span>
        <span>글쓴이</span>
        <span className="text-right">날짜</span>
      </div>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="border-b border-rule">
            <Link
              href={`/posts/${post.id}`}
              className="grid grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-1 py-3.5 transition-colors hover:bg-rule/35 focus-visible:outline-2 focus-visible:outline-ink sm:grid-cols-[3rem_1fr_7rem_6.5rem]"
            >
              <span className="text-sm text-pencil tabular-nums">{post.id}</span>
              <span className="truncate font-medium">{post.title}</span>
              <span className="col-start-2 truncate text-sm text-pencil sm:col-start-auto">
                {post.author}
                <span className="ml-3 tabular-nums sm:hidden">{formatDay(post.createdAt)}</span>
              </span>
              <span className="hidden text-right text-sm text-pencil tabular-nums sm:block">
                {formatDay(post.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
