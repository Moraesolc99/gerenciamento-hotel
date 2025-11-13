import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function MyReservations() {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/my');
        setReservations(res.data);
      } catch (err) {
        console.error('Erro ao buscar reservas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <div className="text-center mt-5 text-light">Carregando...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-light">Minhas Reservas</h2>
      {reservations.length === 0 ? (
        <p className="text-light">Você ainda não possui reservas.</p>
      ) : (
        <div className="row">
          {reservations.map((r) => {
            const room = r.Room || {};
            const tags = Array.isArray(room.tags)
              ? room.tags
              : typeof room.tags === 'string'
              ? JSON.parse(room.tags.replace(/'/g, '"'))
              : [];

            return (
              <div key={r.id} className="col-md-4 mb-3">
                <div className="card bg-dark text-light shadow-sm border-secondary">
                  {room.imagePath && (
                    <img
                      src={`http://localhost:3000/${room.imagePath}`}
                      className="card-img-top"
                      alt={room.title || 'Quarto'}
                      style={{ objectFit: 'cover', height: '200px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="card-body">
                    <h5 className="card-title">{room.title || 'Quarto sem título'}</h5>
                    <p className="text-secondary">{room.description || 'Sem descrição disponível.'}</p>

                    <p>
                      <strong>Capacidade:</strong> até {room.maxPeople || '?'} pessoa(s)<br />
                      <strong>Camas:</strong> {room.beds || 0} ({room.bedTypes || 'Tipo não informado'})
                    </p>

                    {/* Exibir tags */}
                    {tags && tags.length > 0 && (
                      <div className="mb-2">
                        {tags.map((tag, i) => (
                          <span key={i} className="badge bg-secondary me-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <hr />

                    <p><strong>Check-in:</strong> {new Date(r.checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {new Date(r.checkOut).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> R${r.totalPrice}</p>

                    <button
                      className="btn btn-outline-primary w-100 mt-2"
                      onClick={() =>
                        alert(
                          'Para alterar ou cancelar sua reserva, entre em contato:\n\n' +
                          '📞 Telefone: (11) 96269-2261\n' +
                          '📧 Email: omoraes.2020@alunos.utfpr.edu.br\n\n' +
                          'Lembre-se: alterações devem ser feitas até 24h antes do check-in.'
                        )
                      }
                    >
                      Solicitar alteração
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
