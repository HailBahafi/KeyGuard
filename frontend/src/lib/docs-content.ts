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
        title: 'Install the SDK',
        description: 'Add KeyGuard to your project using your package manager',
        icon: 'Package',
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `npm install @keyguard/sdk

# or with yarn
yarn add @keyguard/sdk

# or with pnpm
pnpm add @keyguard/sdk`
            },
            {
                language: 'python' as Language,
                code: `pip install keyguard-sdk

# or with poetry
poetry add keyguard-sdk`
            },
            {
                language: 'go' as Language,
                code: `go get github.com/keyguard/sdk-go`
            }
        ]
    },
    {
        id: 'enroll',
        step: 2,
        title: 'Enroll Your Device',
        description: 'Bind your device to the API key for secure access',
        icon: 'Shield',
        content: `Device enrollment creates a unique fingerprint for your machine and securely binds it to your API keys. This ensures that only authorized devices can access your keys.`,
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key'
});

// Enroll this device
await client.enroll('My-MacBook-Pro');

console.log('Device enrolled successfully!');`,
                filename: 'enroll.ts'
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient

client = KeyGuardClient(
    project_id='your-project-id',
    api_key='your-api-key'
)

# Enroll this device
client.enroll('My-MacBook-Pro')

print('Device enrolled successfully!')`,
                filename: 'enroll.py'
            },
            {
                language: 'go' as Language,
                code: `package main

import (
    "fmt"
    "github.com/keyguard/sdk-go"
)

func main() {
    client := keyguard.NewClient(&keyguard.Config{
        ProjectID: "your-project-id",
        APIKey:    "your-api-key",
    })

    // Enroll this device
    err := client.Enroll("My-MacBook-Pro")
    if err != nil {
        panic(err)
    }

    fmt.Println("Device enrolled successfully!")
}`,
                filename: 'main.go'
            }
        ]
    },
    {
        id: 'sign',
        step: 3,
        title: 'Sign Your Requests',
        description: 'Use KeyGuard to securely sign and send API requests',
        icon: 'Key',
        content: `KeyGuard intercepts your API requests, retrieves the appropriate key, and signs the request with device-specific headers. Your raw keys never leave the vault.`,
        codeSnippets: [
            {
                language: 'typescript' as Language,
                code: `import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key'
});

// Sign a request to OpenAI
const headers = await client.signRequest({
  url: 'https://api.openai.com/v1/chat/completions',
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// Send the signed request
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,
                filename: 'sign.ts'
            },
            {
                language: 'python' as Language,
                code: `from keyguard import KeyGuardClient
import requests
import json

client = KeyGuardClient(
    project_id='your-project-id',
    api_key='your-api-key'
)

# Sign a request to OpenAI
headers = client.sign_request(
    url='https://api.openai.com/v1/chat/completions',
    method='POST',
    body=json.dumps({
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    })
)

# Send the signed request
response = requests.post(
    'https://api.openai.com/v1/chat/completions',
    headers=headers,
    json={
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`,
                filename: 'sign.py'
            },
            {
                language: 'go' as Language,
                code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "github.com/keyguard/sdk-go"
)

func main() {
    client := keyguard.NewClient(&keyguard.Config{
        ProjectID: "your-project-id",
        APIKey:    "your-api-key",
    })

    body := map[string]interface{}{
        "model": "gpt-4",
        "messages": []map[string]string{
            {"role": "user", "content": "Hello!"},
        },
    }
    bodyBytes, _ := json.Marshal(body)

    // Sign the request
    headers, err := client.SignRequest(&keyguard.Request{
        URL:    "https://api.openai.com/v1/chat/completions",
        Method: "POST",
        Body:   bodyBytes,
    })
    if err != nil {
        panic(err)
    }

    // Send the signed request
    req, _ := http.NewRequest("POST", 
        "https://api.openai.com/v1/chat/completions",
        bytes.NewBuffer(bodyBytes))
    
    for k, v := range headers {
        req.Header.Set(k, v)
    }

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    
    fmt.Println(result["choices"].([]interface{})[0].(map[string]interface{})["message"])
}`,
                filename: 'main.go'
            },
            {
                language: 'curl' as Language,
                code: `# First, get the signed headers from KeyGuard
curl -X POST https://api.keyguard.dev/v1/sign \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://api.openai.com/v1/chat/completions",
    "method": "POST",
    "body": "{\\"model\\":\\"gpt-4\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"Hello!\\"}]}"
  }'

# Response contains signed headers:
# {
#   "Authorization": "Bearer sk-...",
#   "X-KeyGuard-Signature": "...",
#   "X-KeyGuard-Device-ID": "..."
# }

# Use the signed headers in your request
curl -X POST https://api.openai.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-..." \\
  -H "X-KeyGuard-Signature: ..." \\
  -H "X-KeyGuard-Device-ID: ..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
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
