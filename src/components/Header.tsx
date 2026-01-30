import { Plus, Key } from "lucide-react";

interface HeaderProps {
  onOpenApiKey: () => void;
  onOpenCreate: () => void;
}

export default function Header({ onOpenApiKey, onOpenCreate }: HeaderProps) {
  return (
    <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Franco Mariño Link Shortener
        </h1>
        <p className="text-slate-400 mt-1">
          Administrador de links cortos de manera fácil y rápida
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onOpenApiKey}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg"
        >
          <Key size={20} />
          API Key
        </button>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Nuevo Link
        </button>
      </div>
    </div>
  );
}
