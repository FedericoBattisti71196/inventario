import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../api/client";

export default function ItemList({ items, loading, error }) {
  if (loading) {
    return <p className="muted">Caricamento...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!items.length) {
    return <p className="muted">Nessun articolo trovato.</p>;
  }

  return (
    <table className="items-table">
      <thead>
        <tr>
          <th>Foto</th>
          <th>ID</th>
          <th>Nome</th>
          <th>Quantità</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const src = resolveMediaUrl(item.image_url);
          return (
            <tr key={item.id}>
              <td>
                {src ? (
                  <img
                    className="item-thumb"
                    src={src}
                    alt={item.name}
                  />
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td>{item.id}</td>
              <td>
                <Link to={`/items/${item.id}`} className="item-link">
                  {item.name}
                </Link>
              </td>
              <td>{item.quantity}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
