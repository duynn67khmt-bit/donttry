## 2023-10-13 - HTML Escaping User Input in Transaction Histories
**Vulnerability:** Unescaped strings (`dep.method`, `dep.time`, `dep.status`, `w.bank`, `w.time`, `w.status`) interpolated directly into `innerHTML` strings when rendering deposit and withdrawal transaction histories.
**Learning:** Vanilla JS applications rendering dynamic objects with `innerHTML` template strings are prone to XSS if string properties contain user input or unsanitized data.
**Prevention:** Always sanitize/escape dynamic HTML strings using an `escapeHtml` utility method or construct DOM nodes using textContent when building UI elements.

## 2023-10-14 - Masking Credit Card Numbers in Local Storage
**Vulnerability:** Plaintext credit card Primary Account Numbers (PANs) stored in browser `localStorage` and pre-filled into input fields.
**Learning:** Storing full card numbers in client-side storage exposes sensitive payment card data to XSS attacks and shoulder surfing.
**Prevention:** Always mask sensitive payment data (e.g. keeping only last 4 digits) before persisting in `localStorage` or displaying on UI card previews, and keep input fields unpopulated.

## 2023-10-15 - Masking Bank and Withdrawal Account Numbers in Local Storage
**Vulnerability:** Plaintext bank account and phone numbers stored in browser `localStorage` under `lastWithdrawAccount` and `withdrawals`, and pre-filled into withdrawal input fields.
**Learning:** Persisting unmasked financial account identifiers in client-side storage increases exposure to credential theft via client-side injection attacks and shoulder surfing.
**Prevention:** Mask sensitive account numbers (retaining only the last 4 digits) before writing to `localStorage` or transaction history, and avoid autofilling sensitive account inputs.
