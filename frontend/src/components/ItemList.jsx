import { useState } from "react";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../api/client";

function ItemThumb({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <span className="muted">—</span>;
  }
  return (
    <img
      className="item-thumb"
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
    />
  );
}

export default function ItemList({ items, loading, error }) {
  if (loading) {
    return <p className="empty-state">Sincronizzazione catalogo…</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!items.length) {
    return <p className="empty-state">Nessun articolo nel raggio di ricerca.</p>;
  }

  return (
    <div className="items-table-wrap">
      <table className="items-table">
        <thead>
          <tr>
            <th>Media</th>
            <th>ID</th>
            <th>Nome</th>
            <th>Anno</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const src = resolveMediaUrl(item.image_url);
            return (
              <tr key={item.id}>
                <td>
                  <ItemThumb src={src} alt={item.name} />
                </td>
                <td className="cell-id">{item.id}</td>
                <td>
                  <Link to={`/items/${item.id}`} className="item-link">
                    {item.name}
                  </Link>
                </td>
                <td className="cell-meta">{item.year ?? "—"}</td>
                <td className="cell-meta">{item.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
