import { useState } from "react";

const initialForm = {
  nome: "",
  sku: "",
  quantita: 0,
  prezzo: 0,
};

export default function ItemForm({ onSubmit, disabled }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      nome: form.nome.trim(),
      sku: form.sku.trim() || null,
      quantita: form.quantita,
      prezzo: form.prezzo,
    });
    setForm(initialForm);
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </label>
      <label>
        SKU
        <input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      <label>
        Quantità
        <input
          name="quantita"
          type="number"
          min="0"
          value={form.quantita}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      <label>
        Prezzo
        <input
          name="prezzo"
          type="number"
          min="0"
          step="0.01"
          value={form.prezzo}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      <button type="submit" disabled={disabled}>
        Aggiungi
      </button>
    </form>
  );
}
