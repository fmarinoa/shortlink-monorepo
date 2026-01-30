import { Loader2 } from "lucide-react";
import type { LinkType } from "@shortlink/core";

interface CreateEditModalProps {
  isOpen: boolean;
  editingLink: LinkType | null;
  formData: { slug: string; url: string };
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFormDataChange: (data: { slug: string; url: string }) => void;
}

export default function CreateEditModal({
  isOpen,
  editingLink,
  formData,
  isLoading = false,
  onClose,
  onSubmit,
  onFormDataChange,
}: CreateEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
        <h2 className="text-xl font-bold mb-4 text-white">
          {editingLink ? "Editar Link" : "Crear Nuevo Link"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Slug (Corto)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 text-slate-500 text-sm">
                /
              </span>
              <input
                type="text"
                required
                disabled={!!editingLink || isLoading}
                className={`flex-1 bg-slate-950 border border-slate-700 text-white text-sm rounded-r-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${editingLink || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="mi-link"
                value={formData.slug}
                onChange={(e) =>
                  onFormDataChange({ ...formData, slug: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              URL Destino
            </label>
            <input
              type="url"
              required
              disabled={isLoading}
              className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://google.com"
              value={formData.url}
              onChange={(e) =>
                onFormDataChange({ ...formData, url: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {editingLink ? "Guardar Cambios" : "Crear Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
