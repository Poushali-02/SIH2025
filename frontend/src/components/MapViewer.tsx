import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const apiToken = "1641175ea0003fef8ce3123caf1e784dc0313629";
const year = "1112";

const colorMap: Record<string, string> = {
  l01: "#7f8c8d",
  l02: "#8e44ad",
  l03: "#16a085",
  l04: "#27ae60",
  l05: "#2ecc71",
  l06: "#f39c12",
  l07: "#e67e22",
  l08: "#1abc9c",
  l09: "#2ecc71",
  l10: "#27ae60",
  l11: "#9b59b6",
  l12: "#2980b9",
  l13: "#e74c3c",
  l14: "#c0392b",
  l15: "#95a5a6",
  l16: "#7f8c8d",
  l17: "#34495e",
  l18: "#d35400",
  l19: "#16a085",
  l20: "#2ecc71",
  l21: "#81ecec",
  l22: "#0984e3",
  l23: "#74b9ff",
  l24: "#636e72",
};

const districtOptions = [
  { id: "1028", name: "Patna" },
  { id: "2341", name: "Dindori" },
  { id: "1912", name: "Hugli" },
  { id: "1916", name: "Haora" },
  { id: "1034", name: "Aurangabad" },
  { id: "1814", name: "Tinsukia" },
  { id: "1804", name: "Bongaigaon" },
  { id: "1808", name: "Darrang" },
  { id: "1802", name: "Dhuburi" },
  { id: "1805", name: "Barpeta" },
  { id: "1908", name: "Birbhum" },
  { id: "2316", name: "Shahdol" },
];

const landTypes = [
  { id: "l01", name: "Builtup, Urban" },
  { id: "l02", name: "Builtup, Rural" },
  { id: "l03", name: "Builtup, Mining" },
  { id: "l04", name: "Agriculture, Crop land" },
  { id: "l05", name: "Agriculture, Plantation" },
  { id: "l06", name: "Agriculture, Fallow" },
  { id: "l07", name: "Agriculture, Current Shifting Cultivation" },
  { id: "l08", name: "Forest, Evergreen/ Semi evergreen" },
  { id: "l09", name: "Forest, Deciduous" },
  { id: "l10", name: "Forest, Forest Plantation" },
  { id: "l11", name: "Forest, Scrub Forest" },
  { id: "l12", name: "Forest, Swamp/ Mangroves" },
  { id: "l13", name: "Grass/Grazing" },
  { id: "l14", name: "Barren land, Salt Affected" },
  { id: "l15", name: "Barren land, Ravinous" },
  { id: "l16", name: "Barren land, Scrub" },
  { id: "l17", name: "Barren land, Sandy area" },
  { id: "l18", name: "Barren land, Rocky" },
  { id: "l19", name: "Barren land, Rann" },
  { id: "l20", name: "Wetland, Inland" },
  { id: "l21", name: "Wetland, Coastal" },
  { id: "l22", name: "River/Stream/Canal" },
  { id: "l23", name: "Reservoir/Lakes/Ponds" },
  { id: "l24", name: "Snow and Glacier" },
];

const MapViewer: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const [district, setDistrict] = useState("1028");
  const [landType, setLandType] = useState("l01");

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [23.5, 82.5],
        zoom: 5,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      layerRef.current = L.layerGroup().addTo(mapRef.current);
    }
  }, []);

  const loadMapData = async () => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();

    try {
      const url = `https://bhuvan-app1.nrsc.gov.in/api/lulc/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lulc:lulc_${year}_${district}&outputFormat=application/json`;
      const { data } = await axios.get(url);

      L.geoJSON(data, {
        style: (feature: any) => {
          const code = feature.properties?.code;
          return {
            color: colorMap[code] || "#333",
            weight: 1,
            fillOpacity: 0.6,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(`
            <strong>District:</strong> ${district}<br/>
            <strong>Land Type:</strong> ${props.code} - ${landTypes.find(l => l.id === props.code)?.name || "Unknown"}
          `);
        },
      }).addTo(layerRef.current);

    } catch (err) {
      console.error("Error loading GeoJSON:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {districtOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Land Use Type
          </label>
          <select
            value={landType}
            onChange={(e) => setLandType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {landTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadMapData}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Load
        </button>
      </div>

      <div id="map" className="h-[500px] w-full rounded-lg border" />
    </div>
  );
};

export default MapViewer;
