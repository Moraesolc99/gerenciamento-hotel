import React, { useMemo, useCallback } from "react";

function RoomForm({ room, setRoom, onSave, onCancel, setImagePreview, imagePreview, handleCEPChange }) {
  const tagsArray = useMemo(() => {
    if (Array.isArray(room.tags)) return room.tags;
    if (typeof room.tags === "string")
      return room.tags
        .replace(/[{}"]/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    return [];
  }, [room.tags]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  }, [setRoom]);

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
            type="number"
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
}

export default RoomForm;