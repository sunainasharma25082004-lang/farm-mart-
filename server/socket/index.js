import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import { canAccessOrder, idOf } from '../utils/deliveryPolicy.js';
let ioInstance;
export function initSocket(httpServer) {
 const io = new Server(httpServer, {cors:{origin:'*'},pingInterval:25000,pingTimeout:20000});
 io.use((socket,next) => {
  const token=socket.handshake.auth?.token;
  if (!token) {socket.user={role:'GUEST'}; return next();}
  try {
   socket.user=jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'sfarmart_jwt_access_secret_2026_super_secure_key'); next();
  } catch {next(new Error('AUTH_REQUIRED'));}
 });
 io.on('connection', socket => {
  const user=socket.user, id=idOf(user.sub || user.id);
  const prefix={CUSTOMER:'customer',VENDOR:'vendor',RIDER:'rider'}[user.role];
  if(prefix && id) socket.join(prefix+':'+(user.role==='VENDOR'?idOf(user.vendorId || id):id));
  const expiresIn=user.exp*1000-Date.now();
  const expiry=Number.isFinite(expiresIn)?setTimeout(()=>socket.disconnect(true),Math.max(0,expiresIn)):null;
  socket.on('join:vendor',(vendorId,ack=()=>{})=>{
   if(user.role!=='VENDOR' || idOf(user.vendorId || id)!==String(vendorId)) return ack({ok:false});
   socket.join('vendor:'+vendorId);ack({ok:true});
  });
  socket.on('join:order',async(orderId,ack=()=>{})=>{
   try {
    if(!/^[a-f0-9]{24}$/i.test(String(orderId))) return ack({ok:false});
    const order=await Order.findById(orderId).select('customer vendor rider');
    if(!order || !canAccessOrder(user,order)) return ack({ok:false});
    socket.join('order:'+orderId);ack({ok:true});
   } catch {ack({ok:false});}
  });
  socket.on('leave:order',id=>socket.leave('order:'+id));
  socket.on('leave:vendor',id=>socket.leave('vendor:'+id));
  // GPS writes go through the authenticated HTTP endpoint, never an unchecked socket payload.
  socket.on('disconnect',()=>clearTimeout(expiry));
 });
 ioInstance=io;return io;
}
export function getIO(){return ioInstance;}
