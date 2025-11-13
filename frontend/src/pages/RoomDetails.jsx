import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error('Erro ao buscar quarto:', err);
      }
    }
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut && room) {
      const days = differenceInDays(checkOut, checkIn);
      setTotalPrice(days > 0 ? days * room.pricePerNight : 0);
    }
  }, [checkIn, checkOut, room]);

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage('Por favor, selecione as datas.');
      return;
    }

    try {
      await api.post(
        '/reservations',
        {
          roomId: room.id,
          checkIn,
          checkOut,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('Reserva realizada com sucesso!');
    } catch (err) {
      console.error(err);
      setMessage('Erro ao reservar. Verifique as datas ou tente novamente.');
    }
  };

  if (!room) return <p className="text-center mt-5">Carregando quarto...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        {room.imageUrl && (
          <img
            src={`http://localhost:3000${room.imageUrl}`}
            alt={room.title}
            className="card-img-top"
            style={{ height: '300px', objectFit: 'cover' }}
          />
        )}
        <div className="card-body">
          <h2>{room.title}</h2>
          <p>{room.description}</p>

          <div className="mb-3">
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
          </div>

          <div className="mb-3">
            <label className="form-label">Check-in: </label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Check-out: </label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              minDate={checkIn}
            />
          </div>

          {totalPrice > 0 && (
            <p className="fw-bold">
              Valor total: R$ {totalPrice.toFixed(2)}
            </p>
          )}

          {message && <div className="alert alert-info">{message}</div>}

          <button className="btn btn-primary w-100" onClick={handleReserve}>
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
