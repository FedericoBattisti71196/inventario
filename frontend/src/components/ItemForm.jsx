import { useEffect, useState } from "react";

const emptyForm = {
  nome: "",
  sku: "",
  quantita: 0,
  prezzo: 0,
};

export default function ItemForm({
  onSubmit,
  disabled,
  initialValues,
  submitLabel = "Aggiungi",
}) {
  const [form, setForm] = useState(initialValues || emptyForm);

  useEffect(() => {
    if (initialValues) {
      setForm({
        nome: initialValues.nome || "",
        sku: initialValues.sku || "",
        quantita: Number(initialValues.quantita) || 0,
        prezzo: Number(initialValues.prezzo) || 0,
      });
    }
  }, [initialValues]);

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
    if (!initialValues) {
      setForm(emptyForm);
    }
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
      <button type="submit" className="btn" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
