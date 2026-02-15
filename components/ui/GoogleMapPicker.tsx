'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Center of Argentina (approx)
const defaultCenter = {
    lat: -33.123,
    lng: -64.348
};

interface MapPickerProps {
    onLocationSelect: (location: { lat: number, lng: number }) => void;
    initialLocation?: { lat: number, lng: number };
}

export default function GoogleMapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(initialLocation || null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setMarker(newPos);
            onLocationSelect(newPos);
        }
    };

    if (!isLoaded) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando Mapa...</div>;
    }

    return (
        <div className="h-full w-full rounded-lg overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={marker || defaultCenter}
                zoom={marker ? 12 : 5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                }}
            >
                {marker && <Marker position={marker} />}
            </GoogleMap>
        </div>
    );
}
