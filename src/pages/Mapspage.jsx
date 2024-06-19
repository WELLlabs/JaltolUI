// src/pages/IndiaSATPage.jsx

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// import aboutBackground from '../assets/Aboutus.png'; // Ensure correct path
// import mapImage from '../assets/Maps.png'; // Ensure correct path

const IndiaSATPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-800">
        {/* About Section */}
        <div 
          className="bg-no-repeat bg-cover bg-center h-screen flex items-center justify-center text-white p-8"
        >
           <div className="p-10 text-black rounded-lg  mx-auto text-left">
            <h1 className="text-7xl font-bold">What is IndiaSAT</h1>
            <div>
            <p className="text-2xl mt-4">
              IndiaSAT uses novel high spatial resolution land use maps to help quantify plot level changes in land cover in India over the last two decades.
            </p>
            </div>
            <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg">
              See more
            </button>
          </div>
        </div>

        {/* Uniqueness Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Uniqueness of IndiaSAT</h2>
          <p className="mt-2 mb-4">
            While land use maps are available from many sources, IndiaSAT provides high-resolution (10m) and seasonal maps, making it useful for village-level analysis, showing cropping frequency, and seasonal waterbody extents. It has been available annually since 2000 and is open source.
          </p>
          {/* < className="w-full h-auto shadow-lg rounded"/> */}
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View more
          </button>
        </div>

        {/* Co-creators Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Co-creators of IndiaSAT</h2>
          <p className="mt-2">
            IndiaSAT is a research effort led by IIT-Delhi with partners WELL Labs, Gram Vaani, and NYAS Research. The current version, IndiaSAT v3, includes maps from 2000 onwards and has enhanced accuracy.
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Learn more
          </button>
        </div>

        {/* LU/LC Classes Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">LU/LC Classes of IndiaSAT</h2>
          <p className="mt-2">
            IndiaSAT follows a hierarchical classification approach:
            <ul className="list-disc list-inside mt-4 text-left">
              <li><strong>Level-1:</strong> Greenery, Water Bodies, Built-up, Barren land</li>
              <li><strong>Level-2:</strong> Cropland, Forest, Seasonal Water Body, Perennial Water Body</li>
              <li><strong>Level-3:</strong> Single Kharif, Single Non-Kharif, Double, Triple cropping</li>
            </ul>
          </p>
        </div>

        {/* Methodology Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">IndiaSAT Methodology</h2>
          <p className="mt-2">
            IndiaSAT uses Sentinel-2 and Sentinel-1 data for classification, combined with dynamic world object-based classifiers and rule-based methods for accuracy. NDVI time series is used for detailed cropland classification.
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Learn more
          </button>
        </div>

        {/* Validation Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Validation of IndiaSAT Map</h2>
          <p className="mt-2">
            Ground Truth data and expert-labeled points using Google Satellite images validate the LULC maps, ensuring accuracy at the national level and for historical images.
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Learn more
          </button>
        </div>

        {/* Invitation to Collaborate Section */}
        <div className="py-8 px-4 text-center">
          <h2 className="text-2xl font-semibold">Invitation to Collaborate</h2>
          <p className="mt-2">
            We invite partners to help validate the maps with primary data collection. Partners get priority access to maps for their regions for purposes such as impact assessment. Contact us at <a href="mailto:welllabs.jaltol@ifmr.ac.in">welllabs.jaltol@ifmr.ac.in</a> or IITD email address.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IndiaSATPage;
