# 時區問題分析與解決方案

## 問題描述
- **資料庫顯示**: `2025-11-04 09:00:00`
- **Dashboard 顯示**: `05:00 PM` (17:00)
- **時差**: +8 小時

## 原因分析

### 目前的實作
1. **資料庫欄位類型**: `timestamp without time zone`
   - 不儲存時區資訊
   - 只是一個「本地時間」的數字

2. **資料讀取過程**:
   ```
   資料庫: 2025-11-04 09:00:00 (無時區)
   → Drizzle ORM 讀取時假設為 UTC
   → JavaScript Date: 2025-11-04 09:00:00 UTC
   → date-fns format 轉換為本地時區 (UTC+8)
   → 顯示: 17:00 (09:00 + 8 = 17:00)
   ```

## 解決方案

### 方案 A: 使用 `timestamp with time zone` (推薦)
**優點**:
- PostgreSQL 標準做法
- 正確處理不同時區的使用者
- 自動處理夏令時間

**需要確認的問題**:
1. 資料庫中現有的 `09:00:00` 是指：
   - UTC 時間的 09:00？
   - 還是本地時間 (UTC+8) 的 09:00？

2. 您希望顯示的時間是：
   - 用戶的本地時間？
   - 還是固定的某個時區時間？

**如果現有資料是 UTC 時間**:
- 執行 migration
- 資料會被解釋為 UTC 時間
- 顯示時會自動轉換為本地時區 (UTC+8)
- 結果：09:00 UTC → 17:00 UTC+8 ✓ (這是正確的)

**如果現有資料是 UTC+8 時間**:
- 需要先轉換資料 (減 8 小時)
- 然後執行 migration
- 結果：09:00 本地時間保持顯示為 09:00 ✓

### 方案 B: 保持 `timestamp without time zone`
在顯示時不轉換時區：
```typescript
export function formatTime(date: Date | number): string {
  // 使用 UTC 格式，不轉換時區
  return format(date, 'hh:mm a', {
    timeZone: 'UTC'
  })
}
```

**優點**:
- 不需要修改資料庫
- 簡單快速

**缺點**:
- 無法支援多時區使用者
- 不符合最佳實踐

## 實施結果 ✅

**已實施策略**:
- ✅ **儲存**: 統一使用 UTC 時間
- ✅ **顯示**: 依使用者時區 (預設 Asia/Taipei)

**Migration 已完成** (2025-11-04):
1. ✓ 將所有 timestamp 欄位改為 `timestamp with time zone`
2. ✓ 將現有資料從本地時間 (UTC+8) 轉換為 UTC
3. ✓ 驗證資料正確性

**轉換範例**:
```
原始資料 (本地時間): 2025-11-04 09:00:00
資料庫 (UTC):        2025-11-04 01:00:00+00
顯示 (Asia/Taipei):  2025-11-04 09:00 ✓
```

**Migration 文件**:
- `drizzle/0001_add_timezone_to_timestamps.sql`

**下一步**:
- 測試 Dashboard 顯示是否正確
- 未來所有新資料都會自動以 UTC 儲存
