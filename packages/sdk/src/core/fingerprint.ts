/**
 * KeyGuard SDK - Device Fingerprinting
 * 
 * Professional device fingerprinting using FingerprintJS
 * Collects browser and device metadata for secure device identification
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Device fingerprint data structure
 */
export interface DeviceFingerprint {
  /**
   * Unique visitor ID (hash of device characteristics)
   */
  visitorId: string;

  /**
   * User-friendly device label (e.g., "Chrome on macOS")
   */
  label: string;

  /**
   * Raw fingerprint components for additional metadata
   */
  metadata: Record<string, unknown>;
}

/**
 * Get comprehensive device fingerprint using FingerprintJS
 * 
 * This function:
 * 1. Loads FingerprintJS library
 * 2. Collects device and browser characteristics
 * 3. Generates a unique visitor ID
 * 4. Creates a user-friendly label
 * 5. Returns fingerprint data with metadata
 * 
 * @returns Device fingerprint information
 * @throws Error if fingerprinting fails
 */
export async function getDeviceFingerprint(): Promise<DeviceFingerprint> {
  try {
    // Load FingerprintJS agent
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;

    // Get comprehensive fingerprint data
    const result = await fp.get();

    // Extract useful components for metadata (cast to any for flexibility)
    const components = result.components as any;
    
    // Create user-friendly label from browser and platform info
    const label = generateDeviceLabel(components);

    // Helper to safely extract component values
    const getValue = (component: any): unknown => {
      if (!component) return undefined;
      if (typeof component === 'object' && 'value' in component) {
        return component.value;
      }
      return undefined;
    };

    // Prepare metadata object with key device characteristics
    const metadata: Record<string, unknown> = {
      platform: getValue(components.platform),
      vendor: getValue(components.vendor),
      vendorFlavors: getValue(components.vendorFlavors),
      screenResolution: getValue(components.screenResolution),
      timezone: getValue(components.timezone),
      languages: getValue(components.languages),
      colorDepth: getValue(components.colorDepth),
      deviceMemory: getValue(components.deviceMemory),
      hardwareConcurrency: getValue(components.hardwareConcurrency),
      touchSupport: getValue(components.touchSupport),
    };

    return {
      visitorId: result.visitorId,
      label,
      metadata,
    };
  } catch (error) {
    throw new Error(
      `Device fingerprinting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate a user-friendly device label from fingerprint components
 * 
 * Creates labels like:
 * - "Chrome on Windows"
 * - "Safari on macOS"
 * - "Firefox on Linux"
 * 
 * @param components - FingerprintJS components
 * @returns User-friendly device label
 */
function generateDeviceLabel(components: any): string {
  // Helper to safely get component value
  const getValue = (component: any, fallback: any = ''): any => {
    if (!component) return fallback;
    if (typeof component === 'object' && 'value' in component) {
      return component.value ?? fallback;
    }
    return fallback;
  };

  // Extract browser name from vendor/vendorFlavors
  let browser = 'Unknown Browser';
  const vendor = String(getValue(components.vendor, ''));
  const vendorFlavors = getValue(components.vendorFlavors, []);
  
  if (vendor.includes('Google') || (Array.isArray(vendorFlavors) && vendorFlavors.includes('chrome'))) {
    browser = 'Chrome';
  } else if (vendor.includes('Apple') || (Array.isArray(vendorFlavors) && vendorFlavors.includes('safari'))) {
    browser = 'Safari';
  } else if (Array.isArray(vendorFlavors) && vendorFlavors.includes('firefox')) {
    browser = 'Firefox';
  } else if (Array.isArray(vendorFlavors) && vendorFlavors.includes('edge')) {
    browser = 'Edge';
  }

  // Extract OS/Platform
  let os = 'Unknown OS';
  const platform = String(getValue(components.platform, ''));
  
  if (platform.includes('Win')) {
    os = 'Windows';
  } else if (platform.includes('Mac')) {
    os = 'macOS';
  } else if (platform.includes('Linux')) {
    os = 'Linux';
  } else if (platform.includes('iPhone') || platform.includes('iPad')) {
    os = 'iOS';
  } else if (platform.includes('Android')) {
    os = 'Android';
  }

  // Fallback to user agent if platform detection fails
  if (os === 'Unknown OS' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';
  }

  return `${browser} on ${os}`;
}
