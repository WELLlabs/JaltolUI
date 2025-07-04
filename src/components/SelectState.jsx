import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { selectedStateAtom } from '../recoil/selectAtoms';
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

const SelectState = ({ options, placeholder, onChange }) => {
  const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);
  const animatedComponents = makeAnimated();

  const handleChange = (selectedOption) => {
    setSelectedState(selectedOption);
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <Select
      components={{ ...animatedComponents, DropdownIndicator }}
      styles={customStyles}
      options={options}
      value={selectedState || null} // Ensure it's null if undefined
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

SelectState.propTypes = {
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func, // Add PropTypes for onChange
};

export default SelectState; 