import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function YearSlider({ years, selectedYear, onYearChange }) {
  const currentIndex = years.indexOf(selectedYear);

  const handlePrev = (event) => {
    event.stopPropagation();
    if (currentIndex > 0) {
      onYearChange(years[currentIndex - 1]);
    }
  };

  const handleNext = (event) => {
    event.stopPropagation();
    if (currentIndex < years.length - 1) {
      onYearChange(years[currentIndex + 1]);
    }
  };

  const handleRangeChange = (event) => {
    event.stopPropagation();
    const index = Number(event.target.value);
    if (!Number.isNaN(index) && years[index] !== undefined) {
      onYearChange(years[index]);
    }
  };

  return (
    <div
      className="
        absolute
        bottom-4 left-1/2 -translate-x-1/2
        w-[calc(100%-2rem)] max-w-sm
        border-2 border-black
        rounded-lg
        bg-white/90
        backdrop-blur-sm
        shadow-md
        px-2 py-1
        z-10
      "
      aria-label="Cropping Intensity Year Slider"
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="
            flex h-8 w-8 items-center justify-center
            rounded-md border border-gray-200
            px-0 py-0
            bg-white/80
            text-black
            transition-colors
            hover:bg-gray-100
            disabled:opacity-40 disabled:hover:bg-white
          "
        >
          <ChevronLeft className="h-3 w-3 text-black" />
        </button>

        <div className="flex-1">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border border-black bg-white px-2.5 py-0.5 text-[10px] font-semibold text-gray-800 shadow-sm">
            {selectedYear}
          </div>

          <div className="relative h-1.5 rounded-full bg-gray-200">
            <input
              type="range"
              min={0}
              max={years.length - 1}
              step={1}
              value={Math.max(currentIndex, 0)}
              onChange={handleRangeChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Select year"
            />

            <div className="absolute inset-0 flex items-center justify-between px-1">
              {years.map((year) => {
                const isActive = year === selectedYear;
                return (
                  <span
                    key={year}
                    className={`
                      h-1.5 w-1.5 rounded-full border border-black/10
                      ${isActive ? 'bg-blue-500' : 'bg-gray-600'}
                    `}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex >= years.length - 1}
          className="
            flex h-8 w-8 items-center justify-center
            rounded-md border border-gray-200
            px-0 py-0
            bg-white/80
            text-black
            transition-colors
            hover:bg-gray-100
            disabled:opacity-40 disabled:hover:bg-white
          "
        >
          <ChevronRight className="h-3 w-3 text-black" />
        </button>
      </div>
    </div>
  );
}

YearSlider.propTypes = {
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedYear: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
};

export default YearSlider;

