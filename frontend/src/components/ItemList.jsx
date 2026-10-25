import { Link } from "react-router-dom";

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
          <th>ID</th>
          <th>Nome</th>
          <th>SKU</th>
          <th>Quantità</th>
          <th>Prezzo</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>
              <Link to={`/items/${item.id}`} className="item-link">
                {item.nome}
              </Link>
            </td>
            <td>{item.sku || "—"}</td>
            <td>{item.quantita}</td>
            <td>€ {Number(item.prezzo).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
