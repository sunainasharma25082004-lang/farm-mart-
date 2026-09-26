import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking
} from 'react-native';
import { MapView, Marker, PROVIDER_GOOGLE, MapViewDirections } from './MapViewWrapper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { computeBearing } from '../utils/maps';

export const LiveOrderMap = ({ order, riderLocation, rider }) => {
  const mapRef = useRef(null);
  const prevLocRef = useRef(null);
  const [heading, setHeading] = useState(0);
  const [routeInfo, setRouteInfo] = useState(null); // { distance: km, duration: mins }

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Extract coordinates
  const storeCoords = order?.vendor?.address?.location?.coordinates || order?.vendor?.location?.coordinates;
  const storeLat = storeCoords?.[1];
  const storeLng = storeCoords?.[0];

  const destLat = order?.address?.lat;
  const destLng = order?.address?.lng;

  const currentRiderLat = riderLocation?.lat;
  const currentRiderLng = riderLocation?.lng;

  // Compute bearing whenever riderLocation updates
  useEffect(() => {
    if (currentRiderLat && currentRiderLng) {
      if (prevLocRef.current && (prevLocRef.current.lat !== currentRiderLat || prevLocRef.current.lng !== currentRiderLng)) {
        const bearing = computeBearing(prevLocRef.current, { lat: currentRiderLat, lng: currentRiderLng });
        if (!isNaN(bearing)) {
          setHeading(bearing);
        }
      } else if (riderLocation?.heading != null) {
        setHeading(riderLocation.heading);
      }
      prevLocRef.current = { lat: currentRiderLat, lng: currentRiderLng };
    }
  }, [currentRiderLat, currentRiderLng, riderLocation?.heading]);

  // Determine origin & destination for MapViewDirections based on order phase
  const isOutForDelivery = order?.status === 'OUT_FOR_DELIVERY' || order?.status === 'DELIVERED';
  
  let origin = null;
  let destination = null;

  if (currentRiderLat && currentRiderLng) {
    origin = { latitude: currentRiderLat, longitude: currentRiderLng };
    destination = isOutForDelivery && destLat && destLng
      ? { latitude: destLat, longitude: destLng }
      : storeLat && storeLng
      ? { latitude: storeLat, longitude: storeLng }
      : null;
  } else if (storeLat && storeLng && destLat && destLng) {
    origin = { latitude: storeLat, longitude: storeLng };
    destination = { latitude: destLat, longitude: destLng };
  }

  // Collect active points to fit on map
  useEffect(() => {
    if (!mapRef.current) return;
    const pts = [];
    if (storeLat && storeLng) pts.push({ latitude: storeLat, longitude: storeLng });
    if (destLat && destLng) pts.push({ latitude: destLat, longitude: destLng });
    if (currentRiderLat && currentRiderLng) pts.push({ latitude: currentRiderLat, longitude: currentRiderLng });

    if (pts.length > 0) {
      mapRef.current.fitToCoordinates(pts, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [storeLat, storeLng, destLat, destLng, currentRiderLat, currentRiderLng]);

  // Open external maps fallback / helper
  const handleOpenExternalMap = () => {
    const targetLat = isOutForDelivery ? destLat : storeLat;
    const targetLng = isOutForDelivery ? destLng : storeLng;
    if (targetLat && targetLng) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${targetLat},${targetLng}`).catch(() => {});
    }
  };

  const initialLat = currentRiderLat || storeLat || destLat || 20.59;
  const initialLng = currentRiderLng || storeLng || destLng || 78.96;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.livePulseDot} />
          <Text style={styles.headerTitle}>LIVE DELIVERY RADAR</Text>
        </View>

        {Number.isFinite(destLat) && (
          <TouchableOpacity onPress={handleOpenExternalMap} style={styles.externalLinkBtn}>
            <Ionicons name="map-outline" size={13} color="#0284c7" />
            <Text style={styles.externalLinkText}>Open Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Floating ETA Badge */}
      {routeInfo ? (
        <View style={styles.etaBadge}>
          <Ionicons name="time" size={15} color="#15803d" />
          <Text style={styles.etaBadgeText}>
            {order?.status === 'DELIVERED'
              ? 'Order Delivered'
              : currentRiderLat
              ? `Rider is ${routeInfo.distance.toFixed(1)} km away • Arriving in ${Math.ceil(routeInfo.duration)} mins`
              : `Store to doorstep: ${routeInfo.distance.toFixed(1)} km • ~${Math.ceil(routeInfo.duration)} mins`}
          </Text>
        </View>
      ) : (
        <View style={styles.etaBadge}>
          <Ionicons name="navigate" size={14} color="#0284c7" />
          <Text style={styles.etaBadgeText}>
            {currentRiderLat
              ? `Rider GPS Active • ${Math.round(riderLocation?.speed || 0)} km/h`
              : 'Connecting live delivery route...'}
          </Text>
        </View>
      )}

      {/* Map Container */}
      {Platform.OS !== 'web' && MapView ? (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: initialLat,
              longitude: initialLng,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {/* Store Marker */}
            {Number.isFinite(storeLat) && Number.isFinite(storeLng) && (
              <Marker
                coordinate={{ latitude: storeLat, longitude: storeLng }}
                title={order?.vendor?.storeName || 'Merchant Store'}
                description="Pickup location"
              >
                <View style={[styles.markerBadge, { backgroundColor: '#ea580c' }]}>
                  <Ionicons name="storefront" size={14} color="#ffffff" />
                </View>
              </Marker>
            )}

            {/* Customer Delivery Pin Marker */}
            {Number.isFinite(destLat) && Number.isFinite(destLng) && (
              <Marker
                coordinate={{ latitude: destLat, longitude: destLng }}
                title="Delivery Address"
                description={order?.address?.line1 || 'Destination'}
              >
                <View style={[styles.markerBadge, { backgroundColor: '#0284c7' }]}>
                  <Ionicons name="home" size={14} color="#ffffff" />
                </View>
              </Marker>
            )}

            {/* Rider Live Marker with Heading Rotation */}
            {Number.isFinite(currentRiderLat) && Number.isFinite(currentRiderLng) && (
              <Marker
                coordinate={{ latitude: currentRiderLat, longitude: currentRiderLng }}
                title={rider?.name || 'Delivery Partner'}
                description={`Speed: ${Math.round(riderLocation?.speed || 0)} km/h`}
                rotation={heading}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
              >
                <View style={styles.riderMarkerWrap}>
                  <View style={styles.riderIconCircle}>
                    <Ionicons name="navigate" size={16} color="#ffffff" style={{ transform: [{ rotate: '-45deg' }] }} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Directions Route Polyline */}
            {origin && destination && apiKey && MapViewDirections ? (
              <MapViewDirections
                origin={origin}
                destination={destination}
                apikey={apiKey}
                strokeWidth={4}
                strokeColor="#16a34a"
                mode="DRIVING"
                onReady={result => {
                  setRouteInfo({ distance: result.distance, duration: result.duration });
                }}
                onError={errorMessage => {
                  console.warn('MapViewDirections error:', errorMessage);
                }}
              />
            ) : null}
          </MapView>
        </View>
      ) : (
        <View style={[styles.mapWrap, { alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
          <Text style={{ color: '#64748b', textAlign: 'center' }}>
            🗺️ Live map preview available in the mobile app
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
            Lat: {initialLat?.toFixed(4) ?? 'N/A'}, Lng: {initialLng?.toFixed(4) ?? 'N/A'}
          </Text>
        </View>
      )}

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons
            name={currentRiderLat ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={currentRiderLat ? '#16a34a' : '#f59e0b'}
          />
          <Text style={styles.footerText}>
            {order?.status === 'DELIVERED'
              ? 'Delivered to your doorstep'
              : currentRiderLat
              ? `Rider: ${rider?.name || 'Assigned Rider'} (Live GPS)`
              : 'Rider reaching pickup merchant'}
          </Text>
        </View>

        {rider?.phone ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${rider.phone}`).catch(() => {})}
            style={styles.callRiderBtn}
          >
            <Ionicons name="call" size={12} color="#16a34a" />
            <Text style={styles.callRiderText}>Call</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  headerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  externalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
  },
  externalLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10,
  },
  etaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  mapWrap: {
    height: 240,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  riderMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  callRiderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  callRiderText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16a34a',
  },
});
