# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please DO NOT create public GitHub issues for security vulnerabilities.**

### How to Report

1. **GitHub Security Advisory** (Preferred): Use [GitHub's private vulnerability reporting](../../security/advisories/new)
2. **Email**: If you cannot use GitHub advisories, create a private gist with details and reference it in a minimal issue

### What to Include

When reporting a vulnerability, please provide:

- **Description**: A clear description of the vulnerability
- **Impact**: Potential impact and severity assessment
- **Reproduction Steps**: Detailed steps to reproduce the issue
- **Affected Components**: Which parts of the system are affected (backend, frontend, SDK)
- **Suggested Fix**: If you have recommendations for fixing the issue (optional)

### Response Timeline

| Severity | Initial Response | Fix Timeline |
|----------|------------------|--------------|
| Critical | 24 hours | 7 days |
| High | 48 hours | 14 days |
| Medium | 72 hours | 30 days |
| Low | 1 week | 60 days |

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report
2. **Investigation**: We will investigate and validate the issue
3. **Updates**: We will keep you informed of our progress
4. **Credit**: We will credit you in the security advisory (unless you prefer anonymity)

---

## Security Best Practices

### For Operators / Self-Hosters

#### Before First Deployment

- [ ] Generate strong JWT secret: `openssl rand -base64 48`
- [ ] Set `ADMIN_SEED_PASSWORD` before running seed in production
- [ ] Change admin password after first login
- [ ] Configure `FRONTEND_URL` for proper CORS
- [ ] Enable HTTPS (required for production)

#### Ongoing Security

- [ ] Keep dependencies updated (`npm audit` regularly)
- [ ] Monitor audit logs for suspicious activity
- [ ] Set up IP whitelisting if applicable
- [ ] Configure rate limiting appropriately
- [ ] Schedule regular database backups
- [ ] Review enrolled devices periodically

### For Developers Using the SDK

- [ ] Never expose your KeyGuard API key in client-side code
- [ ] Use environment variables for all secrets
- [ ] Implement proper error handling (don't leak error details)
- [ ] Keep the SDK updated to the latest version

---

## Security Architecture

KeyGuard implements multiple layers of security:

### Layer 1: Device Binding
- ECDSA P-256 cryptographic key pair per device
- Private keys are non-extractable (WebCrypto API)
- Private key never leaves the device

### Layer 2: Request Signing
- Every request signed with device's private key
- Timestamp prevents replay attacks (5-minute window)
- Nonce ensures request uniqueness
- Body hash ensures request integrity

### Layer 3: Server Verification
- Signature verification before proxying requests
- Device status check (approved/suspended/revoked)
- Rate limiting per device

### Layer 4: API Protection
- JWT authentication for dashboard
- Role-based access control
- IP whitelisting support
- Comprehensive audit logging

---

## Known Security Considerations

### Default Credentials

The database seeder creates an admin user for initial setup. In development, this uses a default password if `ADMIN_SEED_PASSWORD` is not set. 

**In production:**
- The seeder will **fail** if `ADMIN_SEED_PASSWORD` is not set
- Always change the admin password after first login
- Consider disabling or removing the default admin after creating your own admin account

### API Key Storage

- External API keys (OpenAI, etc.) are encrypted with AES-256-GCM before storage
- Internal KeyGuard API keys are hashed with bcrypt
- Never log or expose full API key values

---

## Acknowledgments

We appreciate the security research community's efforts in improving KeyGuard's security. Contributors who responsibly disclose vulnerabilities will be acknowledged here (with permission).

<!-- Security acknowledgments will be listed here -->
