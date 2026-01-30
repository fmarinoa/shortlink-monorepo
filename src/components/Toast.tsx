interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
}

export default function Toast({ show, message, type = "success" }: ToastProps) {
  if (!show) return null;

  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}
    >
      {message}
    </div>
  );
}
