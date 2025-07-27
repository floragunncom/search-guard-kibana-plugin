export class WatchBatchManager {
  constructor(watchService, debounceMs = 200) {
    this.watchService = watchService;
    this.debounceMs = debounceMs;

    // Map of watchId -> Array of {resolve, reject} functions
    this.pendingRequests = new Map();

    // Timer for debouncing
    this.debounceTimer = null;

    // Adaptive size - starts at 500, increases to 1000 if watches are missing
    this.currentSize = 500;
  }

  /**
   * Request watch data for a specific watch ID
   * Returns a Promise that resolves with the watch data
   */
  requestWatch(watchId) {
    return new Promise((resolve, reject) => {
      // Add this request to pending requests
      if (!this.pendingRequests.has(watchId)) {
        this.pendingRequests.set(watchId, []);
      }
      this.pendingRequests.get(watchId).push({ resolve, reject });

      // Reset the debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.sendBatchRequest();
      }, this.debounceMs);
    });
  }

  /**
   * Send the batch request and resolve all pending promises
   */
  async sendBatchRequest() {
    this.debounceTimer = null;

    const watchIds = Array.from(this.pendingRequests.keys());
    if (watchIds.length === 0) return;

    // Store and clear pending requests
    const currentRequests = new Map(this.pendingRequests);
    this.pendingRequests.clear();

    try {
      // Call summary without watch IDs to get all watches
      // This way we get everything in one request and each panel can find its specific watch
      //
      // TODO: To restore filtering when backend supports it, replace the line below with:
      // const allWatchesResponse = await this.watchService.batchSummary(watchIds);
      // OR: const allWatchesResponse = await this.watchService.summary({ watch_id: watchIds });
      const allWatchesResponse = await this.watchService.summary({size: this.currentSize});

      // Track which watch IDs were requested vs which were returned
      const requestedWatchIds = new Set(watchIds.map(id => id.toLowerCase()));
      const returnedWatches = allWatchesResponse.resp?.data?.watches || [];
      const returnedWatchIds = new Set(returnedWatches.map(watch => watch.watch_id?.toLowerCase()));

      // Find missing watch IDs (case-insensitive comparison)
      const missingWatchIds = watchIds.filter(id => !returnedWatchIds.has(id.toLowerCase()));

      // If any watches are missing, increase size for next request
      if (missingWatchIds.length > 0 && this.currentSize < 1000) {
        console.log(`WatchBatchManager: ${missingWatchIds.length} watches missing, increasing size from ${this.currentSize} to 1000 for next request`);
        this.currentSize = 1000;
      }

      const extraWatchIds = Array.from(returnedWatches
        .map(watch => watch.watch_id)
        .filter(id => id && !requestedWatchIds.has(id.toLowerCase())));

      // Log the tracking info
      if (missingWatchIds.length > 0) {
        console.debug(`WatchBatchManager: Missing requested watches:`, missingWatchIds);
      }

      // Return the same response to all callers
      for (const [, requesters] of currentRequests) {
        requesters.forEach(({ resolve }) => resolve(allWatchesResponse));
      }

    } catch (error) {
      // Reject all pending requests on error
      for (const [, requesters] of currentRequests) {
        requesters.forEach(({ reject }) => reject(error));
      }
    }
  }

  /**
   * Cleanup - cancel pending timer and reject pending requests
   */
  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    for (const [, requesters] of this.pendingRequests) {
      const error = new Error('WatchBatchManager destroyed');
      requesters.forEach(({ reject }) => reject(error));
    }

    this.pendingRequests.clear();
  }
}
