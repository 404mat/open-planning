export default function PillComment({ text }: { text: string }) {
  return (
    <div className="bg-background flex items-center rounded-full border p-2 shadow-sm">
      <p
        className="text-muted-foreground px-2 text-xs"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}
