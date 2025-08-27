import { Share2 } from 'lucide-react';

const IconButtonShare = ({ onClick }) => {
  return (
    <button
      type="button"
      aria-label="Share village view"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-success hover:text-white transition-colors p-0 leading-none shadow-sm focus:outline-none focus:ring-2 focus:ring-success/50"
      onClick={onClick}
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
};

export default IconButtonShare;


