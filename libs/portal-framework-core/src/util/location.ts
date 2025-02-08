export interface LocationLike {
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}

let currentLocation: LocationLike = window.location;

export function getCurrentLocation(): LocationLike {
  return currentLocation;
}

export function resetCurrentLocation(): void {
  currentLocation = window.location;
}

export function setCurrentLocation(location: Partial<LocationLike>) {
  currentLocation = {
    ...currentLocation,
    ...location,
  };

  // Skip history updates in test environment
  if (typeof process !== "undefined" && process.env.VITEST !== undefined) {
    return;
  }

  // Try to update browser history if we have a href and same origin
  if (location.href) {
    try {
      const url = new URL(location.href);
      if (url.origin === window.location.origin) {
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }
}
