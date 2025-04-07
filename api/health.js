import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // 测试Supabase连接
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1);

      if (error) {
        throw error;
      }

      res.status(200).json({
        status: 'ok',
        message: '服务器运行正常',
        supabase: '连接成功',
        env: {
          supabaseUrl: supabaseUrl ? '已设置' : '未设置',
          supabaseKey: supabaseKey ? '已设置' : '未设置'
        }
      });
    } catch (error) {
      console.error('健康检查失败:', error);
      res.status(500).json({
        status: 'error',
        message: '服务器运行异常',
        error: error.message,
        env: {
          supabaseUrl: supabaseUrl ? '已设置' : '未设置',
          supabaseKey: supabaseKey ? '已设置' : '未设置'
        }
      });
    }
  } else {
    // 不支持的方法
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
