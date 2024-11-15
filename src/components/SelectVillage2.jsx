import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import PropTypes from 'prop-types';
import { useRecoilState } from 'recoil';
import { selectedControlVillageAtom } from '../recoil/selectAtoms';

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

const SelectVillage2 = ({ options, placeholder }) => {
  const [selectedControlVillage, setSelectedControlVillage] = useRecoilState(selectedControlVillageAtom);

  const animatedComponents = makeAnimated();

  const handleControlVillageChange = (option) => {
    console.log("Control Village selected:", option);
    setSelectedControlVillage(option);
  };

  return (
    <Select
      components={animatedComponents}
      styles={customStyles}
      options={options}
      value={options.find(option => option.value === selectedControlVillage?.value)} // Correct retrieval of selected option
      placeholder={placeholder}
      onChange={handleControlVillageChange}
    />
  );
};

SelectVillage2.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string,
};

export default SelectVillage2;
