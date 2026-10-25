import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createItem } from "../api/client";
import ItemForm from "../components/ItemForm";

export default function ItemNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(payload) {
    setSaving(true);
    setError("");
    try {
      const created = await createItem(payload);
      navigate(`/items/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Impossibile creare l'articolo");
      setSaving(false);
    }
  }

  return (
    <section>
      <p>
        <Link to="/">← Inventario</Link>
      </p>
      <h2>Nuovo articolo</h2>
      <ItemForm
        onSubmit={handleCreate}
        disabled={saving}
        submitLabel="Salva articolo"
      />
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
