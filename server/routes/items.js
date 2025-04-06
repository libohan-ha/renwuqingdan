import express from 'express';
import Item from '../models/Item.js';

const router = express.Router();

// 内存中的本地存储，当MongoDB连接失败时使用
const localStore = {
  tasks: [],
  articles: [],
  ideas: [],
  knowledge: []
};

// 获取指定类别的所有项目
router.get('/:category', async (req, res) => {
  const category = req.params.category;
  
  // 验证类别
  if (!['tasks', 'articles', 'ideas', 'knowledge'].includes(category)) {
    return res.status(400).json({ message: '无效的类别' });
  }
  
  try {
    let items = [];
    try {
      // 尝试从MongoDB获取数据
      items = await Item.find({ category }).sort({ createdAt: -1 });
    } catch (dbError) {
      console.error('MongoDB查询失败:', dbError);
      // 回退到本地存储
      items = localStore[category];
    }
    
    res.json(items);
  } catch (error) {
    console.error('获取项目失败:', error);
    res.status(500).json({ message: error.message });
  }
});

// 创建新项目
router.post('/', async (req, res) => {
  const { content, category } = req.body;
  
  // 验证输入
  if (!content || !category) {
    return res.status(400).json({ message: '内容和类别是必需的' });
  }
  
  if (!['tasks', 'articles', 'ideas', 'knowledge'].includes(category)) {
    return res.status(400).json({ message: '无效的类别' });
  }
  
  try {
    let newItem;
    
    try {
      // 尝试保存到MongoDB
      const item = new Item({ content, category });
      newItem = await item.save();
    } catch (dbError) {
      console.error('MongoDB保存失败:', dbError);
      // 回退到本地存储
      newItem = {
        _id: Date.now().toString(),
        content,
        category,
        createdAt: new Date().toISOString()
      };
      localStore[category].unshift(newItem);
    }
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ message: error.message });
  }
});

// 更新项目
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ message: '内容是必需的' });
  }
  
  try {
    let updatedItem;
    
    try {
      // 尝试更新MongoDB
      updatedItem = await Item.findByIdAndUpdate(
        id, 
        { content },
        { new: true }
      );
      
      if (!updatedItem) {
        return res.status(404).json({ message: '项目未找到' });
      }
    } catch (dbError) {
      console.error('MongoDB更新失败:', dbError);
      // 回退到本地存储
      const category = Object.keys(localStore).find(cat => 
        localStore[cat].some(item => item._id === id)
      );
      
      if (!category) {
        return res.status(404).json({ message: '项目未找到' });
      }
      
      const itemIndex = localStore[category].findIndex(item => item._id === id);
      localStore[category][itemIndex].content = content;
      updatedItem = localStore[category][itemIndex];
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ message: error.message });
  }
});

// 删除项目
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    let deleted = false;
    
    try {
      // 尝试从MongoDB删除
      const result = await Item.findByIdAndDelete(id);
      deleted = !!result;
    } catch (dbError) {
      console.error('MongoDB删除失败:', dbError);
      // 回退到本地存储
      const category = Object.keys(localStore).find(cat => 
        localStore[cat].some(item => item._id === id)
      );
      
      if (category) {
        localStore[category] = localStore[category].filter(item => item._id !== id);
        deleted = true;
      }
    }
    
    if (!deleted) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    res.json({ message: '项目已删除' });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 