import Select from 'react-select';
import makeAnimated from 'react-select/animated';
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
        backgroundColor: state.isSelected ? 'blue' : 'rgb(222, 216, 211)',
        ':hover': {
          ...provided[':hover'],
          backgroundColor: 'lightblue',
          color: 'black',
        },
      }),
  };

const SelectVillage = ({ options, onChange, placeholder, isDisabled }) => {
  const animatedComponents = makeAnimated();

  return (
    <Select
      components={animatedComponents}
      styles={customStyles}
      options={options}
      onChange={(selectedOption) => onChange(selectedOption.value)}
      placeholder={placeholder}
      isDisabled={isDisabled}
    />
  );
};

SelectVillage.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isDisabled: PropTypes.bool,
};

SelectVillage.defaultProps = {
  options: [],
  placeholder: 'Select Village...',
  isDisabled: true, // Disabled by default
};

export default SelectVillage;
