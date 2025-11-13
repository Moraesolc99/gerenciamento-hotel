import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import React from "react";

// Normaliza a data no formato YYYY-MM-DD (sem fuso)
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

// Soma 1 dia apenas para exibir no card (corrige o fuso)
const addOneDay = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("pt-BR");
};

// Busca CEP via BrasilAPI
async function buscarCEP(cep) {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (!res.ok) throw new Error("CEP não encontrado");
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar CEP:", err);
    return null;
  }
}

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState("reservas");
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  // === CARREGAMENTO DE DADOS ===
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (view === "reservas") {
          const res = await api.get("/reservations/all");
          setReservations(res.data);
        } else if (view === "usuarios") {
          const res = await api.get("/users");
          setUsers(res.data);
        } else if (view === "quartos") {
          const res = await api.get("/rooms");
          setRooms(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [view, user]);

  // === FUNÇÕES DE RESERVAS ===
  const handleEdit = (item) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleSave = async () => {
    try {
      if (!editing) return;
      const formattedCheckIn = normalizeDate(editing.checkIn);
      const formattedCheckOut = normalizeDate(editing.checkOut);

      const res = await api.put(`/reservations/${editing.id}`, {
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
      });

      setReservations((prev) =>
        prev.map((r) => (r.id === res.data.id ? res.data : r))
      );
      setEditing(null);
      alert("Reserva atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar reserva:", err);
      alert("Erro ao salvar reserva.");
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;

    try {
      await api.delete(`/${type}/${id}`);
      if (type === "reservations")
        setReservations(reservations.filter((r) => r.id !== id));
      if (type === "users") setUsers(users.filter((u) => u.id !== id));
      if (type === "rooms") setRooms(rooms.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir registro.");
    }
  };

  // === FUNÇÕES DE QUARTOS ===
  const handleRoomSave = async () => {
    try {
      const formData = new FormData();
      const data = editingRoom || newRoom;

      // Corrige tags (limpa formato e remove aspas)
      let cleanTags = [];
      if (Array.isArray(data.tags)) {
        cleanTags = data.tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof data.tags === "string") {
        cleanTags = data.tags
          .replace(/[{}"]/g, "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      for (const key in data) {
        if (key === "imageFile" || key === "tags") continue;
        if (data[key] !== undefined && data[key] !== null)
          formData.append(key, data[key]);
      }

      cleanTags.forEach((tag) => formData.append("tags[]", tag));
      if (data.imageFile) formData.append("image", data.imageFile);

      if (editingRoom) {
        await api.put(`/rooms/${data.id}`, formData);
        alert("Quarto atualizado com sucesso!");
      } else {
        await api.post("/rooms", formData);
        alert("Quarto criado com sucesso!");
      }

      const res = await api.get("/rooms");
      setRooms(res.data);
      setEditingRoom(null);
      setNewRoom(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Erro ao salvar quarto:", err);
      alert("Erro ao salvar quarto. Verifique se a imagem e os dados estão corretos.");
    }
  };

  const handleCEPChange = async (cep, setter) => {
    setter((prev) => ({ ...prev, addressCEP: cep }));
    if (cep.length === 8) {
      const dados = await buscarCEP(cep);
      if (dados) {
        setter((prev) => ({
          ...prev,
          addressStreet: dados.street,
          addressNeighborhood: dados.neighborhood,
          addressCity: dados.city,
          addressState: dados.state,
        }));
      }
    }
  };

  // === Formulário de Quarto ===
  const RoomForm = ({ room, setRoom, onSave, onCancel }) => {
  const tagsArray = Array.isArray(room.tags)
    ? room.tags
    : typeof room.tags === "string"
    ? room.tags
        .replace(/[{}"]/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card bg-dark text-light border-light p-3">
      <h4>{room.id ? "Editar Quarto" : "Novo Quarto"}</h4>
      <div className="row">
        <div className="col-md-6">
          <label>Título:</label>
          <input
            type="text"
            name="title"
            className="form-control mb-2"
            value={room.title || ""}
            onChange={handleInputChange}
          />

          <label>Descrição:</label>
          <textarea
            name="description"
            className="form-control mb-2"
            rows={3}
            value={room.description || ""}
            onChange={handleInputChange}
          />

          <label>Preço por Noite:</label>
          <input
            type="number"
            name="pricePerNight"
            step="0.01"
            className="form-control mb-2"
            value={room.pricePerNight || ""}
            onChange={handleInputChange}
          />

          <label>CEP:</label>
          <input
            type="text"
            name="addressCEP"
            className="form-control mb-2"
            maxLength={8}
            value={room.addressCEP || ""}
            onChange={(e) => handleCEPChange(e.target.value, setRoom)}
          />

          <label>Rua:</label>
          <input
            type="text"
            name="addressStreet"
            className="form-control mb-2"
            value={room.addressStreet || ""}
            onChange={handleInputChange}
          />

          <label>Bairro:</label>
          <input
            type="text"
            name="addressNeighborhood"
            className="form-control mb-2"
            value={room.addressNeighborhood || ""}
            onChange={handleInputChange}
          />

          <label>Cidade:</label>
          <input
            type="text"
            name="addressCity"
            className="form-control mb-2"
            value={room.addressCity || ""}
            onChange={handleInputChange}
          />

          <label>Estado:</label>
          <input
            type="text"
            name="addressState"
            className="form-control mb-2"
            value={room.addressState || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-md-6">
          <label>Imagem:</label>
          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setRoom((prev) => ({ ...prev, imageFile: file }));
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="img-fluid rounded mb-2"
              style={{ maxHeight: "200px" }}
            />
          )}

          <div className="mb-3">
            <label className="form-label text-light">Tags do Quarto</label>
            <input
              type="text"
              className="form-control"
              placeholder='Exemplo: "Até 2 Pessoas", "Proibido Fumar🚭", "Café da Manhã", "Aceita Animais"'
              value={tagsArray.join(", ")}
              onChange={(e) =>
                setRoom((prev) => ({
                  ...prev,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
            />
            <small className="text-muted">
              Separe cada tag por vírgula. Exemplo:{" "}
              <i>Até 2 Pessoas, Café da Manhã, Aceita Animais</i>
            </small>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-success" onClick={onSave}>
              Salvar
            </button>
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // === INTERFACE PRINCIPAL ===
  if (!user || user.role !== "admin") {
    return (
      <p className="text-center mt-5">Acesso restrito ao administrador.</p>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-light">Painel do Administrador</h2>

      {/* Navegação */}
      <div className="mb-4 d-flex gap-2">
        <button
          className={`btn btn-${
            view === "reservas" ? "primary" : "outline-primary"
          }`}
          onClick={() => setView("reservas")}
        >
          Reservas
        </button>
        <button
          className={`btn btn-${
            view === "usuarios" ? "primary" : "outline-primary"
          }`}
          onClick={() => setView("usuarios")}
        >
          Usuários
        </button>
        <button
          className={`btn btn-${
            view === "quartos" ? "primary" : "outline-primary"
          }`}
          onClick={() => setView("quartos")}
        >
          Quartos
        </button>
      </div>

      {loading && <p className="text-light">Carregando...</p>}

      {/* === RESERVAS === */}
      {view === "reservas" && !loading && (
        <div className="row">
          {reservations.map((r) => (
            <div key={r.id} className="col-md-4 mb-3">
              <div className="card bg-dark text-light shadow-sm border-secondary">
                {r.Room?.imagePath && (
                  <img
                    src={`http://localhost:3000/${r.Room.imagePath}`}
                    className="card-img-top"
                    alt={r.Room.title}
                    style={{ objectFit: "cover", height: "180px" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">
                    {r.Room?.title || "Quarto sem título"}
                  </h5>
                  <p className="text-secondary small">{r.Room?.description}</p>
                  <p>
                    <strong>Hóspede:</strong> {r.User?.name || "Desconhecido"}
                  </p>
                  <p>
                    <strong>Email:</strong> {r.User?.email}
                  </p>
                  {editing?.id === r.id ? (
                    <>
                      <label>Check-in:</label>
                      <input
                        type="date"
                        value={normalizeDate(editing.checkIn)}
                        onChange={(e) =>
                          setEditing({ ...editing, checkIn: e.target.value })
                        }
                        className="form-control mb-2"
                      />
                      <label>Check-out:</label>
                      <input
                        type="date"
                        value={normalizeDate(editing.checkOut)}
                        onChange={(e) =>
                          setEditing({ ...editing, checkOut: e.target.value })
                        }
                        className="form-control mb-3"
                      />
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleSave}
                        >
                          Salvar
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancel}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Check-in:</strong> {addOneDay(r.checkIn)}
                        <br />
                        <strong>Check-out:</strong> {addOneDay(r.checkOut)}
                      </p>
                      <p>
                        <strong>Total:</strong> R${r.totalPrice}
                      </p>
                      <div className="d-flex justify-content-between mt-2">
                        <button
                          className="btn btn-warning btn-sm w-50 me-2"
                          onClick={() => handleEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm w-50"
                          onClick={() => handleDelete(r.id, "reservations")}
                        >
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === USUÁRIOS === */}
      {view === "usuarios" && !loading && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.id, "users")}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === QUARTOS === */}
      {view === "quartos" && !loading && (
        <div>
          {!editingRoom && !newRoom && (
            <div className="mb-3 text-end">
              <button
                className="btn btn-success"
                onClick={() =>
                  setNewRoom({
                    title: "",
                    description: "",
                    pricePerNight: "",
                    beds: 1,
                    bedTypes: "",
                    maxPeople: 2,
                    floor: 1,
                    tags: [],
                    addressCEP: "",
                    addressStreet: "",
                    addressNeighborhood: "",
                    addressCity: "",
                    addressState: "",
                  })
                }
              >
                + Novo Quarto
              </button>
            </div>
          )}

          {newRoom && (
            <RoomForm
              room={newRoom}
              setRoom={setNewRoom}
              onSave={handleRoomSave}
              onCancel={() => setNewRoom(null)}
            />
          )}

          {editingRoom && (
            <RoomForm
              room={editingRoom}
              setRoom={setEditingRoom}
              onSave={handleRoomSave}
              onCancel={() => setEditingRoom(null)}
            />
          )}

          {!editingRoom && !newRoom && (
            <div className="row">
              {rooms.map((r) => {
                const cleanTags = Array.isArray(r.tags)
                  ? r.tags
                  : typeof r.tags === "string"
                  ? r.tags
                      .replace(/[{}"]/g, "")
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  : [];

                return (
                  <div key={r.id} className="col-md-4 mb-3">
                    <div className="card bg-dark text-light border-secondary shadow-sm">
                      {r.imageUrl && (
                        <img
                          src={`http://localhost:3000${r.imageUrl}`}
                          alt={r.title}
                          className="card-img-top"
                          style={{ objectFit: "cover", height: "180px" }}
                        />
                      )}
                      <div className="card-body">
                        <h5>{r.title}</h5>
                        <p className="small text-secondary">
                          {r.description}
                        </p>
                        <p>
                          <strong>Preço:</strong> R${r.pricePerNight}
                        </p>
                        <p>
                          <strong>Máx. Pessoas:</strong> {r.maxPeople} <br />
                          <strong>Cama:</strong> {r.bedTypes}
                        </p>

                        {/* TAGS COM BADGES */}
                        <div className="mt-2 mb-3">
                          {cleanTags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-info text-dark me-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between mt-2">
                          <button
                            className="btn btn-warning btn-sm w-50 me-2"
                            onClick={() => setEditingRoom(r)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm w-50"
                            onClick={() => handleDelete(r.id, "rooms")}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
