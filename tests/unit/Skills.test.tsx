import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/hooks/useScrollAnimation", () => ({
  useScrollAnimation: () => [{ current: null }, true],
}));

import { Skills } from "../../src/components/Skills/Skills";

describe("Skills", () => {
  afterEach(() => cleanup());

  it("keeps every skill tile in its layout position", () => {
    render(<Skills />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(6);
    for (const card of cards) {
      expect(card.style.transform).toBe("");
    }
  });
});
