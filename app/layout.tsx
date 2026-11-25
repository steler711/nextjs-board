import type { Metadata } from "next";
import Link from "next/link";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans_KR({
  variable: "--font-plex",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const gowun = Gowun_Batang({
  variable: "--font-gowun",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "수업 게시판",
  description: "이름과 비밀번호만으로 글을 남기는 게시판",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${plex.variable} ${gowun.variable} antialiased`}>
      <body className="font-sans">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          {/* 왼쪽 빨간 선 = 공책 여백선 */}
          <div className="min-h-dvh border-l-2 border-margin/70 pb-24 pl-5 sm:pl-12">
            <header className="border-b-2 border-ink pt-12 pb-5 sm:pt-16">
              <Link
                href="/"
                className="font-serif text-4xl font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-5xl"
              >
                수업 게시판
              </Link>
              <p className="mt-3 text-pencil">
                글을 쓸 때 정한 비밀번호로 나중에 글을 고치거나 지울 수 있어요.
              </p>
            </header>
            <main className="pt-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
