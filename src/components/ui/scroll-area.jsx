export const ScrollArea = ({ className = "", ...props }) => (
    <div className={`overflow-auto ${className}`} {...props} />
  );
  export default ScrollArea;
  