import { useEffect, useMemo, useState } from "react";
import { Upload, Link as LinkIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";

const getDefaultFormData = (categoryOptions, brandOptions) => ({
  name: "",
  description: "",
  price: 0,
  category: categoryOptions[0] || "",
  brand: brandOptions[0] || "",
  image: "",
  quantity: 0,
  inStock: true,
  rating: 4.5,
  reviews: 10,
});

const pickEditableFields = (product, fallback) => ({
  name: product?.name ?? fallback.name,
  description: product?.description ?? fallback.description,
  price: product?.price ?? fallback.price,
  category: product?.category ?? fallback.category,
  brand: product?.brand ?? fallback.brand,
  image: product?.image ?? fallback.image,
  quantity: product?.quantity ?? fallback.quantity,
  inStock: product?.inStock ?? fallback.inStock,
  rating: product?.rating ?? fallback.rating,
  reviews: product?.reviews ?? fallback.reviews,
});

export const ProductDialog = ({
  open,
  onClose,
  product,
  onSave,
  categoryOptions = [],
  brandOptions = [],
}) => {
  const defaults = useMemo(
    () => getDefaultFormData(categoryOptions, brandOptions),
    [categoryOptions, brandOptions]
  );

  const [formData, setFormData] = useState(defaults);
  const [imageUploadMethod, setImageUploadMethod] = useState("url");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (product) {
      setFormData(pickEditableFields(product, defaults));
      setImagePreview(product.image || "");
      return;
    }

    setFormData(defaults);
    setImagePreview("");
  }, [product, open, defaults]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...formData,
      inStock: Boolean(formData.inStock) && Number(formData.quantity) > 0,
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      handleChange("image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Edit product" : "Add new product"}
      description="Keep catalog details complete for accurate ordering."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Product name</Label>
          <Input
            required
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Chrome Basin Faucet"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            required
            value={formData.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onChange={(event) => handleChange("category", event.target.value)}
              required
            >
              {categoryOptions.length === 0 ? (
                <option value="">No category available</option>
              ) : (
                categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </Select>
          </div>
          <div>
            <Label>Brand</Label>
            <Select
              value={formData.brand}
              onChange={(event) => handleChange("brand", event.target.value)}
              required
            >
              {brandOptions.length === 0 ? (
                <option value="">No brand available</option>
              ) : (
                brandOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Price (Rs)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(event) => handleChange("price", parseFloat(event.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label>Stock quantity</Label>
            <Input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(event) => handleChange("quantity", parseInt(event.target.value, 10) || 0)}
              required
            />
          </div>
        </div>

        <div>
          <Label>Product image</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setImageUploadMethod("url")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                imageUploadMethod === "url"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setImageUploadMethod("file")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                imageUploadMethod === "file"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>

          {imageUploadMethod === "url" ? (
            <Input
              className="mt-3"
              type="url"
              value={formData.image}
              onChange={(event) => {
                handleChange("image", event.target.value);
                setImagePreview(event.target.value);
              }}
              placeholder="https://example.com/image.jpg"
            />
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer text-sm text-gray-500">
                Click to upload an image (PNG, JPG, WEBP)
              </label>
            </div>
          )}

          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 h-48 w-full rounded-xl object-contain"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.inStock}
            onChange={(event) => handleChange("inStock", event.target.checked)}
          />
          <span className="text-sm text-gray-700">In stock</span>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={categoryOptions.length === 0 || brandOptions.length === 0}>
            {product ? "Update" : "Add"} product
          </Button>
        </div>
      </form>
    </Modal>
  );
};
