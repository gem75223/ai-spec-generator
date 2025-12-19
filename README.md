# AI Spec Generator (MdCreater)

這是一個基於 AI 的規格書產生器專案，結合了 Spring Boot 後端與 React 前端，並使用 PostgreSQL 作為資料庫。

## 專案架構

- **Frontend**: React, Vite, TailwindCSS (Port: 3001)
- **Backend**: Java Spring Boot (Port: 8080)
- **Database**: PostgreSQL (Port: 5432)

## 快速啟動 (Quick Start)

本專案使用 Docker Compose 進行容器化管理，您只需要一個指令即可啟動所有服務。

### 1. 啟動所有服務
在專案根目錄下執行：

```bash
docker-compose up -d --build
```
*   此指令會自動編譯前端與後端，並啟動資料庫。
*   `-d`: 在背景執行。
*   `--build`: 確保使用最新的程式碼進行建置。

### 2. 訪問應用程式
啟動完成後，請打開瀏覽器訪問：
*   **前端頁面**: [http://localhost:3001](http://localhost:3001)
*   **後端 API**: [http://localhost:8080](http://localhost:8080)

## 開發與更新 (Development Workflow)

如果您修改了程式碼（無論是前端 `.jsx` 還是後端 `.java`），請依照以下步驟更新服務：

### 修正程式碼後重新啟動
若您只修改了程式碼，想套用更新：

```bash
# 停止並重新建置啟動 (推薦)
docker-compose up -d --build
```
Docker 會自動偵測變更並重新編譯需要的部分。

### 停止服務
若要完全停止並移除容器：

```bash
docker-compose down
```

## 常見問題排除 (Troubleshooting)

### Q: 為什麼看到 "User not found" 錯誤？
**A:** 如果您重啟了 Docker 且資料庫被重置（Volume 重建），但您的瀏覽器還保留著舊的登入憑證 (Token)，就會發生此錯誤。
**解決方法**：
1. 在網頁上點擊「登出」。
2. 重新註冊一個新帳號並登入。

### Q: 連線失敗或服務未啟動？
**A:** 您可以使用以下指令查看服務狀態与日誌：

```bash
# 查看所有容器狀態
docker ps

# 查看後端錯誤日誌
docker logs mdcreater-backend-1

# 查看前端錯誤日誌
docker logs mdcreater-frontend-1
```
