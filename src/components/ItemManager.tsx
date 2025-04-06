import { Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Item, createItem, deleteItem, getItems, updateItem } from '../api/api';

interface ItemManagerProps {
  title: string;
  icon: React.ReactNode;
  storageKey: string; // 现在作为类别名称使用
  renderItem?: (item: Item, onEdit: (item: Item) => void, onDelete: (id: string) => void) => React.ReactNode;
}

const ItemManager: React.FC<ItemManagerProps> = ({
  title,
  icon,
  storageKey, // 现在作为类别名称使用
  renderItem,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  // 加载数据
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const data = await getItems(storageKey);
        setItems(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setError('加载数据失败，请稍后再试。');
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [storageKey]);

  // 添加项目
  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;
    
    try {
      setIsLoading(true);
      const newItem = await createItem(newItemContent, storageKey);
      setItems(prevItems => [newItem, ...prevItems]);
      setNewItemContent('');
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('添加失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑项目
  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  // 删除项目
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      try {
        setIsLoading(true);
        await deleteItem(id);
        setItems(prevItems => prevItems.filter(item => item._id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        setError('删除失败，请稍后再试。');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 保存编辑
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem || !currentItem.content.trim()) return;
    
    try {
      setIsLoading(true);
      const updated = await updateItem(currentItem._id, currentItem.content, storageKey);
      setItems(prevItems => prevItems.map(item => item._id === currentItem._id ? updated : item));
      setCurrentItem(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update item:', err);
      setError('更新失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentItem) return;
    
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const filteredItems = items.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        {/* Title and Icon */}
        <div className="flex items-center space-x-2 mb-4">
          {icon}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {/* Search and Add Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="搜索..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:flex-none">
            <input
              type="text"
              placeholder="添加新内容..."
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              disabled={isLoading}
            />
            <button
              onClick={handleAddItem}
              className="flex items-center space-x-1 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newItemContent.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">添加</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isEditing && currentItem && (
        <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-medium mb-3">编辑 {title}</h2>
          <form onSubmit={handleSaveEdit}>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <textarea
                id="content"
                name="content"
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                value={currentItem.content}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">没有找到{title.toLowerCase()}</p>
          ) : (
            filteredItems.map(item => (
              renderItem ? (
                <React.Fragment key={item._id}>
                  {renderItem(item, handleEditItem, handleDeleteItem)}
                </React.Fragment>
              ) : (
                <div key={item._id} className="bg-white rounded-lg shadow p-3 sm:p-4 hover:shadow-md transition">
                  <div className="flex justify-between">
                    <p className="text-gray-900 text-sm sm:text-base mr-2 break-words flex-1">{item.content}</p>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-gray-500 hover:text-indigo-600 transition"
                        aria-label="Edit"
                        disabled={isLoading}
                      >
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-gray-500 hover:text-red-600 transition"
                        aria-label="Delete"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ItemManager; 