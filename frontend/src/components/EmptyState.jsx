import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="badge-air mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[#222222] mb-2">{title}</h3>
      {description && <p className="text-[#717171] text-sm mb-6 text-center max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
