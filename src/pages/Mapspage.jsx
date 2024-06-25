// src/pages/IndiaSATPage.jsx

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import mapsBackground from '../assets/mapsnew.svg';
import lulcImage from '../assets/LulcClasses.svg';
// import aboutBackground from '../assets/Aboutus.png'; // Ensure correct path
// import mapImage from '../assets/Maps.png'; // Ensure correct path

const IndiaSATPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-800 flex-col">

      {/* About Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between flex-grow">
      <div className="p-10 flex flex-col justify-center">
            <h1 className="text-4xl font-bold">The IndiaSAT Land Use, Land Cover (LULC) map</h1>
            <div>
              <p className="text-2xl mt-5 font-bold">
                What are LULC maps?
              </p>
              <p className="text-lg mt-4">
                Land Use Land Cover (LULC) maps provide information to help users understand the current landscape. Land cover indicates the physical land type such as forest or open water, whereas land use documents how people are using the land. These maps establish the baseline information for activities like thematic mapping and change detection analysis, which are important for global monitoring studies, resource management, and planning activities.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 h-screen relative flex-shrink-0">
            <img src={mapsBackground} alt="LULC Map" className="absolute top-0 left-0 w-full h-full" />
          </div>
        </div>

      {/* Uniqueness Section */}
      <div className='bg-white py-16'>
        <div className="p-10 text-black rounded-lg mx-auto text-center max-w-5xl">
          <h2 className="text-4xl font-semibold mb-10">Uniqueness of IndiaSAT</h2>
          <p className="mt-2 mb-4 text-lg mx-20">
            While land use maps are available from many different sources, including the Government of India, it is still hard to find maps with high-resolution and seasonal variation. This is where IndiaSAT’s land use maps come in. The uniqueness of IndiaSAT over other products is that it is produced at a higher resolution of 10m which makes it useful for village-level analysis. It is seasonal, thereby showing cropping frequency in the agricultural fields and seasonal waterbody extents, and it is available annually from the year 2000 onwards. Moreover, the map and the model that produced the map are open source.
          </p>
        </div>
      </div>

        {/* Co-creators Section */}
        <div className="py-16 px-8 flex flex-col items-center bg-jaltol-blue">
          <div className="flex flex-col md:flex-row items-center mt-6 mb-6">
            <div className="md:w-2/3 p-4 m-20 pr-20 text-white">
              <h2 className="text-4xl font-semibold ">Co-creators of India SAT</h2>
              <p className="text-lg mt-4 text-left">
                IndiaSAT is a research work spearheaded by the Indian Institute of Technology-Delhi focusing on improving land use land cover (LULC) classification, an open-source methodology to capture landscape changes annually to mine valuable insights that can prepare the community for sustainability.
              </p>
              <p className="text-lg mt-4 text-left">
                Other partners in this effort include WELL Labs as a Research Partner, Gram Vaani as an Engineering and Product Development Partner, and NYAS Research as a Data Collection Partner.
              </p>
              <p className="text-lg mt-4 text-left">
                The current version of the IndiaSAT model is version 3, which includes the generation of maps from the year 2000 and temporal correction for increased accuracy.
              </p>
            </div>
            <div className="md:w-1/3 p-4 mr-20">
              <div className="bg-gray-300 w-full h-96 rounded shadow-lg"></div> {/* Placeholder for image */}
              {/* Uncomment the following line and provide the correct path if you have an actual image */}
              {/* <img src={indiaSatImage} alt="Co-creators of India SAT" className="w-full h-auto shadow-lg rounded" /> */}
            </div>
          </div>
        </div>

        {/* LU/LC Classes Section */}
        <div className="py-16 px-8 flex flex-col items-center bg-white">
          <h2 className="text-3xl font-semibold text-black">The LULC classes of IndiaSAT</h2>
          <p className="text-lg text-gray-700 mt-4 text-center">
            IndiaSAT follows a hierarchical classification approach shown below to cover a variety of LULC classes.
          </p>
          <div className="flex justify-center mt-6 mb-6">
            <img src={lulcImage} alt="The LULC classes of IndiaSAT" className="w-full h-auto shadow-lg rounded" />
          </div>
        </div>
        <div className="py-16 px-16 flex flex-col items-center bg-white">
          <h2 className="text-3xl font-semibold text-black">The LULC classes of IndiaSAT</h2>
          <div className="flex flex-col md:flex-row items-start justify-center mt-6 mb-6 space-y-6 md:space-y-0 md:space-x-6">
            <div className="bg-green-100 p-6 rounded-lg shadow-lg flex-1 h-full">
              <h3 className="text-xl font-semibold text-black">Level-1 classification</h3>
              <p className="mt-4 text-gray-700">
                In level-1 classification, the first stage, four high-level classes are classified.
              </p>
              <ul className="list-disc list-inside mt-4 text-gray-700">
                <li>Greenery: These are vegetative patches of land like croplands, grass, forests, and orchards.</li>
                <li>Water bodies: These cover both seasonal and perennial water bodies.</li>
                <li>Built-up: These are man-made constructions on the Earth’s surface that include roads, buildings, etc.</li>
                <li>Barren land: These areas are non-vegetative patches of rocky, wastelands, and barren areas.</li>
              </ul>
            </div>
            <div className="bg-green-200 p-6 rounded-lg shadow-lg flex-1 h-full">
              <h3 className="text-xl font-semibold text-black">Level-2 classification</h3>
              <p className="mt-4 text-gray-700">
                In level-2 classification, the level-1 classes are further classified into:
              </p>
              <ul className="list-disc list-inside mt-4 text-gray-700">
                <li>Cropland: These are farm lands that are cultivated annually.</li>
                <li>Forest: These include dense and open forests.</li>
                <li>Seasonal water body: These water bodies hold water for less than three agricultural seasons in a year.</li>
                <li>Perennial water body: These water bodies hold water for more than three agricultural seasons in a year.</li>
              </ul>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg shadow-lg flex-1 h-full">
              <h3 className="text-xl font-semibold text-black">Level-3 classification</h3>
              <p className="mt-4 text-gray-700">
                In level-3 classification, the cropland class is further classified based on their cropping frequency in a year:
              </p>
              <ul className="list-disc list-inside mt-4 text-gray-700">
                <li>Single-cropped: Agricultural lands cultivated once in a year.</li>
                <li>Double-cropped: Agricultural lands cultivated twice in a year.</li>
                <li>Triple-cropped: Agricultural lands cultivated thrice in a year.</li>
              </ul>
            </div>
          </div>
          <p className="text-lg text-gray-700 mt-8 text-center">
            The Level-3 classification carried out by IndiaSAT shows deep classification into croplands as “single-cropped”, “double-cropped” and “triple-cropped”; this level of classification at a finer level enables Panchayats and NGOs to track the impact of their watershed interventions.
          </p>
        </div>

        {/* Methodology Section */}
        <div className="py-16 px-8 flex flex-col items-center bg-white">
  {/* Top divider */}
  <div className="w-full flex justify-center items-center mb-8">
    <div className="border-t border-gray-300 flex-grow"></div>
    <div className="mx-4 text-gray-300">•</div>
    <div className="border-t border-gray-300 flex-grow"></div>
  </div>

  <h2 className="text-3xl font-semibold text-black text-center">The IndiaSAT Methodology</h2>

  <div className="max-w-4xl text-center">
    <p className="text-lg text-gray-700 leading-relaxed">
      To achieve the Level-1 classification, multi-spectral data is subjected to classification by a random forest classifier trained using data from OSM and manual marking of polygons for different classes throughout the nation, this per-pixel classifier is combined with Dynamic World, an object-based classifier, and further subjected to a rule-based method to achieve Level-1 classification.
    </p>
    <p className="text-lg text-gray-700 leading-relaxed mt-4">
      At Level-2, to perform cropland and forest classification, Sentinel-1 SAR data time series, both VV and VH bands are used as input for the Random Forest Classifier. Further Slope information from SRTM DEM and a threshold of 30 degrees is used to correct misclassifications in croplands. For the seasonality of water bodies, a combination of SAR data (threshold over VV-band) and Dynamic World&apos;s water output for prediction, followed by a rule-based error correction using NDWI and NDVI on derived bands.
    </p>
    <p className="text-lg text-gray-700 leading-relaxed mt-4">
      To perform Level-3 classification, there is no existing dataset with a significant amount of data, so the input considered for this classification is 8-16 day NDVI time series that is derived from a combination of Landsat-7, Landsat-8, Sentinel-2, and MODIS data based on QCI-30 paper methodology, subject to unsupervised classification using k-nearest neighbor algorithm to achieve Single, Double and Triple cropping class.
    </p>
  </div>
</div>

{/* Bottom divider */}
<div className="w-full flex justify-center items-center mt-8 mb-16">
    <div className="border-t border-gray-300 flex-grow"></div>
    <div className="mx-4 text-gray-300">•</div>
    <div className="border-t border-gray-300 flex-grow"></div>
  </div>



        {/* Validation Section */}
        <div className="flex justify-center">
  <div className="py-16 px-8 flex flex-col items-center bg-white text-center">

    <div className="max-w-6xl flex flex-col md:flex-row justify-between items-center text-center md:text-left">
      <div className="md:w-1/2 p-4">
        <h2 className="text-2xl font-semibold text-black">Validation of the IndiaSAT map</h2>
        <p className="text-lg text-gray-700 leading-relaxed mt-4">
          Ground Truth data is used to carry out validation of the LULC maps, partnering with NYAS research, points with location, and several metadata are collected for districts in the Tungabhadra river basin using the ODK platform for Kharif and Rabi season in 2023-24. The collection of ground data is a resource-heavy task, so in addition, we validate the maps with points labeled by experts using Google Satellite images and other sources, with this method we could validate the accuracy of LULC images at the national level and also for images that date back in time.
        </p>
      </div>
      <div className="md:w-1/2 p-4">
        <h2 className="text-2xl font-semibold text-black">Invitation to collaborate</h2>
        <p className="text-lg text-gray-700 leading-relaxed mt-4">
          Producing and validating a map like IndiaSAT for the entire country is no small task. We invite partners from across the country to help us further validate the maps in their geographies with some primary data collection. To partner with us, get in touch at welllabs.jaltol@ifmr.ac.in or IITD email address. As a partner, you get priority access to maps for your region of interest for purposes such as impact assessment.
        </p>
      </div>
    </div>
  </div>
</div>
      </div>
      <Footer />
    </>
  );
};

export default IndiaSATPage;
