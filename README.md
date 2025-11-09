# Lifting Diary - 健身訓練日記

一個現代化的健身訓練記錄應用程式，幫助你追蹤每次訓練、管理運動項目，並記錄每組訓練的詳細資料。

## 線上展示

https://lifting-diary-vibe-coding.vercel.app/

## 功能特色

- **訓練管理**：建立、編輯和查看訓練記錄
- **日曆檢視**：透過日曆快速查看特定日期的訓練
- **運動追蹤**：為每次訓練加入多個運動項目
- **組數記錄**：詳細記錄每組訓練的重量（公斤）和次數
- **即時同步**：所有資料即時更新，無需重新整理頁面
- **響應式設計**：完美支援桌面和行動裝置
- **深色模式**：支援明暗主題切換
- **安全認證**：使用 Clerk 提供完整的使用者認證系統

## 技術架構

### 核心框架
- **[Next.js 16](https://nextjs.org/)** - React 框架，使用 App Router 架構
- **[React 19.2](https://react.dev/)** - UI 函式庫
- **[TypeScript 5](https://www.typescriptlang.org/)** - 型別安全的 JavaScript

### UI 與樣式
- **[Tailwind CSS v4](https://tailwindcss.com/)** - 現代化的 CSS 框架
- **[shadcn/ui](https://ui.shadcn.com/)** - 高品質的 React 元件庫
- **[Radix UI](https://www.radix-ui.com/)** - 可存取性的 UI 原語
- **[Lucide React](https://lucide.dev/)** - 精美的圖示套件

### 資料庫與 ORM
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL
- **[Drizzle ORM](https://orm.drizzle.team/)** - 輕量級 TypeScript ORM

### 認證與工具
- **[Clerk](https://clerk.com/)** - 完整的使用者認證與管理
- **[date-fns](https://date-fns.org/)** - 現代化的日期處理套件

## 資料模型

應用程式使用以下資料表：

- **exercises** - 運動項目參考表（如：深蹲、臥推、硬舉等）
- **workouts** - 訓練記錄表（每次訓練的基本資訊）
- **workout_exercises** - 訓練-運動關聯表（連接訓練與運動項目）
- **sets** - 組數記錄表（每組的重量、次數等詳細資料）

## 開始使用

### 環境需求

- Node.js 20.x 或更高版本
- npm 或 yarn

### 安裝步驟

1. Clone 專案

```bash
git clone <repository-url>
cd liftingdiary
```

2. 安裝相依套件

```bash
npm install
```

3. 設定環境變數

建立 `.env.local` 檔案並設定以下變數：

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Neon Database
DATABASE_URL=your_neon_database_url
```

4. 執行資料庫遷移

```bash
npm run db:migrate
```

5. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 可用指令

```bash
# 啟動開發伺服器
npm run dev

# 建置正式版本
npm run build

# 啟動正式伺服器
npm start

# 執行程式碼檢查
npm run lint

# 執行資料庫遷移
npm run db:migrate
```

## 專案結構

```
liftingdiary/
├── app/                          # Next.js App Router
│   ├── dashboard/               # 主要應用功能
│   │   ├── workout/            # 訓練相關頁面
│   │   │   ├── new/           # 新增訓練
│   │   │   └── [workoutId]/   # 訓練詳情
│   │   └── page.tsx           # 儀表板首頁
│   ├── layout.tsx             # 根佈局
│   └── page.tsx              # Landing Page
├── components/                # React 元件
│   └── ui/                   # shadcn/ui 元件
├── data/                      # 資料存取層（Drizzle 查詢）
├── src/
│   └── db/                   # 資料庫設定與 schema
│       ├── schema.ts        # Drizzle schema 定義
│       └── migrate.ts       # 遷移腳本
├── lib/                      # 工具函式
├── docs/                     # 專案文件
│   ├── auth.md              # 認證指南
│   ├── data-fetching.md     # 資料取得指南
│   ├── data-mutations.md    # 資料變更指南
│   ├── routing.md           # 路由架構指南
│   └── ui.md                # UI 規範
└── proxy.ts                 # Next.js Middleware（路由保護）
```

## 開發規範

本專案遵循嚴格的開發規範，詳見 `/docs` 目錄：

- **認證**：僅透過 Clerk 進行，需伺服器端驗證
- **路由**：所有應用路由位於 `/dashboard`，由 Middleware 保護
- **資料取得**：僅透過 Server Components + `/data` helper 函式
- **資料變更**：僅透過 `/data` helper 函式 + Server Actions（使用 Zod 驗證）
- **UI 元件**：僅使用 shadcn/ui
- **日期格式化**：使用 date-fns，格式為 `do MMM yyyy`

## 安全性

- 所有資料庫查詢都依 `userId` 過濾（防止未授權存取）
- 使用 Clerk 提供企業級身份驗證
- Server Actions 使用 Zod 進行輸入驗證
- 路由層級的 Middleware 保護
- TypeScript 嚴格模式確保型別安全

## 部署

本專案已部署至 Vercel，支援自動化部署流程：

1. 連接 GitHub Repository 至 Vercel
2. 設定環境變數（Clerk、Neon Database）
3. 自動部署每次 push 到 main 分支

## 授權

MIT License

## 致謝

感謝以下開源專案：
- Next.js 團隊
- shadcn/ui 專案
- Clerk 團隊
- Neon Database 團隊
- Drizzle ORM 團隊
