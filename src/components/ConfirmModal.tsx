import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 sm:px-0">
      <div
        className={`relative max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl text-white space-y-6 ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600/10 to-red-800/10 blur-lg opacity-80 pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <div className="text-sm text-gray-400 leading-relaxed">{message}</div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-white/80 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
