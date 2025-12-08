// Documentation Content and Code Snippets for Integration Guide

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
await client.enroll();`,
                filename: 'enroll.ts'
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient

client = KeyGuardClient(api_key='kg_prod_...')
client.enroll()`,
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
        content: `Sign your API requests with KeyGuard before sending. The SDK adds cryptographic signatures that prove the request came from an authorized device.`,
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify(data)
});

// Use the signed headers in your fetch call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});`,
                filename: 'sign.ts'
            },
            {
                language: 'python' as Language,
                code: `headers = client.sign_request(
    method='POST',
    url='https://api.openai.com/v1/chat/completions',
    body=json.dumps(data)
)

# Use the signed headers in your request
response = requests.post(
    'https://api.openai.com/v1/chat/completions',
    headers=headers,
    json=data
)`,
                filename: 'sign.py'
            },
            {
                language: 'curl' as Language,
                code: `# Sign a request using the KeyGuard API
curl -X POST https://api.keyguard.dev/v1/sign \\
  -H "Authorization: Bearer kg_prod_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "POST",
    "url": "https://api.openai.com/v1/chat/completions",
    "body": "{\\"model\\":\\"gpt-4\\",\\"messages\\":[...]}"
  }'`
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
        content: 'The KeyGuard client manages device enrollment, request signing, and key retrieval.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  projectId: 'your-project-id',  // Required
  apiKey: 'your-api-key',        // Required
  baseUrl: 'https://api.keyguard.dev',  // Optional
  storage: new MemoryStorage()   // Optional, defaults to browser localStorage
});`
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient

client = KeyGuardClient(
    project_id='your-project-id',  # Required
    api_key='your-api-key',        # Required
    base_url='https://api.keyguard.dev',  # Optional
    storage=MemoryStorage()  # Optional, defaults to file storage
)`
            }
        ]
    },
    {
        id: 'enroll-device',
        title: 'enroll(deviceName)',
        description: 'Enroll the current device for secure key access',
        content: 'This method generates a device fingerprint and registers it with KeyGuard. Only enrolled devices can access protected keys.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `// Returns: Promise<{ deviceId: string, publicKey: string }>
const result = await client.enroll('My-MacBook-Pro');

console.log('Device ID:', result.deviceId);
console.log('Public Key:', result.publicKey);`
            },
            {
                language: 'python' as Language,
                code: `# Returns: dict with deviceId and publicKey
result = client.enroll('My-MacBook-Pro')

print(f"Device ID: {result['deviceId']}")
print(f"Public Key: {result['publicKey']}")`
            }
        ]
    },
    {
        id: 'sign-request',
        title: 'signRequest(options)',
        description: 'Sign an API request with device-specific headers',
        content: 'Retrieves the appropriate API key and adds authentication headers to your request. The key itself is never exposed.',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `// Returns: Promise<Record<string, string>> (headers object)
const headers = await client.signRequest({
  url: 'https://api.openai.com/v1/chat/completions',
  method: 'POST',
  body: '{"model":"gpt-4","messages":[...]}'
});

// Headers will include:
// - Authorization: Bearer sk-...
// - X-KeyGuard-Signature: ...
// - X-KeyGuard-Device-ID: ...
// - X-KeyGuard-Timestamp: ...`
            },
            {
                language: 'python' as Language,
                code: `# Returns: dict with header key-value pairs
headers = client.sign_request(
    url='https://api.openai.com/v1/chat/completions',
    method='POST',
    body='{"model":"gpt-4","messages":[...]}'
)

# Headers will include:
# - Authorization: Bearer sk-...
# - X-KeyGuard-Signature: ...
# - X-KeyGuard-Device-ID: ...
# - X-KeyGuard-Timestamp: ...`
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
  projectId: process.env.KEYGUARD_PROJECT_ID!,
  apiKey: process.env.KEYGUARD_API_KEY!
});

async function chat(message: string) {
  const headers = await client.signRequest({
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }]
    })
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Usage
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
  projectId: process.env.KEYGUARD_PROJECT_ID!,
  apiKey: process.env.KEYGUARD_API_KEY!
});

async function generateText(prompt: string) {
  const headers = await client.signRequest({
    url: 'https://api.anthropic.com/v1/messages',
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}`,
                filename: 'anthropic-claude.ts'
            }
        ]
    }
];

// Note: mockApiResponses removed - API Playground now generates demo responses inline
