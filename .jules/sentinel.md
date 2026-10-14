## 2023-10-13 - HTML Escaping User Input in Transaction Histories
**Vulnerability:** Unescaped strings (`dep.method`, `dep.time`, `dep.status`, `w.bank`, `w.time`, `w.status`) interpolated directly into `innerHTML` strings when rendering deposit and withdrawal transaction histories.
**Learning:** Vanilla JS applications rendering dynamic objects with `innerHTML` template strings are prone to XSS if string properties contain user input or unsanitized data.
**Prevention:** Always sanitize/escape dynamic HTML strings using an `escapeHtml` utility method or construct DOM nodes using textContent when building UI elements.
