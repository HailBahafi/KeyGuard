/**
 * DTO for incoming proxy requests
 * Note: We use 'any' type for flexibility as this DTO
 * accepts dynamic OpenAI API request bodies
 */
export class ProxyRequestDto {
  model?: string;
  messages?: any;
  stream?: boolean;
  [key: string]: any; // Allow any additional properties
}

/**
 * Headers required for KeyGuard authentication
 */
export interface KeyGuardProxyHeaders {
  keyId: string;
  timestamp: string;
  nonce: string;
  bodySha256: string;
  algorithm: string;
  signature: string;
}
