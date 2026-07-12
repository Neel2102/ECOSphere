// Single inline SVG icon set (stroke-based, 24x24 grid, colored via
// currentColor) so no icon font or external assets are needed.
const PATHS = {
  home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />,
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  orders: (
    <>
      <path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M15 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  inventory: (
    <>
      <path d="M4 8 12 4l8 4v8l-8 4-8-4V8Z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  invoicing: (
    <>
      <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  customers: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2M17.6 14.6c1.6.8 2.6 2.3 2.9 4.4" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-9M21 20H3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-3.4 3.2-5.3 6.5-5.3s5.8 1.9 6.5 5.3" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8" />
      <path d="M10 12h10M17 8.5 20.5 12 17 15.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16M9.9 5.9A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6 7.3A16.8 16.8 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.5-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v5.5L10 21v-8L3 5Z" />,
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8M4 12h16" opacity="0" />
      <path d="M4 6.5h12M20 6.5h-1.5M4 12h5M12.5 12H20M4 17.5h9M16.5 17.5H20" />
      <circle cx="17" cy="6.5" r="1.8" />
      <circle cx="10.5" cy="12" r="1.8" />
      <circle cx="14.5" cy="17.5" r="1.8" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3.5h10V8M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-5A1.5 1.5 0 0 1 4.5 9h15A1.5 1.5 0 0 1 21 10.5v5a1.5 1.5 0 0 1-1.5 1.5H17" />
      <path d="M7 14h10v6.5H7V14Z" />
    </>
  ),
  edit: (
    <>
      <path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" />
      <path d="m12.5 7.5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronLeft: <path d="M14.5 6 8.5 12l6 6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  arrowDown: <path d="M12 4v16m0 0-5-5m5 5 5-5" />,
  camera: (
    <>
      <path d="M4 8.5h3l1.5-2.5h7L17 8.5h3A1 1 0 0 1 21 9.5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4.5h16v15H4v-15Z" />
      <path d="M4 13h5a3 3 0 0 0 6 0h5" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-6 4 12L16 12h5" />,
  ship: (
    <>
      <path d="M3 16.5h13l2-4h3.5" />
      <rect x="5" y="8" width="9" height="4.5" rx="0.5" />
      <circle cx="8" cy="19" r="1.6" />
      <circle cx="15" cy="19" r="1.6" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.2v.3" />
    </>
  ),
};

function Icon({ name, size = 20, strokeWidth = 1.7, className = '', ...rest }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

export default Icon;
