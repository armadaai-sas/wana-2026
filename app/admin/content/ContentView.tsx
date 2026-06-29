import { ContentItem } from '@/types/database.types';
import Skeleton from '@/components/Skeleton';

interface ContentViewProps {
  items: ContentItem[];
  loading: boolean;
  onEdit?: (id: string) => void;
}

export default function ContentView({
  items,
  loading,
  onEdit,
}: ContentViewProps) {
  if (loading) return <Skeleton />;

  return (
    <>
      {items.length === 0 ? (
        <p className="text-slate-500">No content items found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold">ID</th>
                <th className="text-left py-3 px-4 font-semibold">Title</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Created</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs">{item.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4">{item.name || item.title || 'Untitled'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700">
                      {item.type || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
