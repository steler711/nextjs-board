import Link from "next/link";
import { secondaryClass } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <div className="py-8">
      <h1 className="font-serif text-2xl font-bold">글을 찾을 수 없습니다</h1>
      <p className="mt-2 text-pencil">주소가 틀렸거나 이미 지워진 글입니다.</p>
      <Link href="/" className={`${secondaryClass} mt-6`}>
        목록으로
      </Link>
    </div>
  );
}
