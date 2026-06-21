import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/hooks/useScrollAnimation", () => ({
  useScrollAnimation: () => [{ current: null }, true],
}));

vi.mock("../../src/components/Strava", () => ({
  StravaCard: () => <div>Running statistics</div>,
}));

vi.mock("../../src/components/Hobbies/MidiPlayButton", () => ({
  MidiPlayButton: () => <button type="button">Play</button>,
}));

import { Hobbies } from "../../src/components/Hobbies/Hobbies";

describe("Hobbies", () => {
  afterEach(() => cleanup());

  it("keeps every hobby tile in its layout position", () => {
    render(<Hobbies />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card.style.transform).toBe("");
    }
  });
});
