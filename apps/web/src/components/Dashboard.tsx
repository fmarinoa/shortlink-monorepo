import { useState } from "react";
import SetApiKey from "./SetApiKey";
import Header from "./Header";
import SearchBar from "./SearchBar";
import LinkTable from "./LinkTable";
import CreateEditModal from "./CreateEditModal";
import Toast from "./Toast";
import { copyToClipboard } from "../utils";
import type { LinkType } from "@shortlink/core";

interface DashboardProps {
  links: LinkType[];
  loading: boolean;
  onCreate: (data: { slug: string; url: string }) => void;
  onEdit: (slug: string, data: { slug: string; url: string }) => void;
  onDelete: (slug: string) => void;
  setApiKey: (apiKey: string) => void;
}

export default function Dashboard({
  links,
  loading,
  onCreate,
  onEdit,
  onDelete,
  setApiKey,
}: DashboardProps) {
  const { VITE_API_URL: baseUrl } = import.meta.env;
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({ slug: "", url: "" });
  const [isModalApiKeyOpen, setIsModalApiKeyOpen] = useState(false);

  const filteredLinks = links.filter(
    (link) =>
      link.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormData({ slug: "", url: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: LinkType) => {
    setEditingLink(link);
    setFormData({ slug: link.slug, url: link.url });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingLink) {
      onEdit(editingLink.slug, formData);
    } else {
      onCreate(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <Header
        onOpenApiKey={() => setIsModalApiKeyOpen(true)}
        onOpenCreate={handleOpenCreate}
      />

      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <LinkTable
        links={filteredLinks}
        loading={loading}
        baseUrl={baseUrl}
        onEdit={handleOpenEdit}
        onDelete={onDelete}
        onCopyLink={(text) => copyToClipboard(text, setShowToast)}
      />

      <CreateEditModal
        isOpen={isModalOpen}
        editingLink={editingLink}
        formData={formData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      {isModalApiKeyOpen && (
        <SetApiKey
          onSetApiKey={setApiKey}
          onClose={() => setIsModalApiKeyOpen(false)}
        />
      )}

      <Toast show={showToast} message="✓ Link copiado al portapapeles" />
    </div>
  );
}
