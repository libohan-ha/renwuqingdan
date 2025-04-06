import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Item {
  _id: string;
  content: string;
  category: string;
  createdAt: string;
}

// 创建本地存储键名
const getLocalStorageKey = (category: string) => `knowledge_hub_${category}`;

// 从localStorage获取项目
const getLocalItems = (category: string): any[] => {
  try {
    const items = localStorage.getItem(getLocalStorageKey(category));
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// 保存项目到localStorage
const saveLocalItems = (category: string, items: any[]) => {
  try {
    localStorage.setItem(getLocalStorageKey(category), JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// 添加错误信息
const logError = (action: string, error: any) => {
  console.error(`API Error (${action}):`, error.response?.data || error.message || error);
  
  // 错误分析与改进的钩子
  if (error.response?.status === 429) {
    console.warn('Rate limit exceeded. Implementing backoff strategy.');
  }
};

// 获取项目
export const getItems = async (category: string) => {
  try {
    const response = await axios.get(`${API_URL}/items/${category}`);
    return response.data;
  } catch (error) {
    logError('getItems', error);
    console.info('Falling back to localStorage data');
    return getLocalItems(category);
  }
};

// 创建项目
export const createItem = async (content: string, category: string) => {
  try {
    const response = await axios.post(`${API_URL}/items`, { content, category });
    
    // 同步更新本地存储
    const localItems = getLocalItems(category);
    saveLocalItems(category, [...localItems, response.data]);
    
    return response.data;
  } catch (error) {
    logError('createItem', error);
    
    // 离线情况下保存到本地存储
    const newItem = {
      _id: `local_${Date.now()}`,
      content,
      category,
      createdAt: new Date().toISOString()
    };
    
    const localItems = getLocalItems(category);
    saveLocalItems(category, [...localItems, newItem]);
    
    return newItem;
  }
};

// 更新项目
export const updateItem = async (id: string, content: string, category: string) => {
  try {
    const response = await axios.put(`${API_URL}/items/${id}`, { content });
    
    // 同步更新本地存储
    const localItems = getLocalItems(category);
    const updatedItems = localItems.map(item => 
      item._id === id ? { ...item, content } : item
    );
    saveLocalItems(category, updatedItems);
    
    return response.data;
  } catch (error) {
    logError('updateItem', error);
    
    // 如果是本地项目，只更新本地存储
    if (id.startsWith('local_')) {
      const localItems = getLocalItems(category);
      const updatedItems = localItems.map(item => 
        item._id === id ? { ...item, content, updatedAt: new Date().toISOString() } : item
      );
      saveLocalItems(category, updatedItems);
    }
    
    throw error; // 仍然抛出错误，让调用者知道API调用失败
  }
};

// 删除项目
export const deleteItem = async (id: string) => {
  // 如果是本地项目，直接从本地存储中删除
  if (id.startsWith('local_')) {
    // 先尝试在所有类别中查找并删除
    const categories = ['tasks', 'articles', 'ideas', 'knowledge'];
    for (const category of categories) {
      const localItems = getLocalItems(category);
      const filteredItems = localItems.filter(item => item._id !== id);
      if (localItems.length !== filteredItems.length) {
        saveLocalItems(category, filteredItems);
        return { success: true };
      }
    }
    return { success: false, message: 'Item not found in local storage' };
  }
  
  // 否则尝试从API中删除
  try {
    const response = await axios.delete(`${API_URL}/items/${id}`);
    
    // 同步更新所有本地存储类别
    const categories = ['tasks', 'articles', 'ideas', 'knowledge'];
    for (const category of categories) {
      const localItems = getLocalItems(category);
      const filteredItems = localItems.filter(item => item._id !== id);
      saveLocalItems(category, filteredItems);
    }
    
    return response.data;
  } catch (error) {
    logError('deleteItem', error);
    throw error;
  }
}; 