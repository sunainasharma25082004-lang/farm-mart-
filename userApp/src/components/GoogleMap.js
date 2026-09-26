import React, {useRef,useEffect} from 'react';
import {View,Text,Platform} from 'react-native';
import { MapView, Marker, PROVIDER_GOOGLE } from './MapViewWrapper';
import Constants from 'expo-constants';
export default function GoogleMap({points=[],onSelect}) {
 const ref=useRef(null);
 const valid=points.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
 const nativeReady=Constants.expoConfig?.extra?.googleMaps?.[Platform.OS];
 useEffect(()=>{if(ref.current&&valid.length)ref.current.fitToCoordinates(valid.map(p=>({latitude:p.lat,longitude:p.lng})),{edgePadding:{top:45,right:45,bottom:45,left:45},animated:true});},[JSON.stringify(valid)]);
 if(Platform.OS === 'web' || !nativeReady || !MapView)return <View style={{padding:18,backgroundColor:'#f1f5f9'}}><Text>Map preview unavailable. Use GPS or enter your delivery pin below, and preview it in Google Maps.</Text></View>;
 const center=valid[0] || {lat:20.59,lng:78.96};
 return <MapView ref={ref} provider={PROVIDER_GOOGLE} style={{height:280,width:'100%'}}
  initialRegion={{latitude:center.lat,longitude:center.lng,latitudeDelta:valid.length?0.02:20,longitudeDelta:valid.length?0.02:20}}
  onPress={onSelect?e=>onSelect({lat:e.nativeEvent.coordinate.latitude,lng:e.nativeEvent.coordinate.longitude}):undefined}>
  {valid.map((p,i)=><Marker key={p.id || i} coordinate={{latitude:p.lat,longitude:p.lng}} title={p.label} pinColor={p.color || '#16a34a'} draggable={!!onSelect} onDragEnd={onSelect?e=>onSelect({lat:e.nativeEvent.coordinate.latitude,lng:e.nativeEvent.coordinate.longitude}):undefined}/>)}
 </MapView>;
}
