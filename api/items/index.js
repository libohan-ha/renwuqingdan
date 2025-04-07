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

  // 处理POST请求 - 创建新项目
  if (req.method === 'POST') {
    const { content, category } = req.body;

    // 验证输入
    if (!content || !category) {
      return res.status(400).json({ message: '内容和类别是必需的' });
    }

    if (!['tasks', 'articles', 'ideas', 'knowledge'].includes(category)) {
      return res.status(400).json({ message: '无效的类别' });
    }

    try {
      // 保存到Supabase
      const { data, error } = await supabase
        .from('items')
        .insert([{ content, category }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      console.error('创建项目失败:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    // 不支持的方法
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
