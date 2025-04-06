import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ItemList from './components/ItemList';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './styles/modern.css';

function App() {
  return (
    <Router>
      <div className="app-container min-h-screen gradient-bg text-white overflow-x-hidden">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<ItemList category="tasks" />} />
            <Route path="/articles" element={<ItemList category="articles" />} />
            <Route path="/ideas" element={<ItemList category="ideas" />} />
            <Route path="/knowledge" element={<ItemList category="knowledge" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;