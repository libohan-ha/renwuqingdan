import { Archive } from 'lucide-react';
import ItemManager from '../components/ItemManager';

function Knowledge() {
  return (
    <ItemManager
      title="Knowledge"
      icon={<Archive className="w-8 h-8 text-green-500" />}
      storageKey="knowledge"
    />
  );
}

export default Knowledge;