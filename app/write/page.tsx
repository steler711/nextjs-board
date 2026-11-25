import PostForm from "@/components/PostForm";

export const metadata = { title: "글쓰기 | 수업 게시판" };

export default function WritePage() {
  return (
    <>
      <h1 className="mb-8 font-serif text-2xl font-bold">글쓰기</h1>
      <PostForm mode="create" />
    </>
  );
}
