"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LIMITS } from "@/lib/limits";
import { primaryClass, secondaryClass } from "./ButtonLink";

type Props =
  | { mode: "create" }
  | { mode: "edit"; post: { id: number; author: string; title: string; content: string } };

const fieldClass =
  "w-full border-0 border-b-2 border-rule bg-transparent px-0 py-2 text-graphite placeholder:text-pencil/60 focus:border-ink focus:outline-none";

export default function PostForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isEdit = props.mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const res = await fetch(isEdit ? `/api/posts/${props.post.id}` : "/api/posts", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (!res) {
      setPending(false);
      setError("서버에 연결하지 못했습니다. 개발 서버가 켜져 있는지 확인하세요.");
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPending(false);
      setError(json.error ?? "저장하지 못했습니다. 다시 시도하세요.");
      return;
    }
    router.push(`/posts/${json.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="author" className="text-sm font-medium text-pencil">
            이름
          </label>
          {isEdit ? (
            <p id="author" className="border-b-2 border-transparent py-2">
              {props.post.author}
            </p>
          ) : (
            <input
              id="author"
              name="author"
              required
              maxLength={LIMITS.author.max}
              autoComplete="nickname"
              className={fieldClass}
            />
          )}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-pencil">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isEdit ? undefined : LIMITS.password.min}
            maxLength={isEdit ? undefined : LIMITS.password.max}
            autoComplete={isEdit ? "current-password" : "new-password"}
            aria-describedby="password-hint"
            className={fieldClass}
          />
          <p id="password-hint" className="mt-1.5 text-sm text-pencil">
            {isEdit
              ? "글을 쓸 때 정한 비밀번호나 관리자 비밀번호를 입력하세요."
              : `${LIMITS.password.min}~${LIMITS.password.max}자. 글을 고치거나 지울 때 필요해요.`}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium text-pencil">
          제목
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={LIMITS.title.max}
          defaultValue={isEdit ? props.post.title : ""}
          className={`${fieldClass} font-serif text-xl`}
        />
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-medium text-pencil">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          maxLength={LIMITS.content.max}
          defaultValue={isEdit ? props.post.content : ""}
          className="ruled mt-1 block w-full resize-y border-0 border-b-2 border-rule bg-transparent p-0 text-graphite focus:border-ink focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="border-l-4 border-margin bg-margin/10 px-4 py-3 text-margin">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryClass}>
          {pending ? "저장하는 중…" : isEdit ? "수정 저장" : "등록하기"}
        </button>
        <Link href={isEdit ? `/posts/${props.post.id}` : "/"} className={secondaryClass}>
          취소
        </Link>
      </div>
    </form>
  );
}
