import { useState } from "react";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useTestGroup,
} from "../hooks/useGroups";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import StatusBadge from "../components/common/StatusBadge";
import { Plus, Edit2, Trash2, Send, X, Users } from "lucide-react";

function GroupForm({ group, onClose, onSave }) {
  const [form, setForm] = useState(
    group
      ? {
          name: group.name || "",
          chatId: group.chat_id || "",
          description: group.description || "",
          settings: {
            maxMessagesPerDay: group.max_messages_per_day || 3,
            language: group.language || "he",
            messagePrefix: group.message_prefix || "",
            messageSuffix: group.message_suffix || "",
          },
        }
      : {
          name: "",
          chatId: "",
          description: "",
          settings: {
            maxMessagesPerDay: 3,
            language: "he",
            messagePrefix: "",
            messageSuffix: "",
          },
        }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const updateSettings = (key, value) => {
    setForm({
      ...form,
      settings: { ...form.settings, [key]: value },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {group ? "Edit Group" : "New Group"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat ID (Green API format)
            </label>
            <input
              type="text"
              value={form.chatId}
              onChange={(e) => setForm({ ...form, chatId: e.target.value })}
              placeholder="e.g., 972501234567-1612345678@g.us"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <hr />
          <h3 className="font-medium text-sm text-gray-700">Settings</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Messages/Day
              </label>
              <input
                type="number"
                value={form.settings?.maxMessagesPerDay || 3}
                onChange={(e) => updateSettings("maxMessagesPerDay", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={form.settings?.language || "he"}
                onChange={(e) => updateSettings("language", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="he">Hebrew</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Prefix</label>
            <input
              type="text"
              value={form.settings?.messagePrefix || ""}
              onChange={(e) => updateSettings("messagePrefix", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Text before product message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Suffix</label>
            <input
              type="text"
              value={form.settings?.messageSuffix || ""}
              onChange={(e) => updateSettings("messageSuffix", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Text after product message"
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
              {group ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: groups, isLoading } = useGroups();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const testMutation = useTestGroup();

  const handleSave = async (formData) => {
    if (editGroup) {
      await updateMutation.mutateAsync({ id: editGroup.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowForm(false);
    setEditGroup(null);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleTest = async (id) => {
    try {
      await testMutation.mutateAsync(id);
      alert("Test message sent successfully!");
    } catch {
      alert("Failed to send test message");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => { setEditGroup(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <Plus size={16} /> Add Group
        </button>
      </div>

      {!groups || groups.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No groups yet. Add your first WhatsApp group!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{group.chat_id}</p>
                  </div>
                </div>
                <StatusBadge status={group.is_active ? "active" : "inactive"} />
              </div>

              {group.description && (
                <p className="text-sm text-gray-500 mb-3">{group.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div>Messages sent: <b>{group.total_messages_sent}</b></div>
                <div>Language: <b>{group.language || "he"}</b></div>
                <div>Max/day: <b>{group.max_messages_per_day || 3}</b></div>
                {group.last_message_sent_at && (
                  <div>Last: <b>{new Date(group.last_message_sent_at).toLocaleDateString()}</b></div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleTest(group.id)}
                  disabled={testMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <Send size={12} /> Test
                </button>
                <button
                  onClick={() => { setEditGroup(group); setShowForm(true); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(group.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <GroupForm
          group={editGroup}
          onClose={() => { setShowForm(false); setEditGroup(null); }}
          onSave={handleSave}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Group"
        message="Are you sure you want to delete this group?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
