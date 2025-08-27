const LandCoverChangeChartSkeleton = ({ animated = true }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm min-h-[12rem]">
      {/* Header skeleton */}
      <div className="mb-3 flex items-center justify-between">
        <div className={`h-4 w-48 rounded bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
        <div className="flex items-center gap-2">
          <div className={`h-3 w-16 rounded-full bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
          <div className={`h-3 w-16 rounded-full bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
          <div className={`h-3 w-16 rounded-full bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className="relative w-full h-[40vh]">
        {/* Y-axis labels skeleton */}
        <div className="absolute left-0 top-0 h-full w-8">
          <div className={`absolute top-0 h-3 w-6 rounded bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
          <div className={`absolute top-1/2 -translate-y-1/2 h-3 w-6 rounded bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
          <div className={`absolute bottom-0 h-3 w-6 rounded bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 left-8">
          <div className="absolute top-0 h-px w-full bg-gray-100" />
          <div className="absolute top-1/4 h-px w-full bg-gray-100" />
          <div className="absolute top-1/2 h-px w-full bg-gray-100" />
          <div className="absolute top-3/4 h-px w-full bg-gray-100" />
          <div className="absolute bottom-0 h-px w-full bg-gray-200" />
        </div>

        {/* Bars skeleton */}
        <div className="absolute inset-x-0 bottom-0 left-10 right-2 flex items-end justify-between gap-2">
          {[
            'h-8','h-16','h-10','h-24','h-20','h-14','h-28','h-12','h-20','h-16'
          ].map((h, i) => (
            <div key={i} className={`w-6 rounded-t bg-gray-300/80 ${animated ? 'animate-pulse' : ''} ${h}`} />
          ))}
        </div>
      </div>

      {/* X-axis labels skeleton */}
      <div className="mt-3 flex items-center justify-between pl-10 pr-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-2 w-8 rounded bg-gray-200 ${animated ? 'animate-pulse' : ''}`} />
        ))}
      </div>
    </div>
  );
};

export default LandCoverChangeChartSkeleton;


