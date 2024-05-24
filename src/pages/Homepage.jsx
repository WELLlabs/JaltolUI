

import Navbar from '../components/Navbar';

const Homepage = () => {
  return (
    <div className="font-sans bg-white min-h-screen w-screen">
      <Navbar />
      <div className="container mx-auto px-10 py-10">
        <div className="flex flex-wrap md:flex-nowrap">
          <div className="md:w-2/3">
            <h1 className="text-6xl text-black font-bold mb-6">Jaltol</h1>
            <p className="text-gray-700 text-lg mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            </p>
            <button className="bg-gray-800 text-white px-6 py-2 rounded bg-neutral-800 hover:bg-neutral-500">Read more</button>
          </div>
          <div className="md:w-1/3 flex justify-center md:justify-end mt-8 md:mt-0">
            <div className="w-64 h-48 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">PLACEHOLDER IMAGE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
