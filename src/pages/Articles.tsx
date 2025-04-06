import { BookOpen } from 'lucide-react';
import ItemManager from '../components/ItemManager';

function Articles() {
  return (
    <ItemManager
      title="Articles"
      icon={<BookOpen className="w-8 h-8 text-purple-500" />}
      storageKey="articles"
    />
  );
}

export default Articles;