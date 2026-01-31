import { useState } from "react";
import { setApiKey } from "./hooks/localStorage";
import { useLinkMutations, useLinks } from "./hooks/useLinks";
import type { LinkType } from "@shortlink/core";
import SetApiKey from "./components/SetApiKey";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import LinkTable from "./components/LinkTable";
import CreateEditModal from "./components/CreateEditModal";
import DeleteModal from "./components/DeleteModal";
import Toast from "./components/Toast";
import { copyToClipboard, getErrorMessage } from "./utils";

function App() {
  const { data: links, isLoading, isError, error } = useLinks();
  const { createLink, deleteLink, updateLink } = useLinkMutations();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingLink) {
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
        "Error al guardar el link",
      );
      showToastMessage(errorMessage, "error");
    }
  };

  const handleDelete = (slug: string) => {
    const linkToDelete = allLinks.find((link) => link.slug === slug);
    if (linkToDelete) {
      setDeletingLink(linkToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLink) return;

    try {
      await deleteLink.mutateAsync(deletingLink.slug);
      showToastMessage("✅ Link eliminado correctamente", "success");
      setIsDeleteModalOpen(false);
      setDeletingLink(null);
    } catch (err: unknown) {
      console.error("Error deleting link", err);
      const errorMessage = getErrorMessage(
        err as { response?: { status: number } },
        "Error al eliminar el link",
      );
      showToastMessage(errorMessage, "error");
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

      <CreateEditModal
        isOpen={isModalOpen}
        editingLink={editingLink}
        formData={formData}
        isLoading={createLink.isPending || updateLink.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        formData={
          deletingLink
            ? { slug: deletingLink.slug, url: deletingLink.url }
            : { slug: "", url: "" }
        }
        isLoading={deleteLink.isPending}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLink(null);
        }}
        onDelete={handleConfirmDelete}
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
