import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import SimpleInput from '@/components/inputs/simple-input';

export function JoinRoomBox() {
  return (
    <div className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md h-fit">
      <h4>Join a room</h4>
      <SimpleInput label="Name or link" placeholder="e.g. sprint-42" required />
      <div className="self-end">
        <ButtonArrowRight text="Join" />
      </div>
    </div>
  );
}
