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
      const year = item.year == null ? "" : String(item.year);
      return (
        name.includes(q) ||
        year.includes(q) ||
        String(item.id).includes(q)
      );
    });
  }, [items, query]);

  return (
    <>
      <section>
        <div className="section-header">
          <div>
            <span className="section-kicker">Stock live</span>
            <h2 className="page-title">Catalogo</h2>
          </div>
          <Link to="/items/new" className="btn">
            Nuovo articolo
          </Link>
        </div>
        <input
          className="search-input"
          type="search"
          placeholder="Cerca per nome, anno o ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section>
        <span className="section-kicker">Records · {filtered.length}</span>
        <h2 className="page-title">Elenco</h2>
        <ItemList items={filtered} loading={loading} error={error} />
      </section>
    </>
  );
}
