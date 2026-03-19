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
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
} from "../../services/adminApi";

const EMPTY_FORM = {
  name: "",
  description: "",
};

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.description || ""}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      ),
    [categories, searchQuery]
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategoriesApi();
      setCategories(data);
    } catch (apiError) {
      setError(apiError.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddDialog = () => {
    setSelectedCategory(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setDialogOpen(true);
  };

  const openViewDialog = (category) => {
    setSelectedCategory(category);
    setViewOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    try {
      if (selectedCategory) {
        const updated = await updateCategoryApi(selectedCategory._id, formData);
        setCategories((prev) =>
          prev.map((category) => (category._id === selectedCategory._id ? updated : category))
        );
        setFeedback("Category updated successfully.");
      } else {
        const created = await createCategoryApi(formData);
        setCategories((prev) => [created, ...prev]);
        setFeedback("Category added successfully.");
      }

      setDialogOpen(false);
      setSelectedCategory(null);
      setFormData(EMPTY_FORM);
    } catch (apiError) {
      setError(apiError.message || "Failed to save category.");
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setError("");
    setFeedback("");

    try {
      await deleteCategoryApi(category._id);
      setCategories((prev) => prev.filter((item) => item._id !== category._id));
      setFeedback("Category deleted successfully.");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Add, view, edit, delete, and search categories.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="w-full text-sm text-gray-700 outline-none"
            placeholder="Search categories"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {loading ? <p className="text-sm text-gray-500">Loading categories...</p> : null}
        {feedback ? <p className="mb-4 text-sm text-emerald-600">{feedback}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <Table>
          <THead>
            <tr>
              <Th>Category</Th>
              <Th>Description</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {filteredCategories.map((category) => (
              <tr key={category._id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{category.name}</Td>
                <Td>{category.description}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openViewDialog(category)}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(category)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(category)}>
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
        title={selectedCategory ? "Edit category" : "Add category"}
        description="Manage product categories used in the admin product form."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Category name</Label>
            <Input
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Accessories"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Seasonal focus"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{selectedCategory ? "Update" : "Add"} category</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selectedCategory?.name || "Category details"}
        description="Category details"
      >
        {selectedCategory ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Name:</span> {selectedCategory.name}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {selectedCategory.description || "N/A"}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
