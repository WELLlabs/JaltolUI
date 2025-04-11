import Select from 'react-select';
import PropTypes from 'prop-types';


const YearDropdown = ({ selectedYear, onChange, onMenuOpen, stateName }) => {
  // Get year options based on state
  const getYearOptions = () => {
    // For Maharashtra, Uttar Pradesh, and Jharkhand, use Bhuvan LULC years (2005-2024 excluding 2019)
    if (['maharashtra', 'uttar pradesh', 'jharkhand'].includes(stateName?.toLowerCase())) {
      const years = [];
      for (let year = 2024; year >= 2005; year--) {
        if (year !== 2019) { // Skip 2019 as it's unavailable
          years.push({ value: year.toString(), label: year.toString() });
        }
      }
      return years;
    } 
    
    // For other states, use the default range
    return [
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' },
      { value: '2021', label: '2021' },
      { value: '2020', label: '2020' },
      { value: '2019', label: '2019' },
      { value: '2018', label: '2018' },
      { value: '2017', label: '2017' },
    ];
  };

  const yearOptions = getYearOptions();

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
      onMenuOpen={onMenuOpen} 
      isSearchable={false}
    />
  );
};

export default YearDropdown;

YearDropdown.propTypes = {
  selectedYear: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onMenuOpen: PropTypes.func, // Make this optional
  stateName: PropTypes.string, // Add prop for state name
}; 