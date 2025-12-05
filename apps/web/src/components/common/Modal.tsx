import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  const typeColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-md w-full transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-4 ${typeColors[type]}`}>{title}</h3>
          <div className="text-gray-300 mb-6">
            {children}
          </div>
          <div className="flex justify-end gap-3">
            {onConfirm && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded font-bold text-white transition-colors ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
