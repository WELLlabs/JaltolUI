// src/pages/IndiaSATPage.jsx

import mapsBg from '../assets/maps-1920.jpg';
import mapsBg768 from '../assets/maps-768.jpg';
import mapsBg1280 from '../assets/maps-1280.jpg';
import mapsBg1920 from '../assets/maps-1920.jpg';
import { useEffect } from 'react';
import { usePostHogEvents } from '../utils/posthogEvents';
// import lulcImage from '../assets/LulcClasses.svg';
// import creators from '../assets/creators.svg';
// import aboutBackground from '../assets/Aboutus.png'; // Ensure correct path
// import mapImage from '../assets/Maps.png'; // Ensure correct path


const IndiaSATPage = () => {
  const { trackMapsVisited } = usePostHogEvents();

  useEffect(() => {
    const sourceUrl = document.referrer || null;
    trackMapsVisited(sourceUrl);
  }, []);

  return (
    <div className="bg-white text-gray-800 flex-col">

        {/* Hero: Maps backdrop */}
        <section className="relative isolate overflow-hidden">
          <picture>
            <img
              src={mapsBg}
              srcSet={`${mapsBg768} 768w, ${mapsBg1280} 1280w, ${mapsBg1920} 1920w`}
              sizes="100vw"
              alt="India land use and land cover map mosaic"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-left md:object-center"
            />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          <div className="mx-auto w-[90%] md:w-[80%] px-6 py-16 md:py-20 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white">Data Sources</h1>
              <p className="text-xl md:text-2xl mt-4 text-white/90">Jaltol calculates Village level statistics using annually updated land use/land cover maps from NRSC, and gridded IMD rainfall data.</p>
              <br />
            </div>
          </div>
        </section>

        {/* About Section (text only) */}
        <div className="mx-auto w-[90%] md:w-[80%] px-6 py-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold">1. Land Use, Land Cover (LULC) maps</h1>
            <div>
              <p className="text-lg mt-4">
                Land Use Land Cover (LULC) maps help understand the current and historical state of land use and land cover. Land cover indicates the physical land type such as forest or open water, whereas land use documents how people are using the land. These maps establish the baseline information for activities like thematic mapping and change detection analysis, which are important for global monitoring studies, resource management, and planning activities.
              </p>
              <p className="text-2xl mt-5 font-bold">
                The Bhuvan LULC maps
              </p>
              <p className="text-lg mt-4">
                The Bhuvan <a 
                  href="https://bhuvan-app1.nrsc.gov.in/thematic/thematic/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Land Use Land Cover
                </a> (LULC) maps are a map product developed using satellite imagery by the National Remote Sensing Centre (NRSC) the Remote Sensing wing of the Indian Space Research Organisation (ISRO). These maps are produced with a spatial resolution of 50m once annually. These maps are the longest running continuous record of land use, land cover spanning the entirety of India, going back to the year 2005. The Bhuvan LULC maps are especially useful for agricultural change assessments. They have categories such as Kharif only, Kharif+Rabi which indicate the cropping frequency in a given year.
                <br/> <br/> The Bhuvan LULC maps are available for free download from the Bhuvan portal. Jaltol makes these maps available to interested users enabling further value added analysis such as village or plot level analysis. To date, Jaltol has Bhuvan LULC maps for 10 states. WELL Labs is looking for organisations to partner with to validate the usefulness and accuracy of the Bhuvan LULC maps in different geographies. Please contact us at <a 
                  href="mailto:welllabs.jaltol@ifmr.ac.in"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  welllabs.jaltol@ifmr.ac.in
                </a> for collaborations. 
              </p>
              {/* Source: Bhuvan LULC */}
              <div className="mt-6 rounded-lg border border-gray-200 bg-white/90 p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Source</h3>
                <dl className="mt-2 text-sm text-gray-700 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Dataset:</dt><dd>Bhuvan LULC Maps</dd></div>
                  <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Provider:</dt><dd>National Remote Sensing Centre (NRSC)</dd></div>
                  <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">URL:</dt><dd><a href="https://bhuvan-app1.nrsc.gov.in/thematic/thematic/index.php" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">Bhuvan LULC portal</a></dd></div>
                  <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Availability:</dt><dd>18 states with crop intensity</dd></div>
                </dl>
              </div>
            </div>
            <br/>
            <h1 className="text-4xl font-bold">2.IMD Rainfall Data</h1>
            <p className="text-lg mt-4">
              The Indian Meteorological Department (IMD) provides gridded (0.25°x0.25°) daily rainfall data for India from 1901 to 2024.
              This data is available for free download from the IMD portal (see source below).
              Jaltol aggregates this daily data to the annual timescale and computes village level rainfall using SHRUG village boundaries.
            </p>
            {/* Source: IMD Rainfall */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white/90 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Source</h3>
              <dl className="mt-2 text-sm text-gray-700 space-y-1">
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Dataset:</dt><dd>Gridded Rainfall Data</dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Provider:</dt><dd>Indian Meteorological Department (IMD)</dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">URL:</dt><dd><a href="https://www.imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">IMD Grid Rainfall</a></dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Availability:</dt><dd>Pan India</dd></div>
              </dl>
            </div>
            
            <br/>
            <h1 className="text-4xl font-bold">3. SHRUG v2 Village Boundaries</h1>
            <p className="text-lg mt-4">
              The SHRUG v2 Village Boundaries are a vector dataset of village boundaries for India.
              This data is available for free download from the SHRUG portal (see source below).
              Jaltol uses this data to compute village level statistics of LULC and rainfall for impact assessment.
            </p>

            {/* Source: SHRUG v2 */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white/90 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Source</h3>
              <dl className="mt-2 text-sm text-gray-700 space-y-1">
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Dataset:</dt><dd>SHRUG v2 Village Boundaries</dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Provider:</dt><dd>Dev Data Lab</dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">URL:</dt><dd><a href="https://www.devdatalab.org/shrug" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">SHRUG Portal</a></dd></div>
                <div className="flex flex-col sm:flex-row sm:gap-2"><dt className="font-medium">Availability:</dt><dd>Pan India</dd></div>
              </dl>
            </div>
          </div>
          </div>




      {/* Replaced the large table with per-section Source cards above for better mobile readability */}
    </div>
  );
};

export default IndiaSATPage;
