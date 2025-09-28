export const Card = ({ className = "", ...p }) => (
    <div className={`border rounded-xl bg-white ${className}`} {...p} />
  );
  export const CardHeader = ({ className = "", ...p }) => (
    <div className={`p-4 border-b ${className}`} {...p} />
  );
  export const CardTitle = ({ className = "", ...p }) => (
    <h3 className={`text-lg font-semibold ${className}`} {...p} />
  );
  export const CardDescription = ({ className = "", ...p }) => (
    <p className={`text-sm opacity-70 ${className}`} {...p} />
  );
  export const CardContent = ({ className = "", ...p }) => (
    <div className={`p-4 ${className}`} {...p} />
  );
  export default Card;
  