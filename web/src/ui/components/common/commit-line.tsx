import { cn } from "@/ui/classnames";

export const CommitLine = ({
  height = 20,
  includeNode,
  hideOnMobile,
}: {
  height?: number;
  includeNode?: boolean;
  hideOnMobile?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center",
        hideOnMobile && "hidden sm:flex",
      )}
    >
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
      {includeNode && (
        <div className="h-2 w-2 rounded-full border-2 border-neutral-300 bg-neutral-300" />
      )}
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
