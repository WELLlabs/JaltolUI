import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import PropTypes from 'prop-types';
import { useRecoilState } from 'recoil';
import { selectedVillageAtom } from '../recoil/selectAtoms';

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
      backgroundColor: 'lightblue',
      color: 'black',
    },
  }),
};

const SelectVillage = ({ options, placeholder }) => {
  const [selectedVillage, setSelectedVillage] = useRecoilState(selectedVillageAtom);
  const animatedComponents = makeAnimated();

  const handleChange = (selectedOption) => {
    console.log("Village selected:", selectedOption);
    setSelectedVillage(selectedOption); // Store the entire { value, label } object
  };

  return (
    <Select
      components={animatedComponents}
      styles={customStyles}
      options={options}
      value={options.find(option => option.value === selectedVillage?.value)} // Correct retrieval of selected option
      placeholder={placeholder}
      isDisabled={!options.length}
      onChange={handleChange}
    />
  );
};

SelectVillage.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string,
};

export default SelectVillage;
