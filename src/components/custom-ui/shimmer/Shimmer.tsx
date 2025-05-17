import { cn } from "@/lib/utils";

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Shimmer(props: ShimmerProps) {
  const { className, children } = props;
  return (
    <div
      className={cn(
        `relative shadow-none h-[200px] w-[250px] rounded-lg overflow-hidden bg-primary/10`,
        className
      )}
    >
      <div
        className={`absolute w-full h-full bg-[length:1200px_100%] animate-shimmer bg-gradient-shimmer`}
      />
      {children}
    </div>
  );
}
