import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceFingerprint {
  visitorId: string;
  label: string;
  metadata: Record<string, unknown>;
}

export async function getDeviceFingerprint(): Promise<DeviceFingerprint> {
  // 🟢 Robust Node.js / Server Check
  const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

  if (isNode || typeof window === 'undefined') {
    console.warn("⚠️ KeyGuard: Running in Node.js/Server environment - Using Mock Fingerprint");
    return {
      visitorId: 'node-test-device-' + Date.now(),
      label: 'Node.js Environment',
      metadata: {
        platform: 'Node.js',
        userAgent: 'Terminal',
        isServer: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();

    const components = result.components as any;
    const label = generateDeviceLabel(components);

    return {
      visitorId: result.visitorId,
      label,
      metadata: result.components || {}
    };
  } catch (error) {
    console.warn('KeyGuard: FingerprintJS failed, falling back.', error);
    return {
      visitorId: 'fallback-' + Date.now(),
      label: 'Unknown Device',
      metadata: { error: String(error) }
    };
  }
}

function generateDeviceLabel(components: any): string {
  // Helper to safely get component value
  const getValue = (component: any, fallback: any = ''): any => {
    if (!component) return fallback;
    if (typeof component === 'object' && 'value' in component) {
      return component.value ?? fallback;
    }
    return fallback;
  };

  let browser = 'Unknown Browser';
  const vendor = String(getValue(components.vendor, ''));
  const vendorFlavors = getValue(components.vendorFlavors, []);

  if (vendor.includes('Google') || (Array.isArray(vendorFlavors) && vendorFlavors.includes('chrome'))) browser = 'Chrome';
  else if (vendor.includes('Apple') || (Array.isArray(vendorFlavors) && vendorFlavors.includes('safari'))) browser = 'Safari';
  else if (Array.isArray(vendorFlavors) && vendorFlavors.includes('firefox')) browser = 'Firefox';

  let os = 'Unknown OS';
  const platform = String(getValue(components.platform, ''));
  if (platform.includes('Win')) os = 'Windows';
  else if (platform.includes('Mac')) os = 'macOS';
  else if (platform.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}