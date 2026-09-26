import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {io as client} from 'socket.io-client';
import Order from '../models/Order.js';
import Rider from '../models/Rider.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import orderRoutes from '../routes/orderRoutes.js';
import riderRoutes from '../routes/riderRoutes.js';
import {initSocket} from '../socket/index.js';
import {handleRiderAccept} from '../services/riderAssignmentService.js';
import {validCoordinates,distanceKm,canAccessOrder,orderForRole} from '../utils/deliveryPolicy.js';
const uri=process.env.TEST_MONGO_URI;
let server,io,url,customer,other,vendor,riderA,riderB;
const token=(account,role)=>jwt.sign({id:String(account._id),sub:String(account._id),role},process.env.JWT_ACCESS_SECRET || 'sfarmart_jwt_access_secret_2026_super_secure_key',{expiresIn:'1h'});
const req=async(method,route,account,role,body)=>{const r=await fetch(url+'/api'+route,{method,headers:{'Content-Type':'application/json',...(account?{Authorization:'Bearer '+token(account,role)}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};};
let seq=0;
const makeOrder=(extra={})=>Order.create({orderNumber:'TEST-'+(++seq),customer:customer._id,vendor:vendor._id,items:[],pricing:{itemsTotal:100,grandTotal:125},payment:{method:'COD',status:'PENDING'},address:{name:'Customer',phone:'9876500000',line1:'Gate 1',lat:30.902,lng:75.858},status:'READY_FOR_RIDER',...extra});
before(async()=>{
 if(!uri) return;
 if(!/^mongodb:\/\/(127\.0\.0\.1|localhost):/.test(uri))throw new Error('Tests require an isolated localhost MongoDB replica set.');
 await mongoose.connect(uri,{dbName:'farmart_delivery_test_'+Date.now()});
 await Promise.all([Order.init(),Rider.init(),User.init(),Vendor.init()]);
 [customer,other]=await User.create([{phone:'9876500000',name:'Customer A'},{phone:'9876500001',name:'Customer B'}]);
 vendor=await Vendor.create({storeName:'Test store',ownerName:'Merchant',phone:'9876500002',passwordHash:'unused',storeType:'KIRANA'});
 [riderA,riderB]=await Rider.create(['9876500003','9876500004'].map(phone=>({name:'Rider '+phone,phone,passwordHash:'unused',status:'ONLINE_IDLE',currentLocation:{type:'Point',coordinates:[75.8573,30.901]},locationUpdatedAt:new Date()})));
 const app=express();app.use(express.json());app.use('/api/rider',riderRoutes);app.use('/api',orderRoutes);
 server=http.createServer(app);io=initSocket(server);await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;
});
after(async()=>{if(!uri)return;await new Promise(r=>io.close(r));await mongoose.connection.dropDatabase();await mongoose.disconnect();});
test('Coordinates reject absent/out-of-range data and support zero',()=>{assert.equal(validCoordinates(0,0),true);for(const v of [null,undefined,NaN,Infinity,'30'])assert.equal(validCoordinates(v,75),false);assert.equal(validCoordinates(91,75),false);assert.equal(distanceKm({lat:0,lng:0},{lat:0,lng:0}),0);});
test('Order ownership and OTP redaction',()=>{const order={customer:'c',vendor:'v',rider:'r',pickupOtp:'1111',deliveryOtp:'2222'};assert.equal(canAccessOrder({id:'other',role:'RIDER'},order),false);assert.equal(canAccessOrder({id:'r',role:'RIDER'},order),true);assert.equal(orderForRole(order,'RIDER').deliveryOtp,undefined);assert.equal(orderForRole(order,'CUSTOMER').pickupOtp,undefined);assert.equal(orderForRole(order,'VENDOR').pickupOtp,'1111');});
test('HTTP: guest queues/status writes and customer rider endpoints are denied',{skip:!uri},async()=>{
 assert.equal((await req('GET','/orders/delivery/pending')).status,401);
 assert.equal((await req('PATCH','/orders/'+new mongoose.Types.ObjectId()+'/status',null,null,{status:'DELIVERED'})).status,401);
 assert.equal((await req('GET','/rider/profile',customer,'CUSTOMER')).status,403);
});
test('HTTP: unrelated customer and rider cannot read an order; vendor cannot skip OTP',{skip:!uri},async()=>{
 const order=await makeOrder();
 assert.equal((await req('GET','/orders/'+order.id,other,'CUSTOMER')).status,403);
 assert.equal((await req('GET','/orders/'+order.id,riderB,'RIDER')).status,403);
 assert.equal((await req('PATCH','/orders/'+order.id+'/status',vendor,'VENDOR',{status:'DELIVERED'})).status,403);
});
test('Socket: foreign vendor/order rooms are denied, owner can subscribe',{skip:!uri},async()=>{
 const order=await makeOrder();const socket=client(url,{auth:{token:token(other,'CUSTOMER')},transports:['websocket']});
 await new Promise((resolve,reject)=>{socket.on('connect',resolve);socket.on('connect_error',reject);});
 try{assert.equal((await socket.timeout(2000).emitWithAck('join:vendor',vendor.id)).ok,false);assert.equal((await socket.timeout(2000).emitWithAck('join:order',order.id)).ok,false);}finally{socket.disconnect();}
 const owner=client(url,{auth:{token:token(customer,'CUSTOMER')},transports:['websocket']});await new Promise((r,j)=>{owner.on('connect',r);owner.on('connect_error',j);});try{assert.equal((await owner.timeout(2000).emitWithAck('join:order',order.id)).ok,true);}finally{owner.disconnect();}
});
test('Concurrent acceptance: only one rider wins an order and one rider cannot take two orders',{skip:!uri},async()=>{
 await Rider.updateMany({},{$set:{status:'ONLINE_IDLE',activeOrderId:null}});
 const order=await makeOrder();const results=await Promise.all([handleRiderAccept(order.id,riderA.id),handleRiderAccept(order.id,riderB.id)]);
 assert.equal(results.filter(r=>r.success).length,1);
 const assigned=await Order.findById(order.id);assert.equal((await Rider.findById(assigned.rider)).activeOrderId.toString(),order.id);
 await Rider.updateMany({},{$set:{status:'ONLINE_IDLE',activeOrderId:null}});
 const [a,b]=await Promise.all([makeOrder(),makeOrder()]);const both=await Promise.all([handleRiderAccept(a.id,riderA.id),handleRiderAccept(b.id,riderA.id)]);assert.equal(both.filter(r=>r.success).length,1);
});
test('OTP lifecycle: pickup required, delivery cannot skip pickup, concurrent completion credits once',{skip:!uri},async()=>{
 const order=await makeOrder({rider:riderA._id,status:'RIDER_ARRIVED_STORE',pickupOtp:'1234',deliveryOtp:'5678'});
 await Rider.findByIdAndUpdate(riderA._id,{$set:{activeOrderId:order._id,status:'ON_DELIVERY',totalEarningsPaise:0,completedDeliveries:0}});
 assert.equal((await req('POST','/rider/orders/'+order.id+'/pickup-verify',riderA,'RIDER',{})).status,400);
 assert.equal((await req('POST','/rider/orders/'+order.id+'/delivery-verify',riderA,'RIDER',{deliveryOtp:'5678'})).status,409);
 const pickup=await req('POST','/rider/orders/'+order.id+'/pickup-verify',riderA,'RIDER',{pickupOtp:'1234'});assert.equal(pickup.status,200);assert.equal(pickup.body.order.pickupOtp,undefined);assert.equal(pickup.body.order.deliveryOtp,undefined);
 const done=await Promise.all([req('POST','/rider/orders/'+order.id+'/delivery-verify',riderA,'RIDER',{deliveryOtp:'5678'}),req('POST','/rider/orders/'+order.id+'/delivery-verify',riderA,'RIDER',{deliveryOtp:'5678'})]);assert.equal(done.filter(r=>r.status===200).length,1);assert.equal((await Rider.findById(riderA.id)).totalEarningsPaise,6500);
});
test('GPS rejects stale, inaccurate and foreign-order pings',{skip:!uri},async()=>{
 const fix={lat:30.901,lng:75.857,heading:0,speed:0,accuracy:10,capturedAt:Date.now()};
 assert.equal((await req('POST','/rider/location',riderA,'RIDER',{...fix,lat:999})).status,400);
 assert.equal((await req('POST','/rider/location',riderA,'RIDER',{...fix,capturedAt:1})).status,400);
 assert.equal((await req('POST','/rider/location',riderA,'RIDER',{...fix,accuracy:500})).status,400);
 assert.equal((await req('POST','/rider/location',riderA,'RIDER',{...fix,orderId:new mongoose.Types.ObjectId()})).status,403);
 assert.equal((await req('POST','/rider/location',riderA,'RIDER',fix)).status,200);
});
test('Checkout rejects missing pin and simulated prepaid payment',{skip:!uri},async()=>{
 const body={items:[{productId:new mongoose.Types.ObjectId(),qty:1}],address:{name:'User',phone:'9876500000',line1:'Gate'}};
 assert.equal((await req('POST','/orders',customer,'CUSTOMER',body)).body.code,'DELIVERY_ADDRESS_REQUIRED');
 assert.equal((await req('POST','/orders',customer,'CUSTOMER',{...body,address:{...body.address,lat:0,lng:0},paymentMethod:'CARD'})).body.code,'PAYMENT_NOT_CONFIGURED');
});
