import { Loader2, Send, Shapes, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/api';
import '../styles/modern.css';

function Home() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categorizeWithAI = async (content: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-cffc721340d64048a4d65b2fe3b8c8b7'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个精准的内容分类专家。请仔细分析用户输入的文本，并将其严格按照内容特征分类到以下类别中：

              - 待办任务（task）：
                * 明确需要执行的具体行动或计划
                * 通常包含动词+目标的结构
                * 经常有时间指示词如"明天"、"下周"等
                * 示例："明天需要完成报告"、"记得买牛奶"
              
              - 待看文章（article）：
                * 具体的阅读材料、媒体内容或引用资源
                * 包含书籍、文章、视频、链接、论文等
                * 可能有书名号、引号或URL
                * 示例："《思考快与慢》这本书"、"https://example.com/article"
              
              - 想法（idea）：
                * 个人感悟、观点、感受或主观评价
                * 通常是对某事物的思考或态度
                * 常包含"我觉得"、"我认为"、"感觉"等主观表达
                * 示例："这个设计方案很有创意"、"我觉得这个方法可行"
              
              - 干货知识（knowledge）：
                * 客观事实、专业知识、方法论或经验总结
                * 通常是陈述句，表达某种规律或原理
                * 具有普遍适用性和参考价值
                * 示例："Vue中组件通信的三种方式"、"营销的核心是用户价值"

              请严格按照以下格式返回分类结果（每个类别可以有多个条目，也可以没有）：
              
              待办任务：
              1. [任务内容1]
              2. [任务内容2]
              
              待看文章：
              1. [文章内容1]
              2. [文章内容2]
              
              想法：
              1. [想法内容1]
              2. [想法内容2]
              
              干货知识：
              1. [知识内容1]
              2. [知识内容2]

              分类规则：
              1. 一定要严格根据内容特征进行分类，而不是根据形式或上下文推测
              2. 如果某内容明确跨越多个类别，应将其拆分为不同的条目分别归类
              3. 如果某内容不明确属于任何类别，优先考虑其最主要的特征进行分类
              4. 同一句话中可能包含多个不同类别的内容，需要精确识别和拆分
              5. 不要强行将所有内容都分类，如果真的无法分类，可以不列出该内容
              6. 分类时务必保持内容的完整性和原意

              示例输入：
              "今天看了《精益创业》这本书，书中提到的MVP理念很有启发性。我觉得我们团队也应该尝试这种方法。明天和产品经理讨论一下这个想法，http://lean.org 这个网站上有更多相关资料可以参考。记住，用户反馈永远是产品迭代的核心驱动力。"
              
              示例输出：
              待办任务：
              1. 明天和产品经理讨论一下这个想法
              
              待看文章：
              1. 《精益创业》这本书
              2. http://lean.org 这个网站上有更多相关资料可以参考
              
              想法：
              1. 书中提到的MVP理念很有启发性
              2. 我觉得我们团队也应该尝试这种方法
              
              干货知识：
              1. 用户反馈永远是产品迭代的核心驱动力`
            },
            {
              role: 'user',
              content
            }
          ],
          stream: false
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error categorizing content:', error);
      return '干货知识：\n1. ' + content;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const categorizedContent = await categorizeWithAI(content);
      
      // 初始化每个类别的分类项目
      const categorizedItems: Record<string, string[]> = {
        tasks: [],
        articles: [],
        ideas: [],
        knowledge: []
      };

      // 解析分类结果
      let currentCategory = '';
      const lines = categorizedContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // 检查是否为类别标题
        if (trimmedLine.endsWith('：') || trimmedLine.endsWith(':')) {
          switch (trimmedLine.replace(/[：:]/g, '').trim()) {
            case '想法':
              currentCategory = 'ideas';
              break;
            case '待办任务':
              currentCategory = 'tasks';
              break;
            case '待看文章':
              currentCategory = 'articles';
              break;
            case '干货知识':
            case '干货':
              currentCategory = 'knowledge';
              break;
            default:
              currentCategory = '';
              break;
          }
          continue;
        }

        // 如果有当前类别并且该行以数字开头，则是一个项目
        if (currentCategory && /^\d+\.\s/.test(trimmedLine)) {
          const itemContent = trimmedLine.replace(/^\d+\.\s/, '').trim();
          if (itemContent && currentCategory in categorizedItems) {
            categorizedItems[currentCategory].push(itemContent);
          }
        }
      }

      // 保存到MongoDB并确定导航目标
      let savedItemsCount = 0;
      let mostPopulatedCategory = '';
      let maxItemCount = -1;

      // 并行保存所有分类项目到MongoDB
      const savePromises = [];
      
      for (const [category, contents] of Object.entries(categorizedItems)) {
        if (contents.length > 0) {
          // 更新最多项目的类别
          if (contents.length > maxItemCount) {
            maxItemCount = contents.length;
            mostPopulatedCategory = category;
          }
          
          // 创建保存每个项目的Promise
          for (const content of contents) {
            savePromises.push(createItem(content, category));
          }
        }
      }
      
      // 等待所有项目保存完成
      await Promise.all(savePromises);

      setContent('');
      navigate(`/${mostPopulatedCategory || 'knowledge'}`);
    } catch (error) {
      console.error('Error processing content:', error);
      alert('处理内容时发生错误，请稍后重试。');
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-white">
      <div className="relative sliced-bg py-12 px-6">
        <div className="absolute top-20 left-10 w-32 h-32 bg-fuchsia-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-cyan-500 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-start mb-16">
            <h1 className="text-5xl md:text-7xl font-black title-glow mb-8 text-gradient tracking-tighter leading-none">
              智能分类
              <span className="block mt-2 md:mt-0 ml-12 md:ml-24">思维助手</span>
            </h1>
            <div className="ml-4 flex items-center space-x-4">
              <Shapes className="w-8 h-8 text-fuchsia-400" />
              <p className="text-lg md:text-xl text-gray-300 max-w-xl">
                输入任何内容，AI 将自动为您智能分类整理，创造有序思维。
              </p>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-300 opacity-10 rounded-lg transform rotate-12"></div>
            <div className="absolute -bottom-8 -right-2 w-24 h-24 bg-fuchsia-500 opacity-10 rounded-lg transform -rotate-12"></div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入你的想法、任务、学习资料或知识..."
              className="w-full h-60 md:h-72 p-6 text-lg md:text-xl border-2 border-flow rounded-2xl bg-black/60 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none bright-focus card-modern"
              style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.15)' }}
            />
            
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="mt-8 w-full md:w-auto md:ml-auto md:float-right pill-button bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-xl font-bold py-4 px-12 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>分类中...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>开始分类</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border border-fuchsia-500/30 rounded-lg bg-black/20 backdrop-blur-sm">
              <h3 className="text-fuchsia-400 text-lg font-bold">任务</h3>
              <p className="text-sm text-gray-400">行动计划</p>
            </div>
            <div className="p-4 border border-cyan-500/30 rounded-lg bg-black/20 backdrop-blur-sm">
              <h3 className="text-cyan-400 text-lg font-bold">文章</h3>
              <p className="text-sm text-gray-400">阅读材料</p>
            </div>
            <div className="p-4 border border-yellow-500/30 rounded-lg bg-black/20 backdrop-blur-sm">
              <h3 className="text-yellow-400 text-lg font-bold">想法</h3>
              <p className="text-sm text-gray-400">灵感火花</p>
            </div>
            <div className="p-4 border border-green-500/30 rounded-lg bg-black/20 backdrop-blur-sm">
              <h3 className="text-green-400 text-lg font-bold">知识</h3>
              <p className="text-sm text-gray-400">专业洞见</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;