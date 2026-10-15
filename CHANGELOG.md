# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-15] - Comprehensive Environment Setup & Credentials Walkthrough

### Added
- **`How_to_get_env_files.md`**: Complete, click-by-click walkthrough guide detailing how to obtain all certificates, keys, and values needed for `.env` files across Google Cloud, Google Pay & Wallet Console, Apple Developer Portal, and AWS.
- **Master Quick Reference Matrix**: Comprehensive table mapping every environment variable to its target file, example value, and official developer portal.
- **Admin Environment Template**: Added `admin/.env.example` defining `VITE_API_BASE_URL` for local development.

### Improved
- **Apple Wallet Certificate Path Resolution**: Corrected certificate path definitions in `core/.env.example` (`apple/certs/...`) to match runtime root resolution in `apple.service.ts`.
- **Database Port Documentation**: Documented Docker Compose port mapping (`5433:5432`) in `core/.env.example` to prevent port collision issues with local PostgreSQL instances.
- **Setup & Onboarding Documentation**: Enhanced `README.md` with direct references and tips pointing to the environment walkthrough guide.

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
