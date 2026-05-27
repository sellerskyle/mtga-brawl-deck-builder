// src/hooks/useArenaCards.ts
import { useState, useEffect } from "react";
import { cleanName } from "../util";

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
        const [arenaCards, legs] = await Promise.all([
          loadArenaCards(),
          loadLegends(),
        ]);

        const collectionData = localStorage.getItem("mtga_collection");
        const collection = collectionData ? JSON.parse(collectionData) : {};
        const isCollectionEmpty = Object.keys(collection).length === 0;
        const cards = arenaCards.map((card) => {
          if (isCollectionEmpty) return { ...card, owned: null };
          const cleanedName = cleanName(card.name);
          const count = collection[cleanedName] || 0;
          return { ...card, owned: count > 0 };
        });
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
