import { useCallback, useEffect, useMemo, useState } from "react";
import { createItem, getItems } from "../api/client";
import ItemForm from "../components/ItemForm";
import ItemList from "../components/ItemList";

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const nome = (item.nome || "").toLowerCase();
      const sku = (item.sku || "").toLowerCase();
      return nome.includes(q) || sku.includes(q) || String(item.id).includes(q);
    });
  }, [items, query]);

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
    <>
      <section>
        <h2>Inventario</h2>
        <input
          className="search-input"
          type="search"
          placeholder="Cerca per nome, SKU o ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section>
        <h2>Nuovo articolo</h2>
        <ItemForm onSubmit={handleCreate} disabled={saving} />
      </section>

      <section>
        <h2>Elenco ({filtered.length})</h2>
        <ItemList items={filtered} loading={loading} error={error} />
      </section>
    </>
  );
}
