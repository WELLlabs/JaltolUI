import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import aboutBackground from '../assets/HomePage.jpg';
import hero768 from '../assets/HomePage-768.jpg';
import hero1280 from '../assets/HomePage-1280.jpg';
import hero1920 from '../assets/HomePage-1920.jpg';
import mapsBg from '../assets/maps-1920.jpg';
import mapsBg1920 from '../assets/maps-1920.jpg';
import mapsBg1280 from '../assets/maps-1280.jpg';
import mapsBg768 from '../assets/maps-768.jpg';
import methodologyBg from '../assets/methodology.jpg'; 
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

  const handleTryClick = () => {
    navigate('/impact-assessment');
  };


  return (
    <>
      <Navbar />
      <div className="bg-surface text-gray-800">
        {/* Hero Section (image as backdrop to heading/paragraph) */}
        <section className="relative isolate overflow-hidden">
          <picture>
            <img
              src={aboutBackground}
              srcSet={`${hero768} 768w, ${hero1280} 1280w, ${hero1920} 1920w`}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              alt="Community meeting in the field"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white">What is Jaltol</h1>
              <p className="text-xl md:text-2xl mt-4 text-white/90">
                Jaltol is a web application meant to support <em>NGOs</em> and <em>donors</em> with scientific problem diagnosis and impact assessment in watershed management in India. <br /> <br /> In version 1.0, it leverages novel high spatial resolution agricultural land use maps to help quantify plot level changes in agricultural patterns in peninsular India over the last two decades.
              </p>
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleTryClick}
              >
                Try it out!
              </button>
            </div>
          </div>
        </section>


        {/* Maps Section (full-bleed backdrop) */}
        <section className="relative isolate overflow-hidden">
          <picture>
            <img
              src={mapsBg}
              srcSet={`${mapsBg768} 768w, ${mapsBg1280} 1280w, ${mapsBg1920} 1920w`}
              sizes="100vw"
              alt="IndiaSAT maps illustration"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-left md:object-center"
            />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-l md:from-black/70 md:via-black/35 md:to-transparent"></div>
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24 flex justify-end">
            <div className="relative z-10 max-w-3xl w-full text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 md:text-white">Maps</h2>
              <p className="text-xl md:text-2xl font-normal text-gray-900 md:text-white/90 mt-4">
                Developed by the National Remote Sensing Centre (NRSC), the Bhuvan Land Use Land Cover (LULC) maps made available via Jaltol are the longest running continuous record of land use, land cover spanning the entirety of India, going back to the year 2005. <br /> <br /> NGOs, donors and researchers can leverage these maps to track land use changes pan India.
              </p>
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleMapsClick}
              >
                Read more
              </button>
            </div>
          </div>
        </section>
        
        {/* Methodology Section (full-bleed backdrop, text left) */}
        <section className="relative isolate overflow-hidden">
          <picture>
            <img
              src={methodologyBg}
              sizes="100vw"
              alt="Methodology illustration"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 md:text-white">Methodology</h2>
              <p className="text-xl md:text-2xl text-gray-900 md:text-white/90 mt-4">
                Interpreting changes in cropping patterns from land use maps is not simple. Annual precipitation is the major driver of crop choices. At times however, land and water interventions undertaken by CSOs and Government drive change. We share how the Treatment and Control Difference in Difference methodology can be employed, along with the land use maps to assess the impact of interventions.
              </p>
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleMethodologyClick}
              >
                Learn more
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section above footer (success theme) */}
        <section className="bg-success text-white">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h3 className="text-3xl md:text-4xl font-bold">Ready to assess impact?</h3>
              <p className="text-lg md:text-xl mt-2 opacity-90">Run a sample Impact Assessment for your area of interest and see land-use change over time.</p>
            </div>
            <div>
              <button className="btn bg-white text-success hover:bg-warning" onClick={handleTryClick}>
                Try it out!
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Homepage;
