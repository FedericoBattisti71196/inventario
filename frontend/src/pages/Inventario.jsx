import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../api/client";
import ItemList from "../components/ItemList";

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
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
      const name = (item.name || "").toLowerCase();
      return name.includes(q) || String(item.id).includes(q);
    });
  }, [items, query]);

  return (
    <>
      <section>
        <div className="section-header">
          <h2>Inventario</h2>
          <Link to="/items/new" className="btn">
            Nuovo articolo
          </Link>
        </div>
        <input
          className="search-input"
          type="search"
          placeholder="Cerca per nome o ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section>
        <h2>Elenco ({filtered.length})</h2>
        <ItemList items={filtered} loading={loading} error={error} />
      </section>
    </>
  );
}
