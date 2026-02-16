import { useState } from "react";
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useExecuteSchedule,
} from "../hooks/useSchedules";
import { useGroups } from "../hooks/useGroups";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import StatusBadge from "../components/common/StatusBadge";
import { Plus, Edit2, Trash2, Play, X, Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STRATEGIES = [
  { value: "least_sent", label: "Least Sent" },
  { value: "round_robin", label: "Round Robin" },
  { value: "random", label: "Random" },
  { value: "newest", label: "Newest First" },
];

function ScheduleForm({ schedule, groups, onClose, onSave }) {
  const [form, setForm] = useState(
    schedule
      ? {
          groupId: schedule.groupId?._id || schedule.groupId,
          sendTimes: schedule.sendTimes || [{ hour: 10, minute: 0 }],
          daysOfWeek: schedule.daysOfWeek || [],
          productsPerSlot: schedule.productsPerSlot || 1,
          productSelectionStrategy: schedule.productSelectionStrategy || "least_sent",
          isActive: schedule.isActive !== false,
        }
      : {
          groupId: "",
          sendTimes: [{ hour: 10, minute: 0 }],
          daysOfWeek: [],
          productsPerSlot: 1,
          productSelectionStrategy: "least_sent",
          isActive: true,
        }
  );

  const addTime = () => {
    setForm({ ...form, sendTimes: [...form.sendTimes, { hour: 12, minute: 0 }] });
  };

  const removeTime = (index) => {
    setForm({
      ...form,
      sendTimes: form.sendTimes.filter((_, i) => i !== index),
    });
  };

  const updateTime = (index, field, value) => {
    const times = [...form.sendTimes];
    times[index] = { ...times[index], [field]: Number(value) };
    setForm({ ...form, sendTimes: times });
  };

  const toggleDay = (day) => {
    const days = form.daysOfWeek.includes(day)
      ? form.daysOfWeek.filter((d) => d !== day)
      : [...form.daysOfWeek, day];
    setForm({ ...form, daysOfWeek: days });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {schedule ? "Edit Schedule" : "New Schedule"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <select
              value={form.groupId}
              onChange={(e) => setForm({ ...form, groupId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Select group...</option>
              {groups?.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Send Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Send Times</label>
              <button
                type="button"
                onClick={addTime}
                className="text-xs text-green-600 hover:text-green-700"
              >
                + Add Time
              </button>
            </div>
            <div className="space-y-2">
              {form.sendTimes.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={time.hour}
                    onChange={(e) => updateTime(i, "hour", e.target.value)}
                    className="w-16 border rounded-lg px-2 py-1.5 text-sm text-center"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={time.minute}
                    onChange={(e) => updateTime(i, "minute", e.target.value)}
                    className="w-16 border rounded-lg px-2 py-1.5 text-sm text-center"
                  />
                  {form.sendTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days (empty = every day)
            </label>
            <div className="flex gap-2">
              {DAYS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border ${
                    form.daysOfWeek.includes(i)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Products per Slot
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.productsPerSlot}
                onChange={(e) => setForm({ ...form, productsPerSlot: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
              <select
                value={form.productSelectionStrategy}
                onChange={(e) => setForm({ ...form, productSelectionStrategy: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              id="isActive"
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
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
              {schedule ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SchedulesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: schedules, isLoading } = useSchedules();
  const { data: groups } = useGroups();
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();
  const executeMutation = useExecuteSchedule();

  const handleSave = async (formData) => {
    if (editSchedule) {
      await updateMutation.mutateAsync({ id: editSchedule._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowForm(false);
    setEditSchedule(null);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleExecute = async (id) => {
    try {
      await executeMutation.mutateAsync(id);
      alert("Schedule executed successfully!");
    } catch {
      alert("Failed to execute schedule");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <button
          onClick={() => { setEditSchedule(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      {!schedules || schedules.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No schedules yet. Create one to automate product sending!</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Times</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Days</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Strategy</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-green-600" />
                      {schedule.groupId?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {schedule.sendTimes?.map((t, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {schedule.daysOfWeek?.length === 0
                      ? "Every day"
                      : schedule.daysOfWeek.map((d) => DAYS[d]).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">
                    {schedule.productSelectionStrategy?.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={schedule.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleExecute(schedule._id)}
                        disabled={executeMutation.isPending}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Run now"
                      >
                        <Play size={14} />
                      </button>
                      <button
                        onClick={() => { setEditSchedule(schedule); setShowForm(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(schedule._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ScheduleForm
          schedule={editSchedule}
          groups={groups}
          onClose={() => { setShowForm(false); setEditSchedule(null); }}
          onSave={handleSave}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
