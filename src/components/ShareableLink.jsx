// src/components/ShareableLink.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';

const ShareableLink = ({ state, district, subdistrict, village, minimal = false }) => {
  const [copied, setCopied] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // Determine base path (internal route, app route, or main route)
  const getBasePath = () => {
    const p = window.location.pathname;
    if (p.includes('/internal/impact-assessment-v2')) {
      return '/internal/impact-assessment-v2';
    } else if (p.includes('/impact-assessment/app')) {
      return '/impact-assessment/app';
    } else {
      return '/impact-assessment';
    }
  };

  // Optionally check if this is a shared link and start timer (disabled in minimal mode)
  useEffect(() => {
    if (minimal) return;
    const isCurrentlySharedLink = window.location.search.includes('shared=true');
    setIsSharedLink(isCurrentlySharedLink);
    if (isCurrentlySharedLink) {
      const TIMER_DURATION = 30;
      setTimeRemaining(TIMER_DURATION);
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [minimal]);

  // Generate the shareable URL with the current selections
  const generateShareableLink = () => {
    const basePath = getBasePath();
    const url = new URL(window.location.origin + basePath);
    url.searchParams.set('shared', 'true');
    if (state) url.searchParams.set('state', state);
    if (district?.label) url.searchParams.set('district', district.label);
    if (subdistrict?.label) url.searchParams.set('subdistrict', subdistrict.label);
    if (village?.label) url.searchParams.set('village', village.label);
    return url.toString();
  };

  // Automatically update the URL when selections change (disabled in minimal mode)
  useEffect(() => {
    if (minimal) return;
    if (state && district?.label && subdistrict?.label && village?.label) {
      const newUrl = generateShareableLink();
      const newSearchParams = new URL(newUrl).searchParams.toString();
      const basePath = getBasePath();
      if (window.location.search.includes('shared=true')) {
        navigate(`${basePath}?${newSearchParams}`, { replace: true });
      }
    }
  }, [state, district, subdistrict, village, navigate, minimal]);

  // Copy link to clipboard
  const copyToClipboard = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      if (!minimal) {
        const currentParams = new URLSearchParams(window.location.search);
        const newParams = new URL(link).searchParams;
        const isSameParams =
          currentParams.get('shared') === 'true' &&
          currentParams.get('state') === newParams.get('state') &&
          currentParams.get('district') === newParams.get('district') &&
          currentParams.get('subdistrict') === newParams.get('subdistrict') &&
          currentParams.get('village') === newParams.get('village');
        if (!isSameParams) {
          const basePath = getBasePath();
          navigate(`${basePath}?${newParams.toString()}`, { replace: true });
        }
      }
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Always show the panel so users see how to share even before full selection

  return (
    <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
      {!minimal && (
        <h3 className="text-sm font-medium mb-2">{village?.label || village ? 'Share this Village view' : 'Select a Village to Share'}</h3>
      )}
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={generateShareableLink()}
          readOnly
          className="flex-grow min-w-0 truncate px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={copyToClipboard}
          aria-label="Copy shareable link"
          title={copied ? 'Copied!' : 'Copy link'}
          className={`shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-blue-700'}`}
        >
          {copied ? (
            <Check className="w-5 h-5 animate-bounce" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

ShareableLink.propTypes = {
  state: PropTypes.string,
  district: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  }),
  subdistrict: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  }),
  village: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })
};

export default ShareableLink;