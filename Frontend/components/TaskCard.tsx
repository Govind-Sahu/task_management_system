"use client";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onEdit: (task: Task) => void;
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
};

export default function TaskCard({ task, onUpdate, onEdit }: TaskCardProps) {
  const handleToggle = async () => {
    try {
      await api.post(`/tasks/${task.id}/toggle`);
      toast.success("Task status updated!");
      onUpdate();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success("Task deleted");
      onUpdate();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const status = statusConfig[task.status];
  const isCompleted = task.status === "COMPLETED";

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${isCompleted ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              isCompleted
                ? "border-green-500 bg-green-500"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            {isCompleted && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 truncate ${isCompleted ? "line-through text-gray-400" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
