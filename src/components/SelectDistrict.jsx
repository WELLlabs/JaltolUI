import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { selectedDistrictAtom } from '../recoil/selectAtoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect } from 'react';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: '10px',
    padding: '2px',
    boxShadow: 'none',
    border: '1px solid #ced4da',
    ':hover': {
      borderColor: '#adb5bd',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '10px',
    marginTop: '0px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d', // Set a specific color that stands out
    fontSize: '0.875rem',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '0.875rem',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? 'white' : 'black',
    backgroundColor: state.isSelected ? 'blue' : 'rgb(226,221,217)',
    ':hover': {
      ...provided[':hover'],
      backgroundColor: 'lightblue',
      color: 'black',
    },
  }),
};

// Custom Dropdown Indicator to include a search icon
const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      {/* You can use any icon library or custom SVG here */}
      <span className="material-icons-outlined">search</span>
    </components.DropdownIndicator>
  );
};

// Custom Option component to display asset information
const Option = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div>
        <div>{data.label}</div>
        {data.asset && (
          <div className="text-xs text-gray-600 mt-1">
            Map: {data.asset}
          </div>
        )}
      </div>
    </components.Option>
  );
};

Option.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    asset: PropTypes.string
  }).isRequired
};

// Custom SingleValue component to display asset information in the selected dropdown
const SingleValue = (props) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div>
        <div>{data.label}</div>
        {data.asset && (
          <div className="text-xs text-gray-500">
            Asset: {data.asset}
          </div>
        )}
      </div>
    </components.SingleValue>
  );
};

SingleValue.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    asset: PropTypes.string
  }).isRequired
};

const SelectDistrict = ({ options, placeholder, onChange, isDisabled, value }) => {
  const [selectedDistrict, setSelectedDistrict] = useRecoilState(selectedDistrictAtom);
  const clearSelectedDistrict = useSetRecoilState(selectedDistrictAtom);
  const animatedComponents = makeAnimated();

  // Clear selected district when options become empty
  useEffect(() => {
    if (!options || options.length === 0) {
      clearSelectedDistrict(null);
    }
  }, [options, clearSelectedDistrict]);

  const handleChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    if (onChange) {
      onChange(selectedOption);
    }
  };

  const resolvedValue = (() => {
    if (!options || options.length === 0) {
      return null; // Explicitly return null for empty options
    }
    if (value === null || value === undefined) {
      return null; // Explicitly return null when value is cleared
    }
    // Try to find the selected option in current options
    const foundOption = options.find(option => option.value === selectedDistrict?.value);
    return foundOption || null;
  })();

  // Force re-mount when value changes to null to ensure placeholder shows
  const selectKey = resolvedValue ? 'selected' : 'cleared';

  return (
    <Select
      key={selectKey}
      components={{ ...animatedComponents, DropdownIndicator, Option, SingleValue }}
      styles={customStyles}
      options={options}
      value={resolvedValue}
      placeholder={placeholder}
      onChange={handleChange}
      isDisabled={isDisabled}
    />
  );
};

SelectDistrict.propTypes = {
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func, // Add PropTypes for onChange
  isDisabled: PropTypes.bool,
};

export default SelectDistrict;