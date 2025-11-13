import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function InfoPanel() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBackClick = () => {
    navigate('/wiser');
  };

  const handlePanelClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Back button - positioned to the left of InfoPanel */}
      <button
        onClick={handleBackClick}
        className="
          border-2 border-black absolute
          rounded-lg
          bg-white/80
          backdrop-blur-sm
          shadow-lg
          z-10
          p-0
          flex items-center justify-center
          w-12 h-12
          hover:bg-white
          hover:border-sky-400
          transition-colors
          /* Mobile: to the left of centered panel */
          top-4 left-4
          /* Desktop: to the left of left-floating panel */
          md:left-4 md:top-4
        "
        aria-label="Back to WISER page"
      >
        <ChevronLeft className="w-3 h-3 text-black" />
      </button>

      {/* Info Panel */}
      <div
        onClick={handlePanelClick}
        className={`
          border-2 border-black
          absolute
          rounded-lg
          bg-white/90
          backdrop-blur-sm
          shadow-lg
          z-10
          cursor-pointer
          overflow-hidden
          transition-all duration-300 ease-in-out
          hover:border-sky-400
          /* Mobile: centered but shifted right to avoid back button overlap */
          top-4 left-1/2 -translate-x-1/2 ml-6
          w-[calc(100%-5rem)] max-w-sm
          /* Mobile: collapsed/expanded height */
          ${isExpanded ? 'h-64' : 'h-12'}
          /* Desktop: float to the left */
          md:left-20 md:top-4 md:bottom-auto md:translate-x-0 md:ml-0
          md:w-80
          /* Desktop: collapsed/expanded height */
          ${isExpanded ? 'md:h-96' : 'md:h-[48px]'}
        `}
        aria-label="WISER Dashboard Info Panel"
        aria-expanded={isExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePanelClick();
          }
        }}
      >
        <div
          className="
            h-full w-full
            flex flex-col
            items-start justify-start
            px-2 py-2
            gap-1
          "
        >
          <div
            className="
              inline-flex items-center justify-center
              rounded-md
              px-2
              text-base font-semibold text-gray-800
              transition-colors
              cursor-pointer
              select-none
            "
          >
            WISER Layers
          </div>

          {isExpanded && (
            <div className="w-full border-t border-black py-2 space-y-3">
              <div className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-2 px-1">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="
                    flex h-9 w-9 items-center justify-center
                    px-0 py-0
                    rounded-md border border-gray-200
                    bg-white/80
                    transition-colors
                  "
                  aria-label="Previous layer (coming soon)"
                >
                  <ChevronLeft className="h-3 w-3 text-black" />
                </button>

                <div className="text-center text-sm font-semibold text-gray-800">
                  Cropping Intensity
                </div>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="
                    flex h-9 w-9 items-center justify-center
                    px-0 py-0
                    rounded-md border border-gray-200
                    bg-white/80
                    transition-colors
                  "
                  aria-label="Next layer (coming soon)"
                >
                  <ChevronRight className="h-3 w-3 text-black" />
                </button>
              </div>

              <div className="space-y-1.5 px-1">
                {[
                  { label: 'Very Low', color: 'bg-[rgb(215,25,28)]' },
                  { label: 'Low', color: 'bg-[rgb(253,174,97)]' },
                  { label: 'Moderate', color: 'bg-[rgb(255,255,191)] text-gray-800' },
                  { label: 'High', color: 'bg-[rgb(171,217,233)] text-gray-800' },
                  { label: 'Very High', color: 'bg-[rgb(44,123,182)]' },
                ].map(({ label, color }) => (
                  <div
                    key={label}
                    className="
                      flex items-center gap-3
                      text-xs font-medium text-gray-700
                    "
                  >
                    <span
                      className={`
                        inline-flex h-4 w-4 rounded
                        border border-black/10
                        ${color}
                      `}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default InfoPanel;

