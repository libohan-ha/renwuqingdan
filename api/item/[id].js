import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  // 处理PUT请求 - 更新项目
  if (req.method === 'PUT') {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: '内容是必需的' });
    }

    try {
      // 更新Supabase中的项目
      const { data, error } = await supabase
        .from('items')
        .update({ content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ message: '项目未找到' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('更新项目失败:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // 处理DELETE请求 - 删除项目
  else if (req.method === 'DELETE') {
    try {
      // 从Supabase删除项目
      const { data, error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ message: '项目未找到' });
      }

      res.status(200).json({ message: '项目已删除' });
    } catch (error) {
      console.error('删除项目失败:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    // 不支持的方法
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
