import { useCallback, useEffect, useState } from "react";
import { createItem, getItems } from "./api/client";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import "./App.css";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message || "Impossibile caricare gli articoli");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleCreate(payload) {
    setSaving(true);
    setError("");
    try {
      await createItem(payload);
      await loadItems();
    } catch (err) {
      setError(err.message || "Impossibile creare l'articolo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app">
      <header>
        <h1>Inventario</h1>
        <p>Scheletro React + FastAPI + MySQL</p>
      </header>

      <section>
        <h2>Nuovo articolo</h2>
        <ItemForm onSubmit={handleCreate} disabled={saving} />
      </section>

      <section>
        <h2>Elenco</h2>
        <ItemList items={items} loading={loading} error={error} />
      </section>
    </main>
  );
}
