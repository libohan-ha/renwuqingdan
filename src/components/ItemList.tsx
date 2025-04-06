import { Book, CheckSquare, Copy, Edit, Lightbulb, Loader2, Plus, Save, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createItem, deleteItem, getItems, updateItem } from '../api/api';
import '../styles/modern.css';

interface Item {
  _id: string;
  content: string;
  category: string;
  createdAt: string;
}

interface ItemListProps {
  category: string;
}

function ItemList({ category }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemContent, setNewItemContent] = useState('');

  const categoryIcons: Record<string, JSX.Element> = {
    tasks: <CheckSquare className="w-5 h-5 text-fuchsia-400" />,
    articles: <Book className="w-5 h-5 text-cyan-400" />,
    ideas: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    knowledge: <Sparkles className="w-5 h-5 text-green-400" />
  };

  const categoryColors: Record<string, string> = {
    tasks: 'border-fuchsia-500/30 hover:border-fuchsia-500/60',
    articles: 'border-cyan-500/30 hover:border-cyan-500/60',
    ideas: 'border-yellow-500/30 hover:border-yellow-500/60',
    knowledge: 'border-green-500/30 hover:border-green-500/60'
  };

  const categoryTitles: Record<string, string> = {
    tasks: '任务',
    articles: '文章',
    ideas: '想法',
    knowledge: '知识'
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getItems(category);
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('无法加载内容，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;
    
    try {
      setIsLoading(true);
      const newItem = await createItem(newItemContent, category);
      setItems(prevItems => [newItem, ...prevItems]);
      setNewItemContent('');
    } catch (err) {
      console.error('Error adding item:', err);
      setError('添加失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // 可以添加一个临时的"已复制"提示
        console.log('内容已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制到剪贴板失败:', err);
      });
  };

  const handleEdit = (item: Item) => {
    setEditingId(item._id);
    setEditContent(item.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (id: string) => {
    if (editContent.trim() === '') return;
    
    try {
      await updateItem(id, editContent, category);
      setItems(items.map(item => 
        item._id === id ? { ...item, content: editContent } : item
      ));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating item:', err);
      alert('更新失败，请稍后重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除此项吗？')) return;
    
    try {
      await deleteItem(id);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('删除失败，请稍后重试');
    }
  };

  // 过滤搜索结果
  const filteredItems = items.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen gradient-bg text-white flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen gradient-bg text-white flex flex-col items-center justify-center p-6">
        <div className="text-xl font-bold text-red-500 mb-2">{error}</div>
        <button 
          onClick={fetchItems}
          className="pill-button px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen sliced-bg text-white p-6">
      <div className="relative py-8">
        <div className="absolute top-20 left-10 w-32 h-32 bg-fuchsia-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-cyan-500 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto">
          
          {/* 标题和搜索添加区域 */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col mb-4 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-black mb-2 text-white tracking-tighter leading-none">
                {categoryTitles[category] || '内容'}
              </h1>
              <div className="flex items-center ml-2">
                {categoryIcons[category]}
                <span className="text-lg text-gray-300 ml-2">共 {items.length} 项</span>
              </div>
            </div>

            {/* 搜索和添加区域 - 更加紧凑 */}
            <div className="md:w-auto backdrop-blur-md bg-black/30 rounded-xl border border-gray-700 p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="w-full sm:w-40 pl-7 pr-2 py-2 text-sm border border-gray-700 rounded-lg bg-black/50 text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="添加内容..."
                    className="flex-1 sm:w-40 px-2 py-2 text-sm border border-gray-700 rounded-lg bg-black/50 text-white focus:outline-none focus:border-cyan-500 transition-all"
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemContent.trim() || isLoading}
                    className="px-2 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white flex items-center hover:from-fuchsia-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-white">
              {error}
            </div>
          )}
          
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-500 rounded-2xl bg-black/20 backdrop-blur-sm">
              <p className="text-xl text-gray-400">暂无内容</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredItems.map(item => (
                <div 
                  key={item._id} 
                  className={`relative card-modern p-6 border border-2 rounded-2xl bg-black/40 backdrop-blur-md ${categoryColors[category]} transform transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
                  
                  {editingId === item._id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 text-lg border-2 border-gray-700 rounded-xl bg-black/60 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        rows={4}
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 flex items-center space-x-2 text-white rounded-lg bg-gray-800 hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                          <span>取消</span>
                        </button>
                        <button
                          onClick={() => handleSaveEdit(item._id)}
                          className="px-4 py-2 flex items-center space-x-2 text-white rounded-lg bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-700 hover:to-cyan-700"
                        >
                          <Save className="w-4 h-4" />
                          <span>保存</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg text-white mb-4">{item.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {new Date(item.createdAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopy(item.content)}
                            className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-800/50"
                            title="复制内容"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-800/50"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-gray-300 hover:text-red-400 rounded-full hover:bg-gray-800/50"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemList; 