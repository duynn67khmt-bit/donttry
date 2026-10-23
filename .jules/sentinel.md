## 2023-10-13 - HTML Escaping User Input in Transaction Histories
**Vulnerability:** Unescaped strings (`dep.method`, `dep.time`, `dep.status`, `w.bank`, `w.time`, `w.status`) interpolated directly into `innerHTML` strings when rendering deposit and withdrawal transaction histories.
**Learning:** Vanilla JS applications rendering dynamic objects with `innerHTML` template strings are prone to XSS if string properties contain user input or unsanitized data.
**Prevention:** Always sanitize/escape dynamic HTML strings using an `escapeHtml` utility method or construct DOM nodes using textContent when building UI elements.

## 2023-10-14 - Masking Credit Card Numbers in Local Storage
**Vulnerability:** Plaintext credit card Primary Account Numbers (PANs) stored in browser `localStorage` and pre-filled into input fields.
**Learning:** Storing full card numbers in client-side storage exposes sensitive payment card data to XSS attacks and shoulder surfing.
**Prevention:** Always mask sensitive payment data (e.g. keeping only last 4 digits) before persisting in `localStorage` or displaying on UI card previews, and keep input fields unpopulated.

## 2024-05-20 - Plaintext Password Storage in Local Storage
**Vulnerability:** User account passwords were stored in plaintext inside browser `localStorage` (`tx_users`).
**Learning:** Storing unhashed user passwords in client-side storage or databases allows malicious scripts (XSS) or anyone with device access to inspect and harvest credentials.
**Prevention:** Always hash passwords before persisting them (e.g., using Web Crypto API SHA-256 for client storage or strong password hashing algorithms like bcrypt on backends).
