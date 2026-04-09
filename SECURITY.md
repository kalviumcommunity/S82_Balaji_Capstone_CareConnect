# 🛡️ CareConnect Security Guide

This document provides guidance on maintaining and enhancing the security of the CareConnect platform.

## 1. Web Application Firewall (WAF)
To protect against common web exploits (SQL injection, XSS, etc.) and DDoS attacks:
- **Cloudflare**: Connect your domain to Cloudflare.
- **Rules**: Enable the "WAF" features in the Cloudflare dashboard.
- **Benefit**: It acts as a shield, filtering malicious traffic before it even reaches your Express server.

## 2. Vulnerability Scanning
Regularly audit your application for security flaws:
- **npm audit**: Run `npm run security-check` (which executes `npm audit`) before every deployment.
- **Snyk**: Integrate Snyk with your GitHub repository to automatically detect vulnerable dependencies.
- **OWASP ZAP**: Use this tool periodically to perform "Dynamic Application Security Testing" (DAST) on your staging environment.

## 3. MongoDB Atlas Backups
Never lose your data:
- **Manual Backups**: Use `mongodump --uri="your_mongodb_uri"` to create a local backup.
- **Atlas Backups**: 
    1. Log in to MongoDB Atlas.
    2. Go to **Database** -> **Cluster** -> **Backup**.
    3. Enable **Cloud Backup** and set a retention policy (e.g., daily snapshots for 7 days).

## 4. Security Headers & File Security
The application uses **Helmet** to set secure HTTP headers and **Multer** for safe file handling.
- **CSP**: The Content Security Policy is configured in `app.js`. If you add new services, update the `connectSrc` and `scriptSrc`.
- **File Limit**: Strictly limited to **2MB**. Malicious types are rejected, and filenames are sanitized (alphanumeric only) before storage to prevent path traversal.

## 5. Ongoing Monitoring & Audit Trails
Check the server logs regularly for entries tagged with:
- `[SECURITY]`: Failed logins, MFA blocks (after 3 tries), or invalid tokens.
- `[ADMIN ACTION]`: Detailed audit trails of which doctor was verified or rejected and why.
- `[AUTH]`: Successful session starts.

---
*Stay secure, stay healthy.*
