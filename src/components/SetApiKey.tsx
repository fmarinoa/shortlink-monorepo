import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getApiKey } from "../hooks/localStorage";

export default function SetApiKey({
  onSetApiKey,
  onClose,
}: {
  onSetApiKey: (apiKey: string) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(getApiKey() || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSetApiKey(formData);
    onClose();
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
          <h2 className="text-xl font-bold mb-4 text-white">
            Configurar X API Key
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                X API Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-10"
                  placeholder="Ingresa tu API Key"
                  onChange={(e) => setFormData(e.target.value)}
                  value={formData}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Guardar API Key
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
