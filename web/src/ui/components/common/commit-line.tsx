export const CommitLine = ({
  height = 20,
  includeNode,
}: {
  height?: number;
  includeNode?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center">
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
