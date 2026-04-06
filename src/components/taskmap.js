import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function TaskMap({ userLocation, tasks }) {
  const defaultCenter = [20.5937, 78.9629];
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  return (
    <div
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
      }}
    >
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : 5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={10}
            pathOptions={{ color: "#0d6efd", fillColor: "#0d6efd", fillOpacity: 0.85 }}
          >
            <Popup>Your current location</Popup>
          </CircleMarker>
        )}

        {tasks.map((task) =>
          task.latitude && task.longitude ? (
            <CircleMarker
              key={task.id}
              center={[task.latitude, task.longitude]}
              radius={8}
              pathOptions={{ color: "#198754", fillColor: "#198754", fillOpacity: 0.85 }}
            >
              <Popup>
                <strong>{task.title}</strong>
                <br />
                ₹ {task.budget}
                <br />
                {task.location}
              </Popup>
            </CircleMarker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default TaskMap;