## Project overview
- This is a React 19 + Vite frontend for an EV Charging Station Management System.
- Routing is handled by React Router DOM (v7) with role-based protection (ADMIN/STAFF/DRIVER).
- State management uses Redux Toolkit (auth slice only so far).
- API calls use Axios with a shared client and a common `handleApiCall` helper.

## Tech stack
- React 19, Vite 7, React Router DOM 7
- Redux Toolkit + React Redux
- Axios
- Bootstrap + React-Bootstrap
- Tailwind CSS (configured) and plain CSS files
- Toasts via react-toastify

## Key structure
- `src/main.jsx`: app bootstrap, Redux Provider, ToastContainer.
- `src/path/paths.jsx`: route path constants (single source of truth).
- `src/path/AppRouter.jsx`: route definitions + layouts + role gating.
- `src/path/ProtectedRoute.jsx`: guards routes using Redux auth state.
- `src/redux/slices/authSlice.js`: auth state (`isLoggedIn`, `role`, `accessToken`).
- `src/utils/authUtils.js`: localStorage helpers for `accessToken`, `role`, `userDetails`.
- `src/api/apiUrls.js`: Axios instance + interceptors (401 handling).
- `src/api/callApi.js`: normalized API error handling.
- `src/components`, `src/pages`, `src/layouts`: UI and page structure.

## Routing conventions
- Always define new paths in `src/path/paths.jsx` and use them in routes/components.
- Add new routes in `src/path/AppRouter.jsx` under the correct role section:
	- Public routes are under the top-level `/` with `DriverLayout`.
	- Role-based routes are wrapped by `ProtectedRoute` with `allowedRoles`.
- Keep layout usage consistent: `DriverLayout` for public/driver, `AdminLayout` for admin/staff areas.

## Auth conventions
- Auth state is sourced from Redux and localStorage.
- Local storage keys are managed by `authUtils`: `accessToken`, `role`, `userDetails`.
- Login flow uses `useLogin` (see `src/hooks/useAuth.js`) and dispatches `loginSuccess`.
- Logout should call `logoutApi`, dispatch `logout`, and clear localStorage via `clearAuthData`.

## API conventions
- Use the shared Axios client in `src/api/apiUrls.js` for all HTTP calls.
- Wrap API calls with `handleApiCall` to normalize success/error shapes.
- If adding new API modules, follow the pattern in `src/api/*.js` and return `{ success, data | message, status, errorData }`.
- The Axios interceptor auto-clears auth and redirects to `/login` on 401 for non-public endpoints.

## State management
- Register any new slices in `src/redux/store.js`.
- Prefer selectors in slices for component access.

## Styling conventions
- Prefer existing CSS files in component/page folders.
- Use Bootstrap utilities/components where already used; avoid introducing new UI libraries.
- Tailwind is configured; follow existing usage patterns if you add Tailwind classes.

## Code style
- Keep imports grouped: external libs, internal modules, local styles.
- Use existing patterns for async flows (try/catch + toast feedback).
- Avoid reformatting unrelated code.

## When adding a new page/feature
1. Create the component under the appropriate `src/pages/...` folder.
2. Add the path in `src/path/paths.jsx`.
3. Wire the route in `src/path/AppRouter.jsx` under the correct role section.
4. If the feature needs API data, create a new `src/api/...` module using `apiClient` + `handleApiCall`.
5. If stateful, add a slice and register it in `src/redux/store.js`.
