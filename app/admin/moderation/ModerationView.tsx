import Image from 'next/image';
import { ContentQueueItem } from '@/types/database.types';
import Skeleton from '@/components/Skeleton';

interface ModerationViewProps {
  items: ContentQueueItem[];
  loading: boolean;
  error: string | null;
  bulkLoading: boolean;
  processingIds: Set<string>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
}

export default function ModerationView({
  items,
  loading,
  error,
  bulkLoading,
  processingIds,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
}: ModerationViewProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-600">Approve or reject photos and videos before publishing to feed.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBulkApprove}
            disabled={bulkLoading || loading || items.length === 0}
            className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {bulkLoading ? 'Approving...' : 'Approve All'}
          </button>
          <button
            type="button"
            onClick={onBulkReject}
            disabled={bulkLoading || loading || items.length === 0}
            className="rounded-full bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {bulkLoading ? 'Rejecting...' : 'Reject All'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error loading content:</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-red-600">Check browser console for diagnostic details.</p>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <p className="text-slate-500">No pending content waiting for review.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">Item {item.id}</p>
                  <p className="text-slate-600">Uploaded by: {item.uploaded_by ? item.uploaded_by.substring(0, 8) : 'Unknown'}</p>
                  <p className="text-sm text-slate-500">Status: <span className="capitalize">{item.status.toLowerCase()}</span></p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onApprove(item.id)}
                    disabled={processingIds.has(item.id) || bulkLoading}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {processingIds.has(item.id) ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(item.id)}
                    disabled={processingIds.has(item.id) || bulkLoading}
                    className="rounded-full bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {processingIds.has(item.id) ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
              {item.file_url && (
                <div className="relative h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <Image
                    src={item.file_url}
                    alt={`Content item ${item.id}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
