import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import PropTypes from 'prop-types';
import { useRecoilState } from 'recoil';
import { selectedSubdistrictAtom } from '../recoil/selectAtoms';

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

const SelectSubdistrict = ({ options, placeholder }) => {
    const [selectedSubdistrict, setSelectedSubdistrict] = useRecoilState(selectedSubdistrictAtom);
    const animatedComponents = makeAnimated();

    const handleChange = (selectedOption) => {
        console.log("Subdistrict option selected:", selectedOption?.label);
        setSelectedSubdistrict(selectedOption);
    };

    // Reduced logging to prevent spam - only log when there are significant changes
    if (import.meta.env.DEV && selectedSubdistrict && options.length > 0) {
        console.log("Selected Subdistrict:", selectedSubdistrict?.label, "Available options:", options.length);
    }

    return (
        <Select
  components={animatedComponents}
  styles={customStyles}
  options={options}
  value={options.find(option => option.value === selectedSubdistrict?.value)} // Correct retrieval of selected option
  placeholder={placeholder}
  isDisabled={options.length === 0}
  onChange={handleChange}
/>

    );
};

SelectSubdistrict.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    placeholder: PropTypes.string,
};

export default SelectSubdistrict;
