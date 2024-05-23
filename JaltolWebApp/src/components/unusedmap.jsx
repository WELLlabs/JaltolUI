// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import PropTypes from 'prop-types';

// const { BaseLayer, Overlay } = LayersControl;

// const DistrictMap = ({ geoJsonData, rasterUrl, carbonUrl, slopeUrl, selectedDistrict, selectedVillage, onEachFeature, geoJsonKey, districtGeometry, villageGeometry }) => {
//   const [map, setMap] = useState(null);

//   const FlyToDistrict = ({ districtGeometry }) => {
//     useEffect(() => {
//       if (districtGeometry && map) {
//         const bounds = districtGeometry.getBounds();
//         map.flyToBounds(bounds, { padding: [50, 50] });
//       }
//     }, [districtGeometry, map]);

//     return null;
//   };

//   FlyToDistrict.propTypes = {
//     districtGeometry: PropTypes.shape({
//       getBounds: PropTypes.func.isRequired,
//     }),
//   };

//   const FlyToVillage = ({ villageGeometry }) => {
//     useEffect(() => {
//       if (villageGeometry && map) {
//         const bounds = villageGeometry.getBounds();
//         map.flyToBounds(bounds, { padding: [50, 50] });
//       }
//     }, [villageGeometry, map]);

//     return null;
//   };

//   FlyToVillage.propTypes = {
//     villageGeometry: PropTypes.shape({
//       getBounds: PropTypes.func.isRequired,
//     }),
//   };

//   const vectorStyle = {
//     color: '#3388ff',
//     weight: 1,
//     opacity: 1,
//     fillColor: '#3388ff',
//     fillOpacity: 0.2,
//   };

//   return (
//     <MapContainer center={initialMapCenter} zoom={initialMapZoom} className="flex h-full w-full" whenCreated={setMap}>
//       <LayersControl position="topright">
//         <BaseLayer checked name="OpenStreetMap">
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//         </BaseLayer>
//         {geoJsonData && (
//           <Overlay name="Boundary" checked>
//             <GeoJSON
//               key={`${geoJsonKey}-${selectedDistrict.value}-${selectedVillage?.village_na}`}
//               data={geoJsonData}
//               onEachFeature={onEachFeature}
//               style={vectorStyle}
//             />
//           </Overlay>
//         )}
//         {rasterUrl && (
//           <Overlay name="LULC Map" checked>
//             <TileLayer 
//               key={`${selectedDistrict.value}-${selectedVillage?.village_na}`}
//               url={rasterUrl}
//             />
//           </Overlay>
//         )}
//         {carbonUrl && (
//           <Overlay name="Organic Carbon Map" unchecked>
//             <TileLayer 
//               key={`${selectedDistrict.value}-${selectedVillage?.village_na}`}
//               url={carbonUrl}
//             />
//           </Overlay>
//         )}
//         {slopeUrl && (
//           <Overlay name="Slope Map" unchecked>
//             <TileLayer 
//               key={`${selectedDistrict.value}-${selectedVillage?.village_na}`}
//               url={slopeUrl}
//             />
//           </Overlay>
//         )}
//       </LayersControl>
//       {districtGeometry && <FlyToDistrict districtGeometry={districtGeometry} />}
//       {villageGeometry && <FlyToVillage villageGeometry={villageGeometry} />}
//     </MapContainer>
//   );
// };

// export default DistrictMap;
