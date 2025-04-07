# Supabase设置指南

本项目已从MongoDB迁移到Supabase。请按照以下步骤设置Supabase：

## 1. 创建Supabase账户和项目

1. 访问 [Supabase](https://supabase.com/) 并注册账户
2. 创建新项目
3. 记下项目URL和anon key（公共API密钥）

## 2. 设置数据库

1. 在Supabase仪表板中，导航到SQL编辑器
2. 创建新查询
3. 复制并粘贴 `server/supabase-migration.sql` 文件中的内容
4. 运行SQL脚本

## 3. 配置环境变量

1. 编辑项目根目录下的 `server/.env` 文件
2. 更新以下变量：
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

## 4. 启动应用

1. 安装依赖（如果尚未安装）：`npm install`
2. 启动开发服务器：`npm run dev`

## 数据库结构

Supabase数据库包含以下表：

### items表

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| content | TEXT | 项目内容 |
| category | TEXT | 类别（tasks, articles, ideas, knowledge） |
| created_at | TIMESTAMP | 创建时间，自动生成 |
| updated_at | TIMESTAMP | 更新时间，自动更新 |

### health_check表

用于检查数据库连接状态的简单表。

## API端点

所有API端点保持不变：

- `GET /api/items/:category` - 获取指定类别的所有项目
- `POST /api/items` - 创建新项目
- `PUT /api/items/:id` - 更新项目
- `DELETE /api/items/:id` - 删除项目

## 本地存储

应用程序仍然支持离线模式，使用本地存储在网络不可用时保存数据。当连接恢复时，本地数据将自动同步到Supabase。
