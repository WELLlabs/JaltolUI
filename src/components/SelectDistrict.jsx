import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { selectedDistrictAtom } from '../recoil/selectAtoms';
import { useRecoilState } from 'recoil';

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
            Asset: {data.asset}
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

const SelectDistrict = ({ options, placeholder, onChange }) => {
  const [selectedDistrict, setSelectedDistrict] = useRecoilState(selectedDistrictAtom);
  const animatedComponents = makeAnimated();

  const handleChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <Select
      components={{ ...animatedComponents, DropdownIndicator, Option, SingleValue }}
      styles={customStyles}
      options={options}
      value={selectedDistrict || null} // Ensure it's null if undefined
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

SelectDistrict.propTypes = {
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func, // Add PropTypes for onChange
};

export default SelectDistrict;