import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import { RevealMoreLink } from '@/components/buttons/reveal-more-link';
import RightAlignedCheckbox from '@/components/checkboxes/right-aligned-checkbox';
import SimpleInput from '@/components/inputs/simple-input';
import RadioTags from '@/components/radio/radio-tags';
import { useState } from 'react';

const voteSystems = [
  { value: 'fibonacci', label: 'Fibonacci' },
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'numbers', label: '1 to 10' },
];

export function CreateRoomBox() {
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [voteSystem, setVoteSystem] = useState('fibonacci');
  const [playerReveal, setPlayerReveal] = useState(true);
  const [playerChangeVote, setPlayerChangeVote] = useState(false);
  const [playerAddTicket, setPlayerAddTicket] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md h-fit">
      <h4 className="font-semibold text-xl">Create a new room</h4>
      <SimpleInput
        label="Name"
        placeholder='e.g. "Sprint 42"'
        helperText="If blank, a name will be generated for you."
      />
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
            <RadioTags
              groupName="Voting system"
              onChange={setVoteSystem}
              values={voteSystems}
              currentValue={voteSystem}
            />
            <RightAlignedCheckbox
              text="Players can reveal"
              checked={playerReveal}
              onChange={setPlayerReveal}
            />
            <RightAlignedCheckbox
              text="Players can change vote after reveal"
              checked={playerChangeVote}
              onChange={setPlayerChangeVote}
            />
            <RightAlignedCheckbox
              text="Players can add a ticket"
              checked={playerAddTicket}
              onChange={setPlayerAddTicket}
            />
          </div>
        </div>
      </div>
      <div className="self-end">
        <ButtonArrowRight text="Create" />
      </div>
    </div>
  );
}
