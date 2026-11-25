export function Subtitulo({ children, id }: { children: string; id?: string }) {
  return (
    <h3 className="subtitulo" id={id}>
      {children}
    </h3>
  );
}
