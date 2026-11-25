"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { dangerClass, secondaryClass } from "./ButtonLink";

// 삭제 버튼을 누르면 그 자리에 비밀번호 입력칸이 열린다.
export default function DeletePost({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const password = new FormData(event.currentTarget).get("password");
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (res?.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    const json = res ? await res.json().catch(() => ({})) : {};
    setPending(false);
    setError(json.error ?? "삭제하지 못했습니다. 다시 시도하세요.");
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={dangerClass}>
        삭제
      </button>
    );
  }

  return (
    <form onSubmit={handleDelete} className="w-full border-l-4 border-margin bg-margin/5 px-4 py-4">
      <label htmlFor="delete-password" className="font-medium">
        삭제하려면 비밀번호를 입력하세요. 지운 글은 되돌릴 수 없습니다.
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          id="delete-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-11 w-52 border-0 border-b-2 border-rule bg-transparent px-0 focus:border-margin focus:outline-none"
        />
        <button type="submit" disabled={pending} className={dangerClass}>
          {pending ? "삭제하는 중…" : "삭제하기"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className={secondaryClass}
        >
          취소
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-margin">
          {error}
        </p>
      )}
    </form>
  );
}
