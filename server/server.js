import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import itemRoutes from './routes/items.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/items', itemRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('正在启动服务器...');
  
  // 尝试连接数据库
  const isConnected = await connectDB();
  
  if (!isConnected) {
    console.warn('MongoDB连接失败，服务将继续运行但可能功能受限');
  }

  app.listen(PORT, () => {
    console.log(`服务器已启动，端口: ${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
  });
};

startServer().catch(err => {
  console.error('服务器启动失败:', err);
}); 