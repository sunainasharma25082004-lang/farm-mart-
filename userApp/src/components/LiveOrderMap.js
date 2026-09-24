import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Calculate spherical distance between two GPS coordinates (Haversine formula in km)
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.1, R * c);
}

export const LiveOrderMap = ({ order, riderLocation, rider }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarWave = useRef(new Animated.Value(0.4)).current;

  // Pulse animation for moving rider marker
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    );

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarWave, {
          toValue: 1.8,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(radarWave, {
          toValue: 0.4,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    );

    pulseLoop.start();
    waveLoop.start();

    return () => {
      pulseLoop.stop();
      waveLoop.stop();
    };
  }, []);

  // Store coordinates
  const storeLat = order?.vendor?.location?.coordinates?.[1] || 30.9010;
  const storeLng = order?.vendor?.location?.coordinates?.[0] || 75.8573;
  const storeName = order?.vendor?.storeName || 'Merchant Store';

  // Customer coordinates
  const custLat = order?.address?.lat || 30.9095;
  const custLng = order?.address?.lng || 75.8645;
  const custAddress = order?.address?.line1 || 'Your Delivery Address';

  // Rider coordinates (live beacon or interpolated)
  const isEnRoute = order?.status === 'OUT_FOR_DELIVERY';
  const isAtStore = order?.status === 'RIDER_ARRIVED_STORE';
  const isAssigned = order?.status === 'RIDER_ASSIGNED';

  const riderLat = riderLocation?.lat || (isEnRoute ? 30.9055 : storeLat);
  const riderLng = riderLocation?.lng || (isEnRoute ? 75.8610 : storeLng);
  const speed = riderLocation?.speed ?? (isEnRoute ? 22 : 0);
  const heading = riderLocation?.heading || 45;

  // Distance & ETA calculation
  const remainingKm = useMemo(() => {
    const targetLat = isEnRoute ? custLat : storeLat;
    const targetLng = isEnRoute ? custLng : storeLng;
    return calculateHaversineKm(riderLat, riderLng, targetLat, targetLng);
  }, [riderLat, riderLng, custLat, custLng, storeLat, storeLng, isEnRoute]);

  const etaMinutes = useMemo(() => {
    const avgSpeedKmH = Math.max(12, speed || 18);
    const mins = Math.round((remainingKm / avgSpeedKmH) * 60);
    return Math.max(1, mins);
  }, [remainingKm, speed]);

  // Motion state interpretation
  const motionStatus = useMemo(() => {
    if (order?.status === 'DELIVERED') {
      return {
        label: 'Delivered at Doorstep',
        desc: 'Order hand-over completed with OTP',
        color: '#16a34a',
        icon: 'checkmark-circle'
      };
    }
    if (isAtStore) {
      return {
        label: 'Rider Stopped at Kitchen Counter',
        desc: 'Inspecting package and picking up your order',
        color: '#ea580c',
        icon: 'storefront'
      };
    }
    if (isAssigned) {
      return {
        label: 'Rider En-Route to Store',
        desc: 'Heading towards store for parcel pickup',
        color: '#0284c7',
        icon: 'bicycle'
      };
    }
    if (speed > 5) {
      return {
        label: `Rider is Moving (${speed} km/h)`,
        desc: 'On route towards your delivery address',
        color: '#16a34a',
        icon: 'navigate'
      };
    }
    return {
      label: 'Rider Stopped (0 km/h)',
      desc: 'Temporarily stopped at traffic signal / chowk',
      color: '#eab308',
      icon: 'pause-circle'
    };
  }, [order?.status, isAtStore, isAssigned, speed]);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${custLat},${custLng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {});
  };

  // Normalized map percentages for diagrammatic overview
  const minLat = Math.min(storeLat, custLat, riderLat);
  const maxLat = Math.max(storeLat, custLat, riderLat);
  const minLng = Math.min(storeLng, custLng, riderLng);
  const maxLng = Math.max(storeLng, custLng, riderLng);

  const normalizeY = (lat) => {
    const range = maxLat - minLat || 0.01;
    return Math.max(15, Math.min(85, ((maxLat - lat) / range) * 70 + 15));
  };

  const normalizeX = (lng) => {
    const range = maxLng - minLng || 0.01;
    return Math.max(15, Math.min(85, ((lng - minLng) / range) * 70 + 15));
  };

  const storePos = { top: `${normalizeY(storeLat)}%`, left: `${normalizeX(storeLng)}%` };
  const custPos = { top: `${normalizeY(custLat)}%`, left: `${normalizeX(custLng)}%` };
  const riderPos = { top: `${normalizeY(riderLat)}%`, left: `${normalizeX(riderLng)}%` };

  return (
    <View style={styles.container}>
      {/* Map Header with Live Badge & ETA */}
      <View style={styles.mapHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusGlowDot, { backgroundColor: motionStatus.color }]} />
          <View>
            <Text style={styles.mapTitle}>LIVE GPS RADAR MAP</Text>
            <Text style={styles.mapSub}>{motionStatus.label}</Text>
          </View>
        </View>

        <View style={styles.etaPill}>
          <Ionicons name="time" size={14} color="#0284c7" />
          <Text style={styles.etaText}>~{etaMinutes} MINS</Text>
          <Text style={styles.distText}>({remainingKm.toFixed(1)} km)</Text>
        </View>
      </View>

      {/* Visual Live Route Viewport */}
      <View style={styles.mapViewport}>
        {/* Street Grid Background Pattern */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.gridLineHorizontal3} />
          <View style={styles.gridLineVertical1} />
          <View style={styles.gridLineVertical2} />
          <View style={styles.roadHighway} />
        </View>

        {/* Store Pin Marker */}
        <View style={[styles.markerAbsolute, storePos]}>
          <View style={[styles.pinBubble, { backgroundColor: '#ea580c' }]}>
            <Ionicons name="storefront" size={13} color="#ffffff" />
            <Text style={styles.pinLabel} numberOfLines={1}>
              Store
            </Text>
          </View>
          <View style={styles.pinStem} />
        </View>

        {/* Customer Doorstep Pin Marker */}
        <View style={[styles.markerAbsolute, custPos]}>
          <View style={[styles.pinBubble, { backgroundColor: '#16a34a' }]}>
            <Ionicons name="home" size={13} color="#ffffff" />
            <Text style={styles.pinLabel} numberOfLines={1}>
              You
            </Text>
          </View>
          <View style={styles.pinStem} />
        </View>

        {/* Rider Real-Time Moving Marker */}
        <View style={[styles.markerAbsolute, riderPos]}>
          {/* Animated Radar Pulse Wave */}
          <Animated.View
            style={[
              styles.radarWaveCircle,
              {
                transform: [{ scale: radarWave }],
                opacity: radarWave.interpolate({
                  inputRange: [0.4, 1.8],
                  outputRange: [0.6, 0]
                })
              }
            ]}
          />

          <Animated.View
            style={[
              styles.riderMovingBubble,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons name="bicycle" size={18} color="#ffffff" />
          </Animated.View>
          <View style={styles.riderSpeedBadge}>
            <Text style={styles.riderSpeedText}>{speed} km/h</Text>
          </View>
        </View>
      </View>

      {/* Motion & Activity Description Banner */}
      <View style={[styles.activityBanner, { borderColor: motionStatus.color + '40' }]}>
        <View style={[styles.activityIconWrap, { backgroundColor: motionStatus.color + '18' }]}>
          <Ionicons name={motionStatus.icon} size={18} color={motionStatus.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.activityTitle, { color: motionStatus.color }]}>
            {motionStatus.label}
          </Text>
          <Text style={styles.activityDesc}>{motionStatus.desc}</Text>
        </View>
      </View>

      {/* Coordinate Telemetry & Google Maps Link Action */}
      <View style={styles.bottomActionsRow}>
        <View style={styles.telemetryBadge}>
          <Ionicons name="compass-outline" size={14} color="#64748b" />
          <Text style={styles.telemetryText}>
            GPS: {riderLat.toFixed(4)}°N, {riderLng.toFixed(4)}°E
          </Text>
        </View>

        <TouchableOpacity
          style={styles.googleMapsBtn}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.85}
        >
          <Ionicons name="map-outline" size={14} color="#ffffff" />
          <Text style={styles.googleMapsText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusGlowDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  mapTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6
  },
  mapSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 4
  },
  etaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7'
  },
  distText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  mapViewport: {
    height: 190,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  gridLineHorizontal3: {
    position: 'absolute',
    top: '85%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e2e8f0'
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e2e8f0'
  },
  roadHighway: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    right: '15%',
    bottom: '25%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 30,
    opacity: 0.6
  },
  markerAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20,
    marginTop: -20
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  pinLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  pinStem: {
    width: 2,
    height: 6,
    backgroundColor: '#64748b'
  },
  radarWaveCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
    borderWidth: 1.5,
    borderColor: '#0284c7'
  },
  riderMovingBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5
  },
  riderSpeedBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2
  },
  riderSpeedText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800'
  },
  activityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  activityDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  telemetryText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5
  },
  googleMapsText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  }
});

export default LiveOrderMap;
