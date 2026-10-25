import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "../api/client";

const emptyForm = {
  name: "",
  quantity: 0,
  year: "",
  image: null,
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/*";

export default function ItemForm({
  onSubmit,
  disabled,
  initialValues,
  submitLabel = "Aggiungi",
}) {
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        quantity: Number(initialValues.quantity) || 0,
        year:
          initialValues.year === null || initialValues.year === undefined
            ? ""
            : String(initialValues.year),
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
    if (name === "year") {
      setForm((prev) => ({ ...prev, year: value }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const yearValue =
      form.year === "" || form.year === null || form.year === undefined
        ? null
        : Number(form.year);
    await onSubmit({
      name: form.name.trim(),
      quantity: form.quantity,
      year: yearValue,
      image: form.image,
    });
    if (!initialValues) {
      setForm(emptyForm);
      setPreviewUrl(null);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
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
        Anno
        <input
          name="year"
          type="number"
          min="1000"
          max="2100"
          placeholder="es. 2024"
          value={form.year}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>

      <div className="image-actions">
        <span className="image-actions-label">Immagine</span>
        <div className="image-actions-buttons">
          <button
            type="button"
            className="btn ghost"
            disabled={disabled}
            onClick={() => cameraInputRef.current?.click()}
          >
            Scatta foto
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={disabled}
            onClick={() => galleryInputRef.current?.click()}
          >
            Scegli file
          </button>
        </div>
        {form.image ? (
          <p className="muted image-file-name">{form.image.name}</p>
        ) : null}
        <input
          ref={cameraInputRef}
          className="sr-only"
          type="file"
          accept={IMAGE_ACCEPT}
          capture="environment"
          onChange={handleChange}
          disabled={disabled}
        />
        <input
          ref={galleryInputRef}
          className="sr-only"
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

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
