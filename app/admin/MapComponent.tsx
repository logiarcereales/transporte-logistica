'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
const iconDefaults = {
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions(iconDefaults);

export default function MapComponent({ ubicaciones }: { ubicaciones: any[] }) {
    return (
        <MapContainer
            center={[-32.9442, -60.6505]} // Rosario default
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {ubicaciones.map((u) => (
                u.latitud && u.longitud ? (
                    <Marker key={u.id} position={[u.latitud, u.longitud]}>
                        <Popup>
                            <div className="p-1">
                                <strong className="block text-sm text-gray-900">{u.nombre}</strong>
                                <span className="text-xs text-gray-500 uppercase font-bold">{u.tipo}</span>
                                <p className="text-xs text-gray-600 mt-1">{u.instrucciones_llegada}</p>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
}
