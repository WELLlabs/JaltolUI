import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import aboutBackground from '../assets/HomePage.svg';
import mapsImage from '../assets/maps.svg';
import methodologyImage from '../assets/methodology.svg'; 
// Ensure correct path
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const handleMapsClick = () => {
    navigate('/maps-page'); // Adjust the path to your maps page
  };

  const handleMethodologyClick = () => {
    navigate('/methodology'); // Adjust the path to your maps page
  };


  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-800">
        {/* About Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between flex-grow">
          <div className="lg:w-1/2 text-left p-8 lg:p-16">
            <h1 className="text-6xl font-bold text-black">What is Jaltol</h1>
            <p className="text-2xl mt-4 text-black">
              Jaltol uses novel high spatial resolution agricultural land use maps to help quantify plot level changes in agricultural patterns in peninsular India over the last two decades.
            </p>
            {/* <button className="mt-6 bg-jaltol-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              See more
            </button> */}
          </div>
          <div className="lg:w-1/2 h-screen relative flex-shrink-0">
            <div className="absolute top-0 left-0 w-full h-full bg-jaltol-blue"></div>
            <div className="relative z-10 pt-2 pr-16">
              <img src={aboutBackground} alt="About Jaltol" className="w-full h-full object-cover border-t-20 border-r-8 border-transparent " />
            </div>
          </div>
        </div>


        {/* Maps Section */}
        <div className="py-16 px-4 flex flex-col items-center bg-white">
          <div className="flex flex-col md:flex-row items-center mt-6 mb-6 px-8">
            <div className="md:w-1/3 p-4 pl-10">
              <img src={mapsImage} alt="Agricultural Maps" className="w-full h-auto shadow-lg rounded" />
            </div>
            <div className="md:w-2/3 p-20">
              <h2 className="text-5xl font-semibold text-black">Maps</h2>
              <p className="text-2xl text-gray-700 mt-4">
                Developed by the National Remote Sensing Centre, the Bhuvan LULC maps made available via Jaltol are powerful, historical maps (2005 to present day) that users can leverage to track land use changes pan India.
              </p>
              <button 
              className="mt-4 bg-jaltol-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
              onClick={handleMapsClick}
              >
                View more
              </button>
            </div>
          </div>
        </div>
        {/* Methodology Section */}
        <div className="py-16 px-8 flex flex-col items-center bg-white">
          <div className="flex flex-col md:flex-row items-center mt-6 mb-6 ml-10">
            <div className="md:w-1/2 p-4">
              <h2 className="text-3xl font-semibold text-black">Methodology</h2>
              <p className="text-lg text-gray-700 mt-4">
                Interpreting changes in cropping patterns from land use maps is not simple. Annual precipitation is the major driver of crop choices. At times however, land and water interventions undertaken by CSOs and Government drive change. We share how the Treatment and Control Difference in Difference methodology can be employed, along with the land use maps to assess the impact of interventions.
              </p>
              <button 
              className="mt-4 bg-jaltol-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleMethodologyClick}
              >
                Learn more
              </button>
            </div>
            <div className="md:w-1/3 p-4 ml-20">
              <img src={methodologyImage} alt="Methodology" className="w-full h-auto shadow-lg rounded" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Homepage;
