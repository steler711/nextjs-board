# Vercel 배포 방법

## 글이 어디에 저장되나

| 실행 위치 | 저장 위치 |
|---|---|
| 내 컴퓨터 (`npm run dev`) | 프로젝트의 `data/posts.json` |
| Vercel | Vercel Blob 저장소의 `board/posts.json` |

Vercel에 배포된 폴더는 읽기 전용이라 `data/posts.json`에 쓸 수 없다. 그래서 Vercel에서는 같은 내용의 JSON 파일을 Blob 저장소에 두고 읽고 쓴다. 어느 쪽을 쓸지는 `lib/storage.ts`가 `BLOB_READ_WRITE_TOKEN` 환경변수가 있는지 보고 정한다.

Blob에 아직 파일이 없으면(처음 배포했을 때) 프로젝트에 들어 있던 `data/posts.json`을 처음 내용으로 보여 준다. 첫 글을 쓰는 순간 Blob에 파일이 만들어진다. 그 뒤로는 `data/posts.json`을 고쳐도 사이트에 반영되지 않는다.

## 순서

1. 변경 내용을 커밋하고 GitHub에 push한다.
   ```powershell
   git add -A
   git commit -m "게시판"
   git branch -M main
   git remote add origin <GitHub 저장소 주소>
   git push -u origin main
   ```
2. Vercel에서 **Add New → Project**를 누르고 GitHub 저장소를 Import한 뒤 **Deploy**를 누른다.
   이 상태에서는 목록은 보이지만 글쓰기는 실패한다. 아직 Blob을 연결하지 않았기 때문이다.
3. Vercel 프로젝트 화면에서 **Storage → Create Database → Blob**을 고른다.
   - 접근 방식을 고르라고 나오면 **Private**을 고른다. posts.json에 비밀번호 해시가 들어 있어서 공개하면 안 된다.
   - 연결할 프로젝트로 이 게시판을 고른다. 환경(Production, Preview, Development)은 모두 체크한다.
   - 연결하면 `BLOB_READ_WRITE_TOKEN` 환경변수가 자동으로 추가된다.
4. **Deployments** 탭에서 가장 최근 배포의 메뉴(⋯)를 열고 **Redeploy**를 누른다.
   환경변수는 새로 배포할 때부터 적용된다.
5. 배포된 주소에서 글을 하나 써 본다. Storage → Blob 화면에 `board/posts.json`이 생기면 성공이다.

## 내 컴퓨터에서 Blob으로 실행해 보기 (선택)

```powershell
npx vercel link
npx vercel env pull .env.local
npm run dev
```

`.env.local`에 토큰이 들어오면 내 컴퓨터에서도 Blob에 저장된다. 토큰은 비밀번호와 같으니 GitHub에 올리지 않는다(`.gitignore`에 이미 `.env*`가 들어 있다).
