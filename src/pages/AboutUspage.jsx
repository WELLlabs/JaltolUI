// src/pages/AboutUsPage.jsx

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import aboutBackground from '../assets/Aboutus.png'; // Ensure correct path
import mapImage from '../assets/Maps.png'; // Ensure correct path

const AboutUsPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-800">
        {/* About Section */}
        <div 
          style={{ backgroundImage: `url(${aboutBackground})` }}
          className="bg-no-repeat bg-cover bg-center h-screen flex items-center justify-center text-white p-8"
        >
           <div className="p-10 text-black rounded-lg  mx-auto text-left">
            <h1 className="text-7xl font-bold">What is Jaltol</h1>
            <div>
            <p className="text-2xl mt-4">
              Jaltol uses novel high spatial resolution agricultural land use maps to help quantify plot level changes in agricultural patterns in peninsular India over the last two decades.
            </p>
            </div>
            <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg">
              See more
            </button>
          </div>
        </div>

        {/* Maps Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Maps</h2>
          <p className="mt-2 mb-4">
            Developed by ITO and WLI Labs in partnership, these high resolution (30m) land use maps are produced annually since 2000. They show plot level land use categories important for agriculture, namely - Single and Double cropping.
          </p>
          <img src={mapImage} alt="Agricultural Maps" className="w-full h-auto shadow-lg rounded"/>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View more
          </button>
        </div>

        {/* Methodology Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Methodology</h2>
          <p className="mt-2">
            Interpreting changes in cropping patterns from land use maps is not simple. Annual precipitation is the major driver of crop choices. At ITO CSO however, land and water interventions undertaken by NGOs and Government drive change. We share how the Treatment and Control Difference in Difference methodology can be employed, along with the land use maps to assess the impact of interventions.
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Learn more
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage;
