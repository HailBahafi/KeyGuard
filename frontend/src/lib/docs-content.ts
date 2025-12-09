// Documentation Content and Code Snippets for Integration Guide
// VERIFIED against packages/sdk and apps/backend on 2024-12-09

export type Language = 'typescript' | 'python' | 'go' | 'curl';

export interface CodeSnippet {
    language: Language;
    code: string;
    filename?: string;
}

export interface DocSection {
    id: string;
    title: string;
    description: string;
    content?: string;
    codeSnippets?: CodeSnippet[];
}

// Quick Start Documentation
export const quickStartSteps = [
    {
        id: 'install',
        step: 1,
        title: 'Install',
        description: 'Add the KeyGuard SDK to your project',
        icon: 'Terminal',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `npm install @keyguard/sdk`
            },
            {
                language: 'python' as Language,
                code: `pip install keyguard-sdk`
            },
            {
                language: 'curl' as Language,
                code: `# No installation needed for cURL - use the REST API directly`
            }
        ]
    },
    {
        id: 'enroll',
        step: 2,
        title: 'Initialize & Enroll',
        description: 'Register the device one-time',
        icon: 'Shield',
        content: `Device enrollment generates a cryptographic keypair and registers your device with KeyGuard. This only needs to be done once per device.`,
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({ apiKey: 'kg_prod_...' });

// Enroll with optional device name
const enrollment = await client.enroll('My-MacBook-Pro');
console.log('Key ID:', enrollment.keyId);`,
                filename: 'enroll.ts'
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient

client = KeyGuardClient(api_key='kg_prod_...')

# Enroll with optional device name
enrollment = client.enroll('My-MacBook-Pro')
print(f"Key ID: {enrollment['keyId']}")`,
                filename: 'enroll.py'
            },
            {
                language: 'curl' as Language,
                code: `# Enrollment is handled automatically by the SDK
# For manual enrollment, generate a keypair and POST to /api/v1/devices/enroll`
            }
        ]
    },
    {
        id: 'sign',
        step: 3,
        title: 'Sign Requests',
        description: 'Intercept requests before sending',
        icon: 'Key',
        content: `Sign your API requests with KeyGuard before sending. The SDK adds cryptographic signature headers. Send to the KeyGuard proxy which verifies signatures and injects the protected API key.`,
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `// 1. Sign the request - generates x-keyguard-* headers
const signedHeaders = await client.signRequest({
  method: 'POST',
  url: '/api/v1/proxy/v1/chat/completions',  // OpenAI path after /proxy
  body: JSON.stringify(data)
});

// 2. Send to KeyGuard proxy (appends OpenAI path to /proxy)
const response = await fetch('https://your-keyguard-server/api/v1/proxy/v1/chat/completions', {
  method: 'POST',
  headers: {
    ...signedHeaders,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});`,
                filename: 'sign.ts'
            },
            {
                language: 'python' as Language,
                code: `# 1. Sign the request - generates x-keyguard-* headers
signed_headers = client.sign_request(
    method='POST',
    url='/api/v1/proxy/v1/chat/completions',
    body=json.dumps(data)
)

# 2. Send to KeyGuard proxy (appends OpenAI path to /proxy)
response = requests.post(
    'https://your-keyguard-server/api/v1/proxy/v1/chat/completions',
    headers={**signed_headers, 'Content-Type': 'application/json'},
    json=data
)`,
                filename: 'sign.py'
            },
            {
                language: 'curl' as Language,
                code: `# Send signed request to KeyGuard proxy
# The OpenAI endpoint path is appended after /proxy
curl -X POST https://your-keyguard-server/api/v1/proxy/v1/chat/completions \\
  -H "x-keyguard-api-key: kg_prod_..." \\
  -H "x-keyguard-key-id: <your-key-id>" \\
  -H "x-keyguard-timestamp: <iso-timestamp>" \\
  -H "x-keyguard-nonce: <unique-nonce>" \\
  -H "x-keyguard-body-sha256: <body-hash>" \\
  -H "x-keyguard-alg: ECDSA_P256_SHA256_P1363" \\
  -H "x-keyguard-signature: <signature>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4","messages":[...]}'`
            }
        ]
    }
];

// SDK Reference
export const sdkReference: DocSection[] = [
    {
        id: 'client-initialization',
        title: 'Client Initialization',
        description: 'Create a new KeyGuard client instance',
        content: 'The KeyGuard client manages device enrollment, request signing, and cryptographic operations.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_...',           // Required - Your KeyGuard API key
  apiBaseUrl: 'https://...',       // Optional - Only for self-hosted instances
  storage: new MemoryStorage()     // Optional - Defaults to browser IndexedDB
});`
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient

client = KeyGuardClient(
    api_key='kg_prod_...',           # Required - Your KeyGuard API key
    api_base_url='https://...',      # Optional - Only for self-hosted instances
    storage=MemoryStorage()          # Optional - Defaults to file storage
)`
            }
        ]
    },
    {
        id: 'enroll-device',
        title: 'enroll(deviceName?)',
        description: 'Enroll the current device for secure key access',
        content: 'This method generates a device fingerprint, creates an ECDSA P-256 keypair, and returns an enrollment payload to register with KeyGuard. Only enrolled devices can sign requests.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `// Returns: Promise<EnrollmentPayload>
// EnrollmentPayload = { keyId, publicKey, deviceFingerprint, label, userAgent?, metadata? }

const enrollment = await client.enroll('My-MacBook-Pro');

console.log('Key ID:', enrollment.keyId);           // Unique key identifier
console.log('Public Key:', enrollment.publicKey);   // Base64 SPKI format
console.log('Fingerprint:', enrollment.deviceFingerprint);
console.log('Label:', enrollment.label);            // Device name or auto-generated`
            },
            {
                language: 'python' as Language,
                code: `# Returns: dict with keyId, publicKey, deviceFingerprint, label

enrollment = client.enroll('My-MacBook-Pro')

print(f"Key ID: {enrollment['keyId']}")
print(f"Public Key: {enrollment['publicKey']}")
print(f"Fingerprint: {enrollment['deviceFingerprint']}")
print(f"Label: {enrollment['label']}")`
            }
        ]
    },
    {
        id: 'sign-request',
        title: 'signRequest(options)',
        description: 'Sign an API request with device-specific cryptographic headers',
        content: 'Creates cryptographic signature headers for request verification. The KeyGuard proxy validates these signatures and injects the protected provider API key before forwarding to OpenAI/Anthropic.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `// Returns: Promise<SignedRequestHeaders>
const headers = await client.signRequest({
  url: '/api/v1/proxy/v1/chat/completions',
  method: 'POST',
  body: '{"model":"gpt-4","messages":[...]}'
});

// Returns these headers (all required by KeyGuard proxy):
// x-keyguard-api-key      - Your KeyGuard project API key
// x-keyguard-key-id       - Device's enrolled key identifier
// x-keyguard-timestamp    - ISO 8601 timestamp
// x-keyguard-nonce        - Unique request nonce (replay protection)
// x-keyguard-body-sha256  - SHA-256 hash of request body
// x-keyguard-alg          - Algorithm: "ECDSA_P256_SHA256_P1363"
// x-keyguard-signature    - Base64 ECDSA signature`
            },
            {
                language: 'python' as Language,
                code: `# Returns: dict with x-keyguard-* header key-value pairs
headers = client.sign_request(
    url='/api/v1/proxy/v1/chat/completions',
    method='POST',
    body='{"model":"gpt-4","messages":[...]}'
)

# Returns these headers (all required by KeyGuard proxy):
# x-keyguard-api-key      - Your KeyGuard project API key
# x-keyguard-key-id       - Device's enrolled key identifier
# x-keyguard-timestamp    - ISO 8601 timestamp
# x-keyguard-nonce        - Unique request nonce (replay protection)
# x-keyguard-body-sha256  - SHA-256 hash of request body
# x-keyguard-alg          - Algorithm used
# x-keyguard-signature    - Base64 ECDSA signature`
            }
        ]
    }
];

// Real-World Examples
export const examples: DocSection[] = [
    {
        id: 'openai-example',
        title: 'OpenAI Chat Completion',
        description: 'Secure your OpenAI API calls with KeyGuard',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: process.env.KEYGUARD_API_KEY!
});

async function chat(message: string) {
  const body = JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }]
  });

  // Sign the request
  const signedHeaders = await client.signRequest({
    url: '/api/v1/proxy/v1/chat/completions',
    method: 'POST',
    body
  });

  // Send to KeyGuard proxy - OpenAI path is appended after /proxy
  const response = await fetch(
    \`\${process.env.KEYGUARD_SERVER_URL}/api/v1/proxy/v1/chat/completions\`,
    {
      method: 'POST',
      headers: { ...signedHeaders, 'Content-Type': 'application/json' },
      body
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}

const reply = await chat('What is the capital of France?');
console.log(reply);`,
                filename: 'openai-chat.ts'
            }
        ]
    },
    {
        id: 'anthropic-example',
        title: 'Anthropic Claude',
        description: 'Protect your Anthropic API keys',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: process.env.KEYGUARD_API_KEY!
});

async function generateText(prompt: string) {
  const body = JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  // Sign the request
  const signedHeaders = await client.signRequest({
    url: '/api/v1/proxy/v1/messages',  // Anthropic endpoint
    method: 'POST',
    body
  });

  // Send to KeyGuard proxy - Anthropic path after /proxy
  const response = await fetch(
    \`\${process.env.KEYGUARD_SERVER_URL}/api/v1/proxy/v1/messages\`,
    {
      method: 'POST',
      headers: { ...signedHeaders, 'Content-Type': 'application/json' },
      body
    }
  );

  const data = await response.json();
  return data.content[0].text;
}`,
                filename: 'anthropic-claude.ts'
            }
        ]
    }
];

// Note: Backend proxy uses URL-path routing: /api/v1/proxy/{openai-endpoint}
// The OpenAI/Anthropic endpoint is appended to the proxy URL, NOT passed in body
