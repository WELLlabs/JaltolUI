import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, frameless = false }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      {frameless ? (
        <div className="relative z-10 w-[min(95vw,640px)] max-w-full p-4" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      ) : (
        <div
          className="relative z-10 w-[min(95vw,640px)] max-w-full rounded-lg bg-white shadow-lg border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {title ? (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
          ) : null}
          <div className="px-4 py-4">{children}</div>
        </div>
      )}
    </div>
  );
};

export default Modal;


