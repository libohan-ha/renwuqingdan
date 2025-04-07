import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('加载的Supabase URL:', supabaseUrl);
console.log('加载的Supabase Key:', supabaseKey ? '已设置' : '未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase配置。请确保设置了SUPABASE_URL和SUPABASE_KEY环境变量。');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;
