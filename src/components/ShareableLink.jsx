// src/components/ShareableLink.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const ShareableLink = ({ state, district, subdistrict, village }) => {
  const [copied, setCopied] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // Check if this is a shared link and start timer
  useEffect(() => {
    const isCurrentlySharedLink = window.location.search.includes('shared=true');
    setIsSharedLink(isCurrentlySharedLink);
    
    // Start a timer for shared links
    if (isCurrentlySharedLink) {
      const TIMER_DURATION = 30; // 30 seconds timer
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
  }, []);

  // Generate the shareable URL with the current selections
  const generateShareableLink = () => {
    // Create a new URL based on current location
    const url = new URL(window.location.origin + '/impact-assessment');
    
    // Set shared parameter first
    url.searchParams.set('shared', 'true');
    
    // Add all selected values if they exist
    if (state) url.searchParams.set('state', state);
    if (district?.label) url.searchParams.set('district', district.label);
    if (subdistrict?.label) url.searchParams.set('subdistrict', subdistrict.label);
    if (village?.label) url.searchParams.set('village', village.label);
    
    return url.toString();
  };

  // Automatically update the URL when selections change
  useEffect(() => {
    if (state && district?.label && subdistrict?.label && village?.label) {
      // Only update if we have all four selections to avoid partial URLs
      const newUrl = generateShareableLink();
      const newSearchParams = new URL(newUrl).searchParams.toString();
      
      // Only update if this is already a shared link
      if (window.location.search.includes('shared=true')) {
        navigate(`/impact-assessment?${newSearchParams}`, { replace: true });
      }
    }
  }, [state, district, subdistrict, village, navigate]);

  // Copy link to clipboard
  const copyToClipboard = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      
      // Only update URL if not already in shared mode with the same parameters
      const currentParams = new URLSearchParams(window.location.search);
      const newParams = new URL(link).searchParams;
      
      // Check if the current URL is already a shared link with the same parameters
      const isSameParams = 
        currentParams.get('shared') === 'true' &&
        currentParams.get('state') === newParams.get('state') &&
        currentParams.get('district') === newParams.get('district') &&
        currentParams.get('subdistrict') === newParams.get('subdistrict') &&
        currentParams.get('village') === newParams.get('village');
      
      // Only update if different to avoid triggering a reload
      if (!isSameParams) {
        navigate(`/impact-assessment?${newParams.toString()}`, { replace: true });
      }
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Only show the component if at least one selection has been made
  if (!state && !district && !subdistrict && !village) {
    return null;
  }

  return (
    <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
      {isSharedLink && timeRemaining > 0 ? (
        // When in shared mode, show the timer first
        <>
          <div className="bg-blue-100 p-2 mb-2 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Shared view mode</span> - Map will be locked to this village
              </p>
              <p className="text-xs text-gray-600 ml-2">
                {timeRemaining}s
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(timeRemaining / 30) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-2">
            Share this exact map view with others.
          </p>
        </>
      ) : (
        // When not in shared mode, show the title first
        <h3 className="text-sm font-medium mb-2">Share this selection</h3>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={generateShareableLink()}
          readOnly
          className="flex-grow px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors whitespace-nowrap"
        >
          {copied ? 'Copied!' : 'Copy link'}
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