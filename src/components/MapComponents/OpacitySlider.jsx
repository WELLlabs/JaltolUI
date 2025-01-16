
import PropTypes from 'prop-types';

const OpacitySlider = ({ opacity, onChange }) => {
  return (
    <div className="bg-white p-2 rounded shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-black">Opacity:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-black">{Math.round(opacity * 100)}%</span>
      </div>
    </div>
  );
};

OpacitySlider.propTypes = {
  opacity: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default OpacitySlider;