// src/hooks/useArenaCards.ts
import { useState, useEffect } from "react";

async function loadArenaCards() {
  const manifest = await fetch("/arena-cards/manifest.json").then((r) =>
    r.json(),
  );

  const chunks = await Promise.all(
    Array.from({ length: manifest.chunks }, (_, i) =>
      fetch(`/arena-cards/chunk-${i}.json`).then((r) => r.json()),
    ),
  );

  return chunks.flat();
}

async function loadLegends(): Promise<string[]> {
  const manifest = await fetch("/legends/manifest.json").then((r) => r.json());

  const chunks = await Promise.all(
    Array.from({ length: manifest.chunks }, (_, i) =>
      fetch(`/legends/chunk-${i}.json`).then((r) => r.json()),
    ),
  );

  return chunks.flat();
}

export const useArenaCards = () => {
  const [arenaCards, setArenaCards] = useState([]);
  const [legends, setLegends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [cards, legs] = await Promise.all([
          loadArenaCards(),
          loadLegends(),
        ]);
        if (!cancelled) {
          setArenaCards(cards);
          setLegends(legs);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { arenaCards, legends, loading, error };
};
