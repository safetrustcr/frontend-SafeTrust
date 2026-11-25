"use client";

import { GUEST_LIMITS, type GuestSearch } from "./stay-search";
import { GuestStepper } from "./GuestStepper";

export function WhoSection({
  guests,
  onChange,
}: {
  guests: GuestSearch;
  onChange: (guests: GuestSearch) => void;
}) {
  const needsAdult =
    guests.adults === 0 &&
    (guests.children > 0 || guests.infants > 0 || guests.pets > 0);

  return (
    <div className="divide-y divide-border">
      <div>
        <GuestStepper
          label="Adults"
          hint="Ages 13 or above"
          value={guests.adults}
          max={Math.min(
            GUEST_LIMITS.adults,
            GUEST_LIMITS.party - guests.children,
          )}
          onChange={(adults) => onChange({ ...guests, adults })}
        />
        {needsAdult ? (
          <p
            role="alert"
            className="-mt-1 pb-2 text-xs font-medium text-destructive"
          >
            Add at least one adult
          </p>
        ) : null}
      </div>
      <GuestStepper
        label="Children"
        hint="Ages 2–12"
        value={guests.children}
        max={Math.min(
          GUEST_LIMITS.children,
          GUEST_LIMITS.party - guests.adults,
        )}
        onChange={(children) => onChange({ ...guests, children })}
      />
      <GuestStepper
        label="Infants"
        hint="Under 2"
        value={guests.infants}
        max={GUEST_LIMITS.infants}
        onChange={(infants) => onChange({ ...guests, infants })}
      />
      <GuestStepper
        label="Pets"
        value={guests.pets}
        max={GUEST_LIMITS.pets}
        onChange={(pets) => onChange({ ...guests, pets })}
      />
    </div>
  );
}
