import supabase from './supabase.js';

const connectDB = async () => {
  try {
    console.log('尝试连接到Supabase...');

    // 测试Supabase连接
    const { data, error } = await supabase.from('health_check').select('*').limit(1);

    if (error) {
      throw error;
    }

    console.log('Supabase连接成功');
    return true;
  } catch (error) {
    console.error(`Supabase连接错误: ${error.message}`);
    console.error('无法连接到Supabase。请检查URL和API密钥。');
    return false;
  }
};

export default connectDB;