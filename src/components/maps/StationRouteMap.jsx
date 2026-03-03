import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";
import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";

export default function AwsLocationMap({
                                           identityPoolId,
                                           region = "us-east-1",
                                           mapName = "ev-map",
                                           routeCalculator = "ev-route",
                                           userLocation,  // { lat, lng }
                                           station        // { lat, lng }
                                       }) {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        let destroyed = false;

        const init = async () => {
            // 1) Auth helper (Cognito)
            const authHelper = await withIdentityPoolId(identityPoolId);

            // 2) Tạo map AWS tiles (style descriptor) + ký request tự động
            const map = new maplibregl.Map({
                container: mapDivRef.current,
                center: [station.lng, station.lat],
                zoom: 13,
                style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor`,
                ...authHelper.getMapAuthenticationOptions(), // quan trọng
            });

            map.addControl(new maplibregl.NavigationControl(), "top-right");

            map.on("load", async () => {
                if (destroyed) return;

                // Marker station
                new maplibregl.Marker().setLngLat([station.lng, station.lat]).addTo(map);

                // Marker user
                if (userLocation) {
                    new maplibregl.Marker({ color: "blue" })
                        .setLngLat([userLocation.lng, userLocation.lat])
                        .addTo(map);
                }

                // 3) Gọi CalculateRoute trực tiếp từ FE bằng AWS SDK v3
                if (userLocation) {
                    const client = new LocationClient({
                        region,
                        ...authHelper.getLocationClientConfig(), // dùng creds từ Cognito
                    });

                    const cmd = new CalculateRouteCommand({
                        CalculatorName: routeCalculator,
                        DeparturePosition: [userLocation.lng, userLocation.lat], // [lng, lat]
                        DestinationPosition: [station.lng, station.lat],         // [lng, lat]
                        TravelMode: "Car",
                    });

                    const res = await client.send(cmd);

                    const lineString =
                        res?.Legs?.[0]?.Geometry?.LineString ?? [];

                    const geojson = {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: lineString, // đã là [lng, lat]
                        },
                    };

                    if (!map.getSource("route")) {
                        map.addSource("route", { type: "geojson", data: geojson });
                        map.addLayer({
                            id: "route-layer",
                            type: "line",
                            source: "route",
                            paint: { "line-width": 5 },
                        });
                    } else {
                        map.getSource("route").setData(geojson);
                    }
                }
            });

            mapRef.current = map;
        };

        if (mapDivRef.current) init();

        return () => {
            destroyed = true;
            if (mapRef.current) mapRef.current.remove();
            mapRef.current = null;
        };
    }, [identityPoolId, region, mapName, routeCalculator, userLocation, station]);

    return <div ref={mapDivRef} style={{ height: 420, borderRadius: 12 }} />;
}
