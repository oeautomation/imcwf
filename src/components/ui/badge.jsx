export const Badge = ({ className = "", children, ...props }) => (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs border ${className}`} {...props}>
      {children}
    </span>
  );
  export default Badge;
  