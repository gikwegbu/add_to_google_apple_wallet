# Changelog

All notable changes to this project will be documented in this file.

## [2026-03-03] - Rewards & User Management Enhancements

### Added
- **Server-side Transaction History**: Replaced local-only logs with a persistent `Transaction` model in PostgreSQL.
- **Transaction Types**: Introduced `CREDIT` and `REDEMPTION` types for clearer accounting.
- **Searchable History**: Added a real-time search field in the Rewards history to filter by Name, Email, or User ID.
- **Flexible Manual Credit**: The "Manual Credit" field now accepts both **Email Addresses** and **UUIDs**. The system automatically resolves the correct user.
- **Copy Email Button**: Added a clipboard icon in the Users table for quick access to user email addresses.
- **Security**: QR code generation now uses JWT-signed tokens for added security, with a secure fallback for legacy UUID-based passes.

### Improved
- **Camera Workflow**: The camera now automatically stops once a QR code is successfully read, preventing accidental multiple scans.
- **Admin UI**: 
    - Enhanced the Rewards layout with a more robust, scrollable transaction history container.
    - Added breadcrumbs/header styling for better navigation context.
    - Improved responsiveness for the transaction list on mobile devices.
- **Pass Integration**: Improved the `GoogleService` to support dynamic field updates for points, immediately reflecting on the user's digital pass.

### Fixed
- **Camera Permissions**: Resolved a CSS issue that was preventing the browser's camera permission prompt from appearing.
- **Type Safety**: Fixed several linting and type errors in the Core service layer and Admin frontend.
- **Module Resolution**: Fixed issues with Lucide icon imports and Navbar component dependencies.
