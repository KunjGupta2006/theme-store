
interface TimelineEvent {
  id: string;
  status: string;
  changedAt: Date;
  changedBy: string;
  note?: string | null;
}

interface OrderStatusTimelineProps {
  currentStatus: string;
  history: TimelineEvent[];
  createdAt: Date;
}

export function OrderStatusTimeline({ currentStatus, history, createdAt }: OrderStatusTimelineProps) {
  return (
    <div className="bg-[#FAF7F2] border border-black/6 rounded p-6">
      <h2 className="text-sm font-medium text-[#111111] mb-6">Status History</h2>
      
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-black/10">
        {/* Current Status */}
        <div className="relative">
          <div className="absolute left-[-24px] top-1 w-[9px] h-[9px] rounded-full bg-[#111111] border-2 border-white ring-1 ring-[#111111]" />
          <p className="text-sm font-medium text-[#111111]">{currentStatus}</p>
        </div>

        {/* History */}
        {history.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="absolute left-[-24px] top-1 w-2 h-2 rounded-full bg-white border border-black/20" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-[#666666]">{entry.status}</p>
              <p className="text-[10px] text-[#999999]">
                {new Date(entry.changedAt).toLocaleString("en-IN")} · By {entry.changedBy}
              </p>
              {entry.note && (
                <p className="text-xs text-[#111111] mt-1 bg-white border border-black/10 rounded p-2">
                  <span className="font-medium">Note:</span> {entry.note}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Initial Placed State */}
        <div className="relative">
          <div className="absolute left-[-24px] top-1 w-2 h-2 rounded-full bg-white border border-black/20" />
          <p className="text-sm text-[#666666]">PLACED</p>
          <p className="text-[10px] text-[#999999] mt-0.5">
            {new Date(createdAt).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
