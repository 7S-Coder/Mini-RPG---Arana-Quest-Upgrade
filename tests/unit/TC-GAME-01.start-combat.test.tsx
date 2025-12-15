import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Game from '../../app/game/Game';

// NOTE: these tests assume a test runner configured with jsdom and support for React/Next client components.
// They are intended as a starting point — adjust imports/setup if using Vitest/Jest.

describe('TC-GAME-01 — Lancer un combat', () => {
  test('démarre un combat lorsque l\'on clique sur le bouton', async () => {
    render(<Game />);

    // Click the main "Go to Arena" button which triggers startEncounter
    const startBtn = await screen.findByRole('button', { name: /Go to Arena|Go to Arena/i });
    expect(startBtn).toBeDefined();
    fireEvent.click(startBtn);

    // Wait for enemies to be spawned (EnemiesRow renders enemy-name elements)
    await waitFor(() => {
      const hasLvl = screen.queryAllByText(/LVL:/i).length > 0;
      const hasLog = !!screen.queryByText(/New encounter/i);
      if (!hasLvl && !hasLog) throw new Error('no enemies or log yet');
    }, { timeout: 3000 });

    // The button should become disabled while in combat
    expect(startBtn).toBeDisabled();
  });
});
