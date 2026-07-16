/** Crisp geometric mark — drawn SVG, not a generated illustration. */
export default function BrandMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" className="fill-signal/15 stroke-signal" strokeWidth="1.5" />
      <path
        d="M16 7.5L24 11.2V17.8C24 22.1 20.6 25.4 16 26.5C11.4 25.4 8 22.1 8 17.8V11.2L16 7.5Z"
        className="stroke-signal"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 16.2L14.8 18.8L20.2 13.2"
        className="stroke-copper"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
