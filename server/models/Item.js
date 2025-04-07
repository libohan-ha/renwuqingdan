import supabase from '../config/supabase.js';

// Supabase不需要模型定义，但我们可以创建一个工具类来处理数据

const CATEGORIES = ['tasks', 'articles', 'ideas', 'knowledge'];

const ItemModel = {
  // 获取指定类别的所有项目
  async findByCategory(category) {
    if (!CATEGORIES.includes(category)) {
      throw new Error('无效的类别');
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 创建新项目
  async create(itemData) {
    if (!itemData.content || !CATEGORIES.includes(itemData.category)) {
      throw new Error('无效的项目数据');
    }

    const { data, error } = await supabase
      .from('items')
      .insert([{
        content: itemData.content,
        category: itemData.category,
        // Supabase会自动处理created_at字段
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新项目
  async findByIdAndUpdate(id, updateData) {
    if (!updateData.content) {
      throw new Error('内容是必需的');
    }

    const { data, error } = await supabase
      .from('items')
      .update({ content: updateData.content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除项目
  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default ItemModel;