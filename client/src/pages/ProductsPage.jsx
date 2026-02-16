import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSendProduct,
} from "../hooks/useProducts";
import { useGroups } from "../hooks/useGroups";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Plus, Edit2, Trash2, Send, Search, X } from "lucide-react";

function ProductForm({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product || {
      name: "",
      price: "",
      originalPrice: "",
      currency: "USD",
      description: "",
      imageUrl: "",
      affiliateLink: "",
      category: "general",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {product ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={form.originalPrice || ""}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="ILS">ILS</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              maxLength={500}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="mt-2 h-20 rounded object-cover" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Link</label>
            <input
              type="url"
              value={form.affiliateLink}
              onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SendDialog({ product, groups, onClose, onSend }) {
  const [groupId, setGroupId] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-3">
          Send "{product.name}" to Group
        </h3>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
        >
          <option value="">Select a group...</option>
          {groups?.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(groupId)}
            disabled={!groupId}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [sendProduct, setSendProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useProducts({ page, search, limit: 12 });
  const { data: groups } = useGroups();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const sendMutation = useSendProduct();

  const handleSave = async (formData) => {
    if (editProduct) {
      await updateMutation.mutateAsync({ id: editProduct._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowForm(false);
    setEditProduct(null);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleSend = async (groupId) => {
    await sendMutation.mutateAsync({ productId: sendProduct._id, groupId });
    setSendProduct(null);
  };

  if (isLoading) return <LoadingSpinner />;

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No products found. Add your first product!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {product.originalPrice} {product.currency}
                    </span>
                  )}
                  <span className="text-sm font-bold text-green-600">
                    {product.price} {product.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    Sent {product.timesSent}x
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSendProduct(product)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      title="Send to group"
                    >
                      <Send size={14} />
                    </button>
                    <button
                      onClick={() => { setEditProduct(product); setShowForm(true); }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(product._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 text-sm rounded ${
                p === page
                  ? "bg-green-600 text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}
      {sendProduct && (
        <SendDialog
          product={sendProduct}
          groups={groups}
          onClose={() => setSendProduct(null)}
          onSend={handleSend}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to deactivate this product?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
