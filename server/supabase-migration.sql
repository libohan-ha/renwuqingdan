-- 创建items表
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tasks', 'articles', 'ideas', 'knowledge')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 创建一个用于健康检查的表
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入一条健康检查记录
INSERT INTO health_check (status) VALUES ('ok');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- 创建触发器函数来自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为items表创建触发器
CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建公开访问策略（在实际生产环境中，你可能需要更严格的策略）
CREATE POLICY "Allow public access to items" ON items
  FOR ALL
  USING (true)
  WITH CHECK (true);
