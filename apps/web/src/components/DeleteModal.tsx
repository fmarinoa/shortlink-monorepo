import { Loader2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  formData: { slug: string; url: string };
  isLoading?: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteModal({
  isOpen,
  formData,
  isLoading = false,
  onClose,
  onDelete,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
        <h2 className="text-xl font-bold mb-4 text-white">
          ¿Estás seguro de que deseas eliminar este link?
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="space-y-4"
        >
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
                disabled={true}
                className={`flex-1 bg-slate-950 border border-slate-700 text-white text-sm rounded-r-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 opacity-50 cursor-not-allowed`}
                value={formData.slug}
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
              disabled={true}
              className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.url}
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
              Eliminar Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
