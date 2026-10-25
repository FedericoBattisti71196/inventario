import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../api/client";

const emptyForm = {
  name: "",
  quantity: 0,
  image: null,
};

export default function ItemForm({
  onSubmit,
  disabled,
  initialValues,
  submitLabel = "Aggiungi",
}) {
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        quantity: Number(initialValues.quantity) || 0,
        image: null,
      });
      setPreviewUrl(resolveMediaUrl(initialValues.image_url));
    } else {
      setForm(emptyForm);
      setPreviewUrl(null);
    }
  }, [initialValues]);

  useEffect(() => {
    if (!(form.image instanceof File)) return undefined;
    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  function handleChange(event) {
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      name: form.name.trim(),
      quantity: form.quantity,
      image: form.image,
    });
    if (!initialValues) {
      setForm(emptyForm);
      setPreviewUrl(null);
      event.target.reset();
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </label>
      <label>
        Quantità
        <input
          name="quantity"
          type="number"
          min="0"
          value={form.quantity}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      <label>
        Immagine
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      {previewUrl ? (
        <div className="item-preview">
          <img src={previewUrl} alt="Anteprima articolo" />
        </div>
      ) : null}
      <button type="submit" className="btn" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
