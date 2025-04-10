import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import SimpleInput from '@/components/inputs/simple-input';
import { useToast } from '@/hooks/use-toast';
import { validateJoinRoomInput } from '@/lib/room-join';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';

export function JoinRoomBox() {
  const navigate = useNavigate();
  const { errorToast } = useToast();

  const form = useForm({
    defaultValues: {
      roomNameOrLink: '',
    },
    onSubmit: async ({ value }) => {
      const { isValid, errorMessage, roomId } = validateJoinRoomInput(
        value.roomNameOrLink
      );
      if (!isValid) {
        errorToast({
          text: errorMessage ?? 'There was an error joining the room.',
        });
        return;
      }

      navigate({
        to: '/room/$roomId',
        params: {
          roomId,
        },
      });
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
      <form.Field name="roomNameOrLink">
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
