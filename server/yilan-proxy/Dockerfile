# 使用輕量級的 Node 運行環境
FROM node:18-slim

# 設定程式在雲端運行的位置
WORKDIR /app

# 先複製安裝清單並安裝
COPY package*.json ./
RUN npm ci --only=production

# 複製其餘程式碼
COPY . .

# 開放 8080 端口
EXPOSE 8080

# 啟動指令
CMD ["node", "server.js"]