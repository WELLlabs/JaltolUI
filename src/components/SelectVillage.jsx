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
          ...provided[':hover'],
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
        // If you are storing the whole object in the Recoil state:
        setSelectedVillage(selectedOption.label);
        // If you are only storing the value in the Recoil state:
        // setSelectedVillage(selectedOption.value);
    };

    return (
        <Select
            components={animatedComponents}
            styles={customStyles}
            options={options}
            // Ensure the value corresponds to one of the options
            value={options.find(option => option.value === (selectedVillage?.value || selectedVillage))}
            placeholder={placeholder}
            isDisabled={!options.length}
            onChange={handleChange}
        />
    );
};


  
  SelectVillage.propTypes = {
    options: PropTypes.array.isRequired,
    placeholder: PropTypes.string,
  };
  
  export default SelectVillage;
