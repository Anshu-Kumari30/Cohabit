import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-air shadow-air-lg p-6 w-full max-w-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#222222] mb-2">{title}</h3>
            <p className="text-[#717171] text-sm">{message}</p>
          </div>
          <button onClick={onClose} className="text-[#717171] hover:text-[#222222]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7F7F7] text-[#222222] rounded-pill hover:bg-gray-100 transition-colors font-semibold text-sm border border-[#DDDDDD]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-pill transition-colors font-semibold text-sm disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
