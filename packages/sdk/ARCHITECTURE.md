# KeyGuard SDK Architecture Reference

## Goal

Build a secure, lightweight TypeScript SDK for "Device Binding" to secure LLM API keys.

## Technical Constraints & Decisions

1. **Cryptography:** - MUST use **ECDSA P-256** (secp256r1).
   - MUST use native `window.crypto.subtle` in browsers.
   - Private keys MUST be non-extractable (`extractable: false`).
2. **Storage:**
   - **Browser:** `IndexedDB` (using `idb-keyval`) to store `CryptoKey` objects directly.
   - **Node.js:** System Keychain (using `keytar`) - _Phase 2_.
3. **Build System:**
   - Tool: `tsup`.
   - Formats: ESM (EcmaScript Modules) + CJS (CommonJS) + DTS (Type Definitions).
4. **Code Style:**
   - Strict TypeScript.
   - No unnecessary dependencies.
