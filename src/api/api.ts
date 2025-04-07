import axios from 'axios';

// 在开发环境使用localhost，在生产环境使用相对路径
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  : '/api';

export interface Item {
  // Supabase使用id而created_at作为字段名
  id: string;
  content: string;
  category: string;
  created_at: string;

  // 兼容旧版字段名
  _id?: string;
  createdAt?: string;
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

// 同步本地项目到服务器
const syncLocalItems = async () => {
  try {
    const categories = ['tasks', 'articles', 'ideas', 'knowledge'];

    for (const category of categories) {
      const localItems = getLocalItems(category);

      // 找出本地生成的项目（ID以local_开头）
      const localGeneratedItems = localItems.filter(item =>
        (item._id && item._id.startsWith('local_')) ||
        (item.id && item.id.startsWith('local_'))
      );

      if (localGeneratedItems.length > 0) {
        console.log(`尝试同步 ${localGeneratedItems.length} 个本地${category}项目到服务器...`);

        // 尝试将每个本地项目同步到服务器
        for (const item of localGeneratedItems) {
          try {
            // 创建新项目到服务器
            const response = await axios.post(`${API_URL}/items`, {
              content: item.content,
              category: item.category || category
            });

            const itemId = item._id || item.id;
            // 从本地存储中移除此本地项目
            const updatedLocalItems = localItems.filter(localItem =>
              (localItem._id !== itemId) && (localItem.id !== itemId)
            );
            // 添加服务器返回的项目
            updatedLocalItems.push(response.data);
            // 更新本地存储
            saveLocalItems(category, updatedLocalItems);

            console.log(`成功同步项目: ${item.content.substring(0, 20)}...`);
          } catch (err) {
            console.error(`无法同步本地项目:`, err);
          }
        }
      }
    }
  } catch (error) {
    console.error('同步本地项目时出错:', error);
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
  // 尝试同步本地项目到服务器
  await syncLocalItems().catch(err => console.error('同步失败:', err));

  try {
    const response = await axios.get(`${API_URL}/categories/${category}`);

    // 更新本地存储，确保与服务器数据同步
    saveLocalItems(category, response.data);

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
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      category,
      created_at: new Date().toISOString(),
      // 兼容旧版字段
      _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    const localItems = getLocalItems(category);
    saveLocalItems(category, [...localItems, newItem]);

    return newItem;
  }
};

// 更新项目
export const updateItem = async (id: string, content: string, category: string) => {
  // 如果是本地项目，先尝试同步到服务器
  if (id.startsWith('local_')) {
    try {
      await syncLocalItems();
      // 重新获取本地存储中的项目，检查是否已同步到服务器
      const localItems = getLocalItems(category);
      const localItem = localItems.find(item => (item._id === id) || (item.id === id));

      // 如果本地项目仍然存在，直接更新本地存储
      if (localItem) {
        const updatedItems = localItems.map(item =>
          (item._id === id || item.id === id) ? {
            ...item,
            content,
            updated_at: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : item
        );
        saveLocalItems(category, updatedItems);
        return { ...localItem, content };
      }
    } catch (err) {
      console.error('同步本地项目失败:', err);
    }
  }

  try {
    const response = await axios.put(`${API_URL}/item/${id}`, { content });

    // 同步更新本地存储
    const localItems = getLocalItems(category);
    const updatedItems = localItems.map(item =>
      (item._id === id || item.id === id) ? { ...item, content } : item
    );
    saveLocalItems(category, updatedItems);

    return response.data;
  } catch (error) {
    logError('updateItem', error);

    // 如果是本地项目，只更新本地存储
    if (id.startsWith('local_')) {
      const localItems = getLocalItems(category);
      const updatedItems = localItems.map(item =>
        (item._id === id || item.id === id) ? {
          ...item,
          content,
          updated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : item
      );
      saveLocalItems(category, updatedItems);
      const updatedItem = updatedItems.find(item => (item._id === id) || (item.id === id));
      if (updatedItem) return updatedItem;
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
      const filteredItems = localItems.filter(item =>
        (item._id !== id) && (item.id !== id)
      );
      if (localItems.length !== filteredItems.length) {
        saveLocalItems(category, filteredItems);
        return { success: true };
      }
    }
    return { success: false, message: 'Item not found in local storage' };
  }

  // 否则尝试从API中删除
  try {
    const response = await axios.delete(`${API_URL}/item/${id}`);

    // 同步更新所有本地存储类别
    const categories = ['tasks', 'articles', 'ideas', 'knowledge'];
    for (const category of categories) {
      const localItems = getLocalItems(category);
      const filteredItems = localItems.filter(item =>
        (item._id !== id) && (item.id !== id)
      );
      saveLocalItems(category, filteredItems);
    }

    return response.data;
  } catch (error) {
    logError('deleteItem', error);
    throw error;
  }
};