import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import { RevealMoreLink } from '@/components/buttons/reveal-more-link';
import RightAlignedCheckbox from '@/components/checkboxes/right-aligned-checkbox';
import SimpleInput from '@/components/inputs/simple-input';
import RadioTags from '@/components/radio/radio-tags';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { createRoomSchema } from '@/types/room-creation';
import { ArkErrors } from 'arktype';
import { useToast } from '@/hooks/use-toast';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import { useNavigate } from '@tanstack/react-router';

const voteSystems = [
  { value: 'fibonacci', label: 'Fibonacci' },
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'numbers', label: '1 to 10' },
];

export function CreateRoomBox() {
  const navigate = useNavigate();
  const { errorToast } = useToast();

  const [advancedSettings, setAdvancedSettings] = useState(false);

  const createRoom = useSessionMutation(api.rooms.create);
  const form = useForm({
    defaultValues: {
      roomName: '',
      voteSystem: 'fibonacci',
      playerReveal: true,
      playerChangeVote: false,
      playerAddTicket: false,
    },
    onSubmit: async ({ value }) => {
      const validation = createRoomSchema(value);
      if (validation instanceof ArkErrors) {
        errorToast({
          text:
            validation[0].meta?.description ??
            'There was an error creating the room.',
        });
        return;
      }

      const finalRoomId = await createRoom({
        roomId: value.roomName,
        voteSystem: value.voteSystem,
        playerReveal: value.playerReveal,
        playerChangeVote: value.playerChangeVote,
        playerAddTicket: value.playerAddTicket,
      });

      navigate({
        to: '/room/$roomId',
        params: {
          roomId: finalRoomId,
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
      <h4 className="font-semibold text-xl">Create a new room</h4>

      {/* room name field */}
      <form.Field name="roomName">
        {(field) => (
          <SimpleInput
            label="Name"
            placeholder='e.g. "Sprint 42"'
            helperText="If blank, a name will be generated for you."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div>
        <RevealMoreLink
          textClosed="Advanced settings"
          expanded={advancedSettings}
          onClick={() => setAdvancedSettings((prevState) => !prevState)}
        />
      </div>
      {/* Wrap the conditional content in a div for transitions */}
      <div
        className={`
          transition-all duration-300 ease-in-out grid
          ${advancedSettings ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        {/* Inner div prevents content visibility issues during collapse */}
        <div className="overflow-hidden py-0.5">
          {/* Content inside the collapsible area */}
          <div className="flex flex-col gap-4">
            <form.Field name="voteSystem">
              {(field) => (
                <RadioTags
                  groupName="Voting system:"
                  onChange={field.handleChange}
                  values={voteSystems}
                  currentValue={field.state.value}
                />
              )}
            </form.Field>
            <form.Field name="playerReveal">
              {(field) => (
                <RightAlignedCheckbox
                  text="Players can reveal"
                  checked={field.state.value}
                  onChange={(checked) => field.handleChange(checked)}
                />
              )}
            </form.Field>
            <form.Field name="playerChangeVote">
              {(field) => (
                <RightAlignedCheckbox
                  text="Players can change vote after reveal"
                  checked={field.state.value}
                  onChange={(checked) => field.handleChange(checked)}
                />
              )}
            </form.Field>
            <form.Field name="playerAddTicket">
              {(field) => (
                <RightAlignedCheckbox
                  text="Players can add a ticket"
                  checked={field.state.value}
                  onChange={(checked) => field.handleChange(checked)}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>
      <div className="self-end">
        <ButtonArrowRight text="Create" type="submit" />
      </div>
    </form>
  );
}
