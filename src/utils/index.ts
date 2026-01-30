import type { ErrorType } from "../types/Link";

export const copyToClipboard = (
  text: string,
  setShowToast: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  navigator.clipboard.writeText(text);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2000);
};

export const getErrorMessage = (
  error: ErrorType,
  defaultMessage: string,
): string => {
  const status = error.response?.status;

  switch (status) {
    case 400:
      return "Datos inválidos. Verifica la información ingresada";
    case 401:
      return "No autorizado. Verifica tu API Key";
    case 403:
      return "No tienes permiso para realizar esta acción";
    case 404:
      return "El recurso no fue encontrado";
    case 409:
      return "Este slug ya existe. Elige otro nombre";
    case 500:
      return "Error del servidor. Intenta nuevamente";
    default:
      return defaultMessage;
  }
};
