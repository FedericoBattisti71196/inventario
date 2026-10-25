import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteItem, getItem, updateItem } from "../api/client";
import ItemForm from "../components/ItemForm";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getItem(id)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Articolo non trovato");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(payload) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateItem(id, payload);
      setItem(updated);
      setMessage("Articolo aggiornato.");
    } catch (err) {
      setError(err.message || "Impossibile aggiornare");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Eliminare "${item?.nome}"?`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteItem(id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Impossibile eliminare");
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="muted">Caricamento...</p>;
  }

  if (!item) {
    return (
      <section>
        <p className="error">{error || "Articolo non trovato"}</p>
        <Link to="/">Torna all'inventario</Link>
      </section>
    );
  }

  return (
    <section>
      <p>
        <Link to="/">← Inventario</Link>
      </p>
      <h2>{item.nome}</h2>
      <p className="muted">ID {item.id}</p>

      <ItemForm
        initialValues={item}
        onSubmit={handleUpdate}
        disabled={saving}
        submitLabel="Salva modifiche"
      />

      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="detail-actions">
        <button
          type="button"
          className="btn danger"
          onClick={handleDelete}
          disabled={saving}
        >
          Elimina
        </button>
      </div>
    </section>
  );
}
