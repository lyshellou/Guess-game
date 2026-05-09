# GuessGame

微信小程序多人房间框架。第一版使用微信云开发，实现创建房间、输入房号加入房间、查看成员、离开房间，并预留 `gameState` 给后续具体游戏接入。

## 快速开始

1. 使用微信开发者工具导入本目录。
2. 将 `project.config.json` 中的 `appid` 替换为你的小程序 AppID。
3. 开通云开发后，将 `app.js` 中的 `your-env-id` 替换为你的云开发环境 ID。
4. 在云开发数据库中创建 `rooms` 集合。
5. 右键部署以下云函数，并安装依赖：
   - `createRoom`
   - `joinRoom`
   - `leaveRoom`
   - `getRoom`

## 当前能力

- 创建 6 位数字房号的房间。
- 输入房号加入等待中的房间。
- 展示房间状态、房号、成员和房主。
- 离开房间，最后一人离开时将房间标记为关闭。
- 预留 `gameState` 字段，后续游戏逻辑可以挂在房间数据上。

## 后续接入游戏

具体游戏建议从 `pages/room/room.wxml` 的“游戏占位”区域开始替换 UI，并通过云函数读写 `rooms.gameState`。如果游戏需要更强实时性，再增加数据库监听或 WebSocket 服务。
