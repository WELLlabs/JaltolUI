import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { components } from 'react-select';
import PropTypes from 'prop-types';

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

const SelectDistrict = ({ options, onChange, placeholder, value }) => {
  // Convert the options from object to array format for react-select
  const selectOptions = Object.entries(options).map(([key, label]) => ({
    value: key,
    label: label,
  }));

  const animatedComponents = makeAnimated();

  return (
    <Select
    components={{ ...animatedComponents, DropdownIndicator }}
    styles={customStyles}
    options={selectOptions}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    />
  );
};

SelectDistrict.propTypes = {
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.shape({ // This prop-type should match the expected object shape
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  };

export default SelectDistrict;
