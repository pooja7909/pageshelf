# Security Specification & Test Plan

## 1. Data Invariants
- `categories`: Must have a valid document ID, non-empty `name` (max 100 characters), optional `parent` reference, numeric `order`, boolean `visibleToStudents`.
- `links`: Must have a valid document ID, valid `title` (max 200 characters), valid `type` (`link` or `file`), valid URL string, optional category string, optional `fileName`, optional `fileData` (max 1MB payload), optional boolean `visibleToStudents`.
- `config`: Restricted document ID, max 100 characters for `shelfTitle`, max 500 for `shelfDescription`, max 128 for passcode hash.

## 2. Dirty Dozen Invalidation Payloads
1. Category with missing name: `{ parent: "" }` -> REJECTED
2. Category with empty name: `{ name: "" }` -> REJECTED
3. Category with 500-char name: `{ name: "..." * 500 }` -> REJECTED
4. Category with non-boolean `visibleToStudents`: `{ name: "Test", visibleToStudents: "yes" }` -> REJECTED
5. Link with missing type: `{ title: "Test" }` -> REJECTED
6. Link with invalid type: `{ title: "Test", type: "executable" }` -> REJECTED
7. Link with 3000-char URL: `{ title: "Test", type: "link", url: "https://..." * 3000 }` -> REJECTED
8. Link with oversized fileData (> 1MB): `{ title: "F", type: "file", fileData: "..." }` -> REJECTED
9. Random document in undisclosed collection `/secrets/pass`: -> REJECTED (default deny catch-all)
10. Link with non-string note: `{ title: "Test", type: "link", note: 12345 }` -> REJECTED
11. Category deletion with illegal characters in ID: `/categories/$$invalid%%` -> REJECTED
12. Config deletion: `DELETE /config/settings` -> REJECTED
