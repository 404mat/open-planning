import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import SimpleInput from '@/components/inputs/simple-input';
import { useForm } from '@tanstack/react-form';

export function JoinRoomBox() {
  const form = useForm({
    defaultValues: {
      roomName: '',
    },
    onSubmit: async ({ value }) => {
      alert(JSON.stringify(value));
    },
  });

  return (
    <form
      className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md h-fit"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <h4 className="font-semibold text-xl">Join a room</h4>
      <form.Field name="roomName">
        {(field) => (
          <SimpleInput
            label="Name or link"
            placeholder="e.g. sprint-42"
            required
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <div className="self-end">
        <ButtonArrowRight text="Join" />
      </div>
    </form>
  );
}
