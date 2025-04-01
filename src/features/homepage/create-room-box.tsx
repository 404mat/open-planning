import ButtonArrowRight from '@/components/buttons/button-arrow-right';
import { RevealMoreLink } from '@/components/buttons/reveal-more-link';
import SimpleInput from '@/components/inputs/simple-input';
import { useState } from 'react';

export function CreateRoomBox() {
  const [advancedSettings, setAdvancedSettings] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 border border-input rounded-md min-w-md h-fit">
      <h4>Create a new room</h4>
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
      <div className="self-end">
        <ButtonArrowRight text="Create" />
      </div>
    </div>
  );
}
