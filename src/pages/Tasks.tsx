import { ListTodo } from 'lucide-react';
import ItemManager from '../components/ItemManager';

function Tasks() {
  return (
    <ItemManager
      title="Tasks"
      icon={<ListTodo className="w-8 h-8 text-blue-500" />}
      storageKey="tasks"
    />
  );
}

export default Tasks;