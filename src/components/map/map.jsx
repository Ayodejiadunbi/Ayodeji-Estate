import "./map.scss"
import {MapContainer,  TileLayer} from "react-leaflet"
import "leaflet/dist/leaflet.css";
import Pin from "../pin/pin"
import L from "leaflet";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon=L.icon({iconUrl:marker,shadowUrl:shadow,iconSize:[25,41],iconAnchor:[12,41]});

function Map ({items}) {
    return (
        <MapContainer center={[52.4797, -1.90269]} zoom={7} scrollWheelZoom={false} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
            {items.map(item=>(
                < Pin item={item} key={item.id}/>
            ))}
      </MapContainer>
    )
}

export default Map