import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL; // Backend API URL from environment

const apiEndpoints = [
  {
    name: 'Get Boundary Data',
    endpoint: `${API_URL}/get_boundary_data/`,
    params: 'state_name, district_name',
    example: `${API_URL}/get_boundary_data/?state_name=Rajasthan&district_name=karauli`,
    returns: 'GeoJSON object containing boundary data for the specified district'
  },
  {
    name: 'Get LULC Raster',
    endpoint: `${API_URL}/get_lulc_raster/`,
    params: 'state_name, district_name, subdistrict_name, village_name, year',
    example: `${API_URL}/get_lulc_raster/?state_name=Rajasthan&district_name=karauli&year=2022`,
    returns: 'Object containing URL to the LULC raster tiles for the specified location and year'
  },
  {
    name: 'Get Area Change',
    endpoint: `${API_URL}/get_area_change/`,
    params: 'state_name, district_name, subdistrict_name, village_name',
    example: `${API_URL}/get_area_change/?state_name=Rajasthan&district_name=karauli&subdistrict_name=nadoti&village_name=rajpur`,
    returns: 'JSON object with area changes in hectares for different land use categories over the years'
  },
  {
    name: 'Get Control Village',
    endpoint: `${API_URL}/get_control_village/`,
    params: 'state_name, district_name, subdistrict_name, village_name',
    example: `${API_URL}/get_control_village/?state_name=Rajasthan&district_name=karauli&subdistrict_name=nadoti&village_name=rajpur`,
    returns: 'GeoJSON object containing boundary data for the control village'
  },
  {
    name: 'Get Rainfall Data',
    endpoint: `${API_URL}/get_rainfall_data/`,
    params: 'state_name, district_name, subdistrict_name, village_name',
    example: `${API_URL}/get_rainfall_data/?state_name=Rajasthan&district_name=karauli&subdistrict_name=nadoti&village_name=rajpur`,
    returns: 'JSON object containing rainfall data for the specified location'
  },
  {
    name: 'Get SRTM Elevation Raster',
    endpoint: `${API_URL}/get_srtm_raster/`,
    params: 'state_name, district_name, subdistrict_name, village_name',
    example: `${API_URL}/get_srtm_raster/?state_name=Gujarat&district_name=Valsad&subdistrict_name=Kaprada&village_name=Vapi`,
    returns: 'Object containing URL to the SRTM slope raster tiles for the specified location'
  }
];

const ApiDocumentation = () => {
  return (
    <div className="min-h-screen w-screen flex-col bg-white text-black">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">API Documentation</h1>
        <div className="space-y-4">
          {apiEndpoints.map((api, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-md ">
              <h2 className="text-xl font-semibold">{api.name}</h2>
              <p className="mt-2"><span className="font-bold">Endpoint:</span> {api.endpoint}</p>
              <p className="mt-2"><span className="font-bold">Parameters:</span> {api.params}</p>
              <p className="mt-2"><span className="font-bold">Example:</span> <a href={api.example} target="_blank" rel="noopener noreferrer" className="text-blue-400">{api.example}</a></p>
              <p className="mt-2"><span className="font-bold">Returns:</span> {api.returns}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocumentation;
