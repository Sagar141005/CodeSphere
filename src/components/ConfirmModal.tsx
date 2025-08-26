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
        className={`relative w-full max-w-sm sm:max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl text-white space-y-6 ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600/10 to-red-800/10 blur-lg opacity-80 pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center">
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          )}
          <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {message}
          </div>
        </div>

        {/* Buttons - stack on small screens */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 sm:px-5 py-2.5 text-sm font-medium text-white/80 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
