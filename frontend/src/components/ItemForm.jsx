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
  const lastQuantityRef = useRef(0);

  useEffect(() => {
    if (initialValues) {
      const qty = Number(initialValues.quantity) || 0;
      lastQuantityRef.current = qty;
      setForm({
        name: initialValues.name || "",
        quantity: qty,
        year:
          initialValues.year === null || initialValues.year === undefined
            ? ""
            : String(initialValues.year),
        image: null,
      });
      setPreviewUrl(resolveMediaUrl(initialValues.image_url));
    } else {
      lastQuantityRef.current = 0;
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
    if (name === "quantity") {
      if (value === "") {
        setForm((prev) => ({ ...prev, quantity: "" }));
        return;
      }
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) return;
      const next = Math.max(0, parsed);
      lastQuantityRef.current = next;
      setForm((prev) => ({ ...prev, quantity: next }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function adjustQuantity(delta) {
    setForm((prev) => {
      const typed = Number.parseInt(String(prev.quantity), 10);
      const base = Number.isNaN(typed) ? lastQuantityRef.current : typed;
      const next = Math.max(0, base + delta);
      lastQuantityRef.current = next;
      return { ...prev, quantity: next };
    });
  }

  function handleQuantityFocus() {
    lastQuantityRef.current =
      Number.parseInt(String(form.quantity), 10) || lastQuantityRef.current || 0;
    setForm((prev) => ({ ...prev, quantity: "" }));
  }

  function handleQuantityBlur() {
    setForm((prev) => {
      if (prev.quantity === "" || prev.quantity === null) {
        return { ...prev, quantity: lastQuantityRef.current };
      }
      const parsed = Number.parseInt(String(prev.quantity), 10);
      const next = Number.isNaN(parsed)
        ? lastQuantityRef.current
        : Math.max(0, parsed);
      lastQuantityRef.current = next;
      return { ...prev, quantity: next };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const yearValue =
      form.year === "" || form.year === null || form.year === undefined
        ? null
        : Number(form.year);
    const quantityValue = Number.parseInt(String(form.quantity), 10);
    const quantity = Number.isNaN(quantityValue)
      ? lastQuantityRef.current
      : Math.max(0, quantityValue);
    lastQuantityRef.current = quantity;
    await onSubmit({
      name: form.name.trim(),
      quantity,
      year: yearValue,
      image: form.image,
    });
    if (!initialValues) {
      lastQuantityRef.current = 0;
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
        <div className="quantity-stepper">
          <button
            type="button"
            className="quantity-btn"
            aria-label="Diminuisci quantità"
            disabled={
              disabled ||
              (form.quantity !== ""
                ? Number(form.quantity) <= 0
                : lastQuantityRef.current <= 0)
            }
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => adjustQuantity(-1)}
          >
            −
          </button>
          <input
            name="quantity"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.quantity}
            onChange={handleChange}
            onFocus={handleQuantityFocus}
            onBlur={handleQuantityBlur}
            disabled={disabled}
            aria-label="Quantità"
          />
          <button
            type="button"
            className="quantity-btn"
            aria-label="Aumenta quantità"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => adjustQuantity(1)}
          >
            +
          </button>
        </div>
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
