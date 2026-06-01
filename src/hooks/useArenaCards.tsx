// src/hooks/useArenaCards.ts
import { useState, useEffect, useCallback } from "react";
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

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const useArenaCards = () => {
  const [arenaCards, setArenaCards] = useState([]);
  const [legends, setLegends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [arenaCards, legs] = await Promise.all([
          loadArenaCards(),
          loadLegends(),
        ]);

        const collectionData = localStorage.getItem("mtga_collection");
        const manualCollectionData = localStorage.getItem("manual_collection");
        const collection = collectionData ? parseJson(collectionData) : {};
        const manualCollection = manualCollectionData
          ? parseJson(manualCollectionData)
          : {};

        const hasCollectionData =
          Object.keys(collection || {}).length > 0 ||
          Object.keys(manualCollection || {}).length > 0;

        const cards = arenaCards.map((card) => {
          const cleanedName = cleanName(card.name);
          const collectionCount = collection?.[cleanedName] || 0;
          const inManualCollection = !!manualCollection?.[cleanedName];
          return {
            ...card,
            owned: hasCollectionData
              ? collectionCount > 0 || inManualCollection
              : null,
            manualCollection: inManualCollection,
          };
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
  }, [refreshCount]);

  const addToManualCollection = useCallback((cardName: string) => {
    try {
      const storageValue = localStorage.getItem("manual_collection");
      const manualCollection = storageValue
        ? parseJson(storageValue) || {}
        : {};
      const cleanedName = cleanName(cardName);

      manualCollection[cleanedName] = 1;

      localStorage.setItem(
        "manual_collection",
        JSON.stringify(manualCollection),
      );
      setRefreshCount((current) => current + 1);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const removeFromManualCollection = useCallback((cardName: string) => {
    try {
      const storageValue = localStorage.getItem("manual_collection");
      const manualCollection = storageValue
        ? parseJson(storageValue) || {}
        : {};
      const cleanedName = cleanName(cardName);

      delete manualCollection[cleanedName];

      localStorage.setItem(
        "manual_collection",
        JSON.stringify(manualCollection),
      );
      setRefreshCount((current) => current + 1);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return {
    arenaCards,
    legends,
    loading,
    error,
    addToManualCollection,
    removeFromManualCollection,
  };
};
