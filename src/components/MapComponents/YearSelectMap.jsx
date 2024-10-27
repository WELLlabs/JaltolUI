
import Select from 'react-select';
import PropTypes from 'prop-types';


const YearDropdown = ({ selectedYear, onChange, onMenuOpen }) => {
  const yearOptions = [
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
    { value: '2017', label: '2017' },
    // ... more year options
  ];

  const customStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#344145', // Background color for the dropdown
      color: 'white', // Text color
      borderRadius: '0.375rem', // Tailwind's 'rounded-md'
      borderColor: '#344145', // Border color
      boxShadow: 'none',
      zIndex: 9999,
      '&:hover': { borderColor: '#344145' }, // Border color on hover
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? '#4A83EC' : isFocused ? '#DEEBFF' : '#344145',
      color: 'white', // Text color for options
      ':active': {
        ...styles[':active'],
        backgroundColor: isSelected ? '#4A83EC' : '#344145',
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'white', // Text color for the selected item
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: 'white', // Dropdown indicator (arrow) color
    }),
    // You can also style the menu list (the dropdown box that opens with options)
    menuList: (styles) => ({
      ...styles,
      backgroundColor: '#344145', // Background color for the dropdown options
    }),
    // ... other styles as needed
  };

  

  return (
    <Select
      className="react-select-container z-9999"
      classNamePrefix="react-select"
      options={yearOptions}
      value={yearOptions.find(option => option.value === selectedYear)} // Ensure this line is correct
      styles={customStyles}
      onChange={onChange}
      onMenuOpen={onMenuOpen} // Make sure this is triggering the parent's handleYearChange
      isSearchable={false}
    />
  );
};

export default YearDropdown;

YearDropdown.propTypes = {
    selectedYear: PropTypes.string.isRequired, // add prop validation for selectedYear
    onChange: PropTypes.func.isRequired,
    onMenuOpen: PropTypes.func.isRequired,
  };
