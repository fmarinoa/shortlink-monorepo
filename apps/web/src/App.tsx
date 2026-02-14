import { useState } from "react";
import { setApiKey } from "./hooks/localStorage";
import { useLinkMutations, useLinks } from "./hooks/useLinks";
import type { LinkType } from "@shortlink/core";
import SetApiKey from "./components/SetApiKey";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import LinkTable from "./components/LinkTable";
import LinkModal from "./components/LinkModal";
import Toast from "./components/Toast";
import { copyToClipboard, getErrorMessage } from "./utils";

function App() {
  const { data: links, isLoading, isError, error } = useLinks();
  const { createLink, deleteLink, updateLink } = useLinkMutations();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create",
  );
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState({ slug: "", url: "" });
  const [isModalApiKeyOpen, setIsModalApiKeyOpen] = useState(false);

  if (isError) {
    console.error("Error fetching links:", error);
  }

  const showToastMessage = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const allLinks = links?.data || [];
  const filteredLinks = allLinks.filter(
    (link: LinkType) =>
      link.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormData({ slug: "", url: "" });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: LinkType) => {
    setEditingLink(link);
    setFormData({ slug: link.slug, url: link.url });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (modalMode === "delete") {
        if (!deletingLink) return;
        await deleteLink.mutateAsync(deletingLink.slug);
        showToastMessage("✅ Link eliminado correctamente", "success");
        setDeletingLink(null);
      } else if (modalMode === "edit" && editingLink) {
        await updateLink.mutateAsync({
          slug: editingLink.slug,
          data: { url: formData.url },
        });
        showToastMessage("✅ Link actualizado correctamente", "success");
      } else {
        await createLink.mutateAsync({ newLink: formData });
        showToastMessage("✅ Link creado exitosamente", "success");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Error saving link", err);
      const errorMessage = getErrorMessage(
        err as { response?: { status: number } },
        modalMode === "delete"
          ? "Error al eliminar el link"
          : "Error al guardar el link",
      );
      showToastMessage(errorMessage, "error");
    }
  };

  const handleDelete = (slug: string) => {
    const linkToDelete = allLinks.find((link: LinkType) => link.slug === slug);
    if (linkToDelete) {
      setDeletingLink(linkToDelete);
      setFormData({ slug: linkToDelete.slug, url: linkToDelete.url });
      setModalMode("delete");
      setIsModalOpen(true);
    }
  };

  const handleSetApiKey = (apiKey: string) => {
    setApiKey(apiKey);
    showToastMessage("✅ API Key guardada correctamente", "success");
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
        loading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onCopyLink={(text) => {
          copyToClipboard(text, setShowToast);
          showToastMessage("✅ Link copiado al portapapeles", "success");
        }}
      />

      <LinkModal
        isOpen={isModalOpen}
        mode={modalMode}
        formData={formData}
        isLoading={
          createLink.isPending || updateLink.isPending || deleteLink.isPending
        }
        onClose={() => {
          setIsModalOpen(false);
          setDeletingLink(null);
        }}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      {isModalApiKeyOpen && (
        <SetApiKey
          onSetApiKey={handleSetApiKey}
          onClose={() => setIsModalApiKeyOpen(false)}
        />
      )}

      <Toast show={showToast} message={toastMessage} type={toastType} />
    </div>
  );
}

export default App;
