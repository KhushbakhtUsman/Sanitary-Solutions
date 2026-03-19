import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Modal } from "../../components/ui/Modal";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import {
  createBrandApi,
  deleteBrandApi,
  getBrandsApi,
  updateBrandApi,
} from "../../services/adminApi";

const EMPTY_FORM = {
  name: "",
  description: "",
};

export const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) =>
        `${brand.name} ${brand.description || ""}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [brands, searchQuery]
  );

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBrandsApi();
      setBrands(data);
    } catch (apiError) {
      setError(apiError.message || "Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddDialog = () => {
    setSelectedBrand(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
    });
    setDialogOpen(true);
  };

  const openViewDialog = (brand) => {
    setSelectedBrand(brand);
    setViewOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    try {
      if (selectedBrand) {
        const updated = await updateBrandApi(selectedBrand._id, formData);
        setBrands((prev) => prev.map((brand) => (brand._id === selectedBrand._id ? updated : brand)));
        setFeedback("Brand updated successfully.");
      } else {
        const created = await createBrandApi(formData);
        setBrands((prev) => [created, ...prev]);
        setFeedback("Brand added successfully.");
      }

      setDialogOpen(false);
      setSelectedBrand(null);
      setFormData(EMPTY_FORM);
    } catch (apiError) {
      setError(apiError.message || "Failed to save brand.");
    }
  };

  const handleDelete = async (brand) => {
    const confirmed = window.confirm(`Delete brand "${brand.name}"?`);
    if (!confirmed) return;

    setError("");
    setFeedback("");

    try {
      await deleteBrandApi(brand._id);
      setBrands((prev) => prev.filter((item) => item._id !== brand._id));
      setFeedback("Brand deleted successfully.");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete brand.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500">Add, view, edit, delete, and search brands.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add brand
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="w-full text-sm text-gray-700 outline-none"
            placeholder="Search brands"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {loading ? <p className="text-sm text-gray-500">Loading brands...</p> : null}
        {feedback ? <p className="mb-4 text-sm text-emerald-600">{feedback}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <Table>
          <THead>
            <tr>
              <Th>Brand</Th>
              <Th>Description</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {filteredBrands.map((brand) => (
              <tr key={brand._id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{brand.name}</Td>
                <Td>{brand.description}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openViewDialog(brand)}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(brand)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(brand)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={selectedBrand ? "Edit brand" : "Add brand"}
        description="Manage product brands used in the admin product form."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Brand name</Label>
            <Input
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="AquaFlow"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Supplier in good standing"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{selectedBrand ? "Update" : "Add"} brand</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selectedBrand?.name || "Brand details"}
        description="Brand details"
      >
        {selectedBrand ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Name:</span> {selectedBrand.name}
            </p>
            <p>
              <span className="font-semibold">Description:</span> {selectedBrand.description || "N/A"}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
