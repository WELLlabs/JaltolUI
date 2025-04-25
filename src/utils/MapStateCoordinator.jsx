// src/utils/MapStateCoordinator.js
import L from 'leaflet';

class MapStateCoordinator {
    constructor() {
      this.isSharedLink = false;
      this.zoomLocked = false;
      this.pendingApiCalls = [];
      this.villageZoomComplete = false;
      this.mapRef = null;
      this.villageBounds = null;
      this.initComplete = false;
      this.reset();
    }
    
    reset() {
      // Call this method when switching from shared link mode to normal mode
      if (!window.location.search.includes('shared=true')) {
        console.log('Resetting MapStateCoordinator to normal mode');
        this.zoomLocked = false;
        this.villageZoomComplete = false;
        this.pendingApiCalls = [];
        
        // Clear session storage if we're not in shared link mode
        if (sessionStorage.getItem('zoomLocked') === 'true') {
          sessionStorage.removeItem('zoomLocked');
          sessionStorage.removeItem('villageBounds');
        }
        
        // Reset map constraints if we have a map reference
        if (this.mapRef) {
          try {
            this.mapRef.setMinZoom(1);  // Reset to default min zoom
            this.mapRef.setMaxBounds(null);  // Remove bounds restriction
            this.mapRef.options.maxBoundsViscosity = 0;  // Disable viscosity
          } catch (e) {
            console.error('Error resetting map constraints:', e);
          }
        }
      }
    }
  
    init(mapRef) {
      // Update isSharedLink status first
      this.isSharedLink = window.location.search.includes('shared=true');
      
      // If not in shared link mode, just store the map reference without any locking
      if (!this.isSharedLink) {
        this.mapRef = mapRef;
        this.reset();
        console.log('MapStateCoordinator initialized in normal mode');
        return this;
      }
      
      // Prevent re-initialization with different map instances in shared link mode
      if (this.mapRef && this.mapRef !== mapRef && this.initComplete) {
        console.log('Map already initialized with a different instance');
        return this;
      }
      
      this.mapRef = mapRef;
      
      console.log(`MapStateCoordinator initializing with map:`, mapRef ? 'provided' : 'null');
      
      // Try to restore state from session storage
      if (this.isSharedLink) {
        const boundsStr = sessionStorage.getItem('villageBounds');
        const zoomLocked = sessionStorage.getItem('zoomLocked') === 'true';
        
        console.log(`Shared link detected, bounds stored: ${!!boundsStr}, zoom locked: ${zoomLocked}`);
        
        if (boundsStr && mapRef) {
          try {
            const boundsData = JSON.parse(boundsStr);
            this.villageBounds = L.latLngBounds(
              [boundsData.south, boundsData.west],
              [boundsData.north, boundsData.east]
            );
            this.villageZoomComplete = true;
            
            if (zoomLocked) {
              this.zoomLocked = true;
              console.log('Restored zoom lock state from storage');
            }
          } catch (e) {
            console.error('Error restoring bounds:', e);
          }
        }
      }
      
      this.initComplete = true;
      console.log(`MapStateCoordinator initialized: shared=${this.isSharedLink}, zoomLocked=${this.zoomLocked}`);
      return this;
    }
    
    lockZoom(bounds) {
      // Only lock zoom in shared link mode
      if (!this.isSharedLink) {
        console.log('Not in shared link mode, skipping zoom lock');
        return false;
      }
      
      if (!this.mapRef) {
        console.warn('Cannot lock zoom: map reference is null');
        return false;
      }
      
      console.log('Locking zoom to village bounds');
      this.zoomLocked = true;
      this.villageBounds = bounds;
      
      // Store bounds in session storage for persistence across refreshes
      try {
        sessionStorage.setItem('villageBounds', JSON.stringify({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }));
        sessionStorage.setItem('zoomLocked', 'true');
        console.log('Saved bounds to session storage');
      } catch (e) {
        console.error('Error storing bounds:', e);
      }
      
      // Apply strict map constraints
      try {
        this.mapRef.setMinZoom(12);
        this.mapRef.setMaxBounds(bounds.pad(0.5));
        this.mapRef.options.maxBoundsViscosity = 1.0;
        console.log('Applied map constraints');
      } catch (e) {
        console.error('Error applying map constraints:', e);
        return false;
      }
      
      return true;
    }
    
    enforceZoom() {
      // Only enforce zoom in shared link mode
      if (!this.isSharedLink) return;
      
      if (!this.mapRef || !this.villageBounds || !this.zoomLocked) {
        console.warn('Cannot enforce zoom:', {
          hasMap: !!this.mapRef,
          hasBounds: !!this.villageBounds,
          isLocked: this.zoomLocked
        });
        return;
      }
      
      console.log('Enforcing zoom lock');
      try {
        this.mapRef.panInsideBounds(this.villageBounds, {
          animate: true,
          duration: 0.3
        });
      } catch (e) {
        console.error('Error enforcing zoom:', e);
      }
    }
    
    registerApiCall(id, priority = 0) {
      // Only register API calls in shared link mode
      if (!this.isSharedLink) return 'no-shared-link';
      
      const callId = `${id}-${Date.now()}`;
      console.log(`Registered API call: ${callId} with priority ${priority}`);
      this.pendingApiCalls.push({ id: callId, priority, time: Date.now() });
      return callId;
    }
    
    completeApiCall(id) {
      // Skip for non-shared link mode
      if (!this.isSharedLink || id === 'no-shared-link') return;
      
      console.log(`Completing API call: ${id}`);
      this.pendingApiCalls = this.pendingApiCalls.filter(call => call.id !== id);
      
      if (this.zoomLocked && this.mapRef && this.villageBounds) {
        // Immediately enforce zoom after an API call completes
        console.log('API call complete, enforcing zoom');
        setTimeout(() => this.enforceZoom(), 100);
      }
    }
    
    shouldSkipZoomReset() {
      // Only skip zoom reset in shared link mode
      if (!this.isSharedLink) return false;
      
      const shouldSkip = this.isSharedLink && this.zoomLocked;
      console.log(`Should skip zoom reset? ${shouldSkip}`);
      return shouldSkip;
    }
  }
  
  // Export a singleton instance
  export const mapCoordinator = new MapStateCoordinator();