import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoomCard({ room }) {
  const nav = useNavigate();
  return (
    <div style={{border:'1px solid #333', padding:10, borderRadius:6, background:'#1e1e1e', color:'#fff'}}>
      <img src={room.imageUrl ? `http://localhost:3000${room.imageUrl}` : '/placeholder.png'} alt={room.title} style={{width:'100%', height:160, objectFit:'cover'}} />
      <h3>{room.title}</h3>
      <p>{room.description?.slice(0,120)}...</p>
      <div>
        <strong>R$ {room.pricePerNight}</strong>
      </div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {room.tags?.map((t,i)=> <span key={i} style={{padding:'2px 8px', border:'1px solid #0f0', borderRadius:12}}>{t}</span>)}
      </div>
      <button onClick={()=>nav(`/room/${room.id}`)} style={{marginTop:10}}>Visualizar / Reservar</button>
    </div>
  );
}
