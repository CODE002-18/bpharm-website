# BPharmHub Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Public Catalog Readability & Admin-Only Mutation**: `subjects`, `resources`, and `blogs` are public educational catalog collections readable by students (`get`, `list`), but `create`, `update`, and `delete` are strictly restricted to verified admins (`isAdmin()`).
2. **Bootstrapped & Trusted Admin Verification**: Admin status requires `isSignedIn()`, `request.auth.token.email_verified == true`, and either `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or the verified runtime owner email (`shadowxmonarc@gmail.com`).
3. **Strict User Bookmark Isolation (Master Gate & Query Enforcer)**: Bookmarks live at `/users/{userId}/bookmarks/{bookmarkId}`. Only the authenticated owner (`request.auth.uid == userId`) can read or write their bookmarks, and `incoming().userId == request.auth.uid` is enforced on every write.
4. **Strict Key & Size Boundaries**: Every string field enforces `.size() <= MAX` matching `firebase-blueprint.json` to prevent Denial-of-Wallet payload bloat. Document IDs are validated via `isValidId()`.
5. **Temporal Integrity**: `createdAt` is immutable on updates (`incoming().createdAt == existing().createdAt`).

## 2. The "Dirty Dozen" Payloads (Designed to Break Identity, Integrity & State)
1. **Unauthenticated Resource Creation**: `auth = null` attempting `create` on `/resources/res-1` -> `PERMISSION_DENIED`.
2. **Non-Admin Student Resource Creation**: `auth = { uid: 'student1', email: 's@test.com', email_verified: true }` attempting `create` on `/resources/res-1` -> `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoofing**: `auth = { uid: 'spoof1', email: 'shadowxmonarc@gmail.com', email_verified: false }` attempting `create` on `/subjects/sub-1` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Resource**: Admin sending extra ghost key `isHacked: true` on `/resources/res-1` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
5. **Oversized String Denial-of-Wallet on Blog**: Admin sending 20,000-char `content` (> 8000 limit) on `/blogs/blog-1` -> `PERMISSION_DENIED`.
6. **Cross-User Bookmark Read (PII/Privacy Leak)**: `student1` attempting `get` or `list` on `/users/student2/bookmarks` -> `PERMISSION_DENIED`.
7. **Cross-User Bookmark Write (Identity Spoofing)**: `student1` attempting `create` on `/users/student1/bookmarks/bm1` with payload `userId: 'student2'` -> `PERMISSION_DENIED`.
8. **Invalid Enum Type on Resource**: Admin creating resource with `type: 'pirated-book'` (not in `['notes', 'syllabus', 'pyqs', 'important-questions', 'short-notes']`) -> `PERMISSION_DENIED`.
9. **Out-of-Bounds Semester Number**: Admin creating subject with `semester: 99` (must be `>= 1 && <= 8`) -> `PERMISSION_DENIED`.
10. **Immutable Field Mutation on Update**: Owner updating `/users/student1/bookmarks/bm1` and changing `createdAt` or `userId` -> `PERMISSION_DENIED`.
11. **Path ID Poisoning**: Creating document with malformed ID containing spaces or special characters -> `PERMISSION_DENIED`.
12. **Self-Assigned Admin Escalation**: Student attempting to write to `/admins/student1` -> `PERMISSION_DENIED`.
