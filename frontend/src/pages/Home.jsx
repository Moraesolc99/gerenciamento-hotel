import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } catch (err) {
        console.error('Erro ao buscar quartos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  if (loading) return <p className="text-center mt-5">Carregando quartos...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Quartos Disponíveis</h2>

      <div className="row">
        {rooms.map((room) => (
          <div key={room.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              {room.imageUrl && (
                <img
                  src={`http://localhost:3000${room.imageUrl}`}
                  className="card-img-top"
                  alt={room.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{room.title}</h5>
                <p className="card-text">{room.description}</p>
                <span className="badge bg-success mb-2">
                  R$ {room.pricePerNight}/noite
                </span>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {room.tags &&
                    room.tags.map((tag, i) => (
                      <span key={i} className="badge bg-secondary">
                        {tag}
                      </span>
                    ))}
                </div>
                <Link to={`/room/${room.id}`} className="btn btn-primary w-100">
                  Ver Detalhes
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
