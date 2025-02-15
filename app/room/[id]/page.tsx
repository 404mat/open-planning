export default function Room({ params }: { params: { id: string } }) {
  return <div>{`Room number ${params.id}`}</div>;
}
