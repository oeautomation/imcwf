export const Button = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center border rounded px-3 py-2 text-sm ${className}`}
    {...props}
  />
);
export default Button;
