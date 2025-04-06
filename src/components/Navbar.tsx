import { Book, Brain, CheckSquare, Lightbulb, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/modern.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const navLinks = [
    { path: '/', label: '首页', icon: null },
    { path: '/tasks', label: '任务', icon: <CheckSquare className="w-5 h-5" /> },
    { path: '/articles', label: '文章', icon: <Book className="w-5 h-5" /> },
    { path: '/ideas', label: '想法', icon: <Lightbulb className="w-5 h-5" /> },
    { path: '/knowledge', label: '知识', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-b-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="text-fuchsia-500 h-8 w-8 mr-2" />
              <span className="text-white font-black text-2xl title-glow tracking-tighter">思维<span className="text-gradient">助手</span></span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium space-x-2 transition-all duration-300 hover:scale-105 
                    ${isActive(link.path) 
                      ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white border-flow pill-button' 
                      : 'text-gray-300 hover:text-white'}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden gradient-bg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon && <span className="mr-3">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 