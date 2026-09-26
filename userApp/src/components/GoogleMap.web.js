import React,{useEffect,useRef,useState} from 'react';
let mapsPromise;
function loadMaps(){
 if(window.google?.maps?.Map)return Promise.resolve(window.google.maps);
 if(mapsPromise)return mapsPromise;
 const key=process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY;
 if(!key)return Promise.reject(new Error('Map preview is unavailable. Use GPS or enter coordinates, then preview your pin in Google Maps.'));
 mapsPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const timer=setTimeout(()=>reject(new Error('Map could not load. Check your internet connection.')),15000);
  window.farmartMapsReady=()=>{clearTimeout(timer);resolve(window.google.maps);};
  script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&loading=async&callback=farmartMapsReady&v=weekly';
  script.async=true;script.onerror=()=>{clearTimeout(timer);reject(new Error('Google Maps could not load.'));};document.head.appendChild(script);
 });return mapsPromise;
}
export default function GoogleMap({points=[],onSelect}){
 const element=useRef(null),map=useRef(null),select=useRef(onSelect);select.current=onSelect;
 const [ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;let click;
  loadMaps().then(maps=>{if(cancelled)return;map.current=new maps.Map(element.current,{center:{lat:20.59,lng:78.96},zoom:5,mapTypeControl:false,streetViewControl:false,fullscreenControl:true});
   click=map.current.addListener('click',e=>select.current?.({lat:e.latLng.lat(),lng:e.latLng.lng()}));setReady(true);
  }).catch(e=>{if(!cancelled)setError(e.message);});
  return()=>{cancelled=true;click?.remove();};
 },[]);
 useEffect(()=>{if(!ready)return;const maps=window.google.maps;const valid=points.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
  const markers=valid.map(p=>{const m=new maps.Marker({map:map.current,position:{lat:p.lat,lng:p.lng},title:p.label,label:p.label,draggable:!!select.current});m.addListener('dragend',e=>select.current?.({lat:e.latLng.lat(),lng:e.latLng.lng()}));return m;});
  if(valid.length===1){map.current.setCenter(valid[0]);map.current.setZoom(17);}else if(valid.length){const bounds=new maps.LatLngBounds();valid.forEach(p=>bounds.extend(p));map.current.fitBounds(bounds,45);}
  return()=>markers.forEach(m=>{maps.event.clearInstanceListeners(m);m.setMap(null);});
 },[ready,JSON.stringify(points)]);
 return <div style={{width:'100%'}}>{error&&<p role="status" style={{padding:14,color:'#475569'}}>{error}</p>}<div ref={element} aria-label="Google delivery map" style={{height:error?0:280,width:'100%',borderRadius:14}}/></div>;
}
