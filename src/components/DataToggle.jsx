import { useRecoilState, useRecoilValue } from 'recoil';
import { showPolygonDataAtom, customPolygonDataAtom } from '../recoil/selectAtoms';

const DataToggle = () => {
  const [showPolygonData, setShowPolygonData] = useRecoilState(showPolygonDataAtom);
  const customPolygonData = useRecoilValue(customPolygonDataAtom);
  
  // Only enable toggle if polygon data exists
  const hasPolygonData = !!customPolygonData;
  
  return (
    <div className="flex items-center space-x-4 p-2 bg-white rounded-lg shadow-md">
      <span className="text-sm font-medium text-gray-700">Show data for:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={`px-3 py-1 text-sm rounded-md transition-all ${
            !showPolygonData
              ? 'bg-blue-500 text-white font-medium'
              : 'text-gray-700 border border-blue-500 bg-white hover:bg-gray-100'
          }`}
          onClick={() => setShowPolygonData(false)}
        >
          Entire Village
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-md transition-all ${
            showPolygonData
              ? 'bg-blue-500 text-white font-medium'
              : 'text-gray-700 border border-blue-500 bg-white hover:bg-gray-100'
          }`}
          onClick={() => setShowPolygonData(true)}
          disabled={!hasPolygonData}
        >
          Custom Polygon
        </button>
      </div>
      {!hasPolygonData && showPolygonData && (
        <div className="text-xs text-red-500">
          Upload a polygon first
        </div>
      )}
    </div>
  );
};

export default DataToggle;