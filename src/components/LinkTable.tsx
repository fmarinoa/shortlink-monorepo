import {
  Search,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  BarChart2,
} from "lucide-react";
import type { Link } from "../types/Link";

interface LinkTableProps {
  links: Link[];
  loading: boolean;
  baseUrl: string;
  onEdit: (link: Link) => void;
  onDelete: (slug: string) => void;
  onCopyLink: (url: string) => void;
}

export default function LinkTable({
  links,
  loading,
  baseUrl,
  onEdit,
  onDelete,
  onCopyLink,
}: LinkTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Link Corto
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Destino Original
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {links.map((link) => (
                <tr
                  key={link.slug}
                  className="group hover:bg-slate-800/50 transition-colors"
                >
                  {/* SLUG COLUMN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <ExternalLink size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          /{link.slug}
                          <button
                            onClick={() =>
                              onCopyLink(`${baseUrl}/${link.slug}`)
                            }
                            className="text-slate-500 hover:cursor-pointer hover:text-indigo-300 transition-colors"
                            title="Copiar link"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(link.creationDate)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* URL COLUMN */}
                  <td className="px-6 py-4 max-w-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-300 truncate block transition-colors text-sm"
                    >
                      {link.url}
                    </a>
                  </td>

                  {/* STATS COLUMN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <BarChart2 size={16} className="text-slate-500" />
                      <span className="font-mono font-medium">
                        {link.visitCount}
                      </span>
                      <span className="text-xs text-slate-500">visitas</span>
                    </div>
                  </td>

                  {/* ACTIONS COLUMN */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(link)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(link.slug)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {links.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-300">
              No se encontraron links
            </h3>
            <p className="text-slate-500 mt-1">
              Intenta con otra búsqueda o crea uno nuevo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
