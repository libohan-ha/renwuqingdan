import { Lightbulb } from 'lucide-react';
import ItemManager from '../components/ItemManager';

function Ideas() {
  return (
    <ItemManager
      title="Ideas"
      icon={<Lightbulb className="w-8 h-8 text-yellow-500" />}
      storageKey="ideas"
    />
  );
}

export default Ideas;