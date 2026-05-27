// @ts-nocheck
import { ListCard } from "../types";
import { orderBy, uniqBy } from "lodash";
import {
  Alert,
  Autocomplete,
  IconButton,
  InputAdornment,
  Popper,
  TextField,
} from "@mui/material";
import React from "react";
import { cleanName } from "../util";
import { Add, Casino, Remove, Upload } from "@mui/icons-material";
import ThemeContextProvider from "../ThemeContextProvider";
import Header from "../Header";
import Footer from "../Footer";
import CardTable from "../CardTable";
import { useArenaCards } from "../hooks/useArenaCards";

const COLOR_LAND_MAP = {
  W: "Plains",
  U: "Island",
  B: "Swamp",
  R: "Mountain",
  G: "Forest",
};

const LEGEND_TRANSLATIONS = {
  "Alora, Rogue Companion": "Alora, Merry Thief",
  "Ambergris, Citadel Agent": "Amber Gristle O'Maul",
  "Gale, Conduit of the Arcane": "Gale, Waterdeep Prodigy",
  "Imoen, Trickster Friend": "Imoen, Mystic Trickster",
  "Gut, Fanatical Priestess": "Gut, True Soul Zealot",
  "Jaheira, Harper Emissary": "Jaheria, Friend of the Forest",
  "Lulu, Forgetful Hollyphant": "Lulu, Forgetful Hollyphant",
  "Karlach, Raging Tiefling": "Karlach, Fury of Avernus",
  "Lae'zel, Githyanki Warrior": "Lae'zel, Vlaakith's Champion",
  "Rasaad, Monk of Selûne": "Rasaad yn Bashir",
  "Sarevok the Usurper": "Sarevok, Deathbringer",
  "Shadowheart, Sharran Cleric": "Shadowheart, Dark Justiciar",
  "Skanos, Dragon Vassal": "Skanos Dragonheart",
  "Vhal, Eager Scholar": "Vhal, Candlekeep Researcher",
  "Viconia, Nightsinger's Disciple": "Viconia, Drow Apostate",
  "Ulder Ravengard, Marshal": "Duke Ulder Ravengard",
  "Wyll, Pact-Bound Duelist": "Wyll, Blade of Frontiers",
  "Wilson, Bear Comrade": "Wilson, Refined Grizzly",
};

const getJSON = (url: string, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    const status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

const Home = () => {
  const { arenaCards, legends } = useArenaCards();

  const [legend, setLegend] = React.useState(
    arenaCards.find(
      (card) =>
        card.name === legends[Math.floor(Math.random() * legends.length)],
    ),
  );

  const [legendFilter, setLegendFilter] = React.useState("");
  const [legendData, setLegendData] = React.useState(null);
  const [deck, setDeck] = React.useState([]);
  const [deckString, setDeckString] = React.useState("");
  const [previewImage, setPreviewImage] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [alert, setAlert] = React.useState(null);
  const [pastedDeck, setPastedDeck] = React.useState([]);
  const [cardsWithUsage, setCardsWithUsage] = React.useState(
    arenaCards.map((ac) => ({ ...ac, id: ac.name })),
  );
  const [totalLands, setTotalLands] = React.useState(40);

  const imageLink = React.useMemo(
    () =>
      legend
        ? arenaCards.find((card) => card.name === legend.name).images?.normal
        : null,
    [arenaCards, legend],
  );

  const filteredLegends = React.useMemo(
    () =>
      legends.filter((card) =>
        legendFilter
          ? card.toLowerCase().includes(legendFilter.toLowerCase())
          : true,
      ),
    [legends, legendFilter],
  );

  const numBasics = React.useMemo(() => {
    const basics = deck.filter((card) =>
      Object.values(COLOR_LAND_MAP).includes(card.name),
    );
    let total = 0;
    basics.forEach((card) => (total += card.amount));
    return total;
  }, [deck]);

  const getBasics = (deck) => {
    const nonLands = deck.filter((card) => !card.type.includes("Land"));
    const lands = deck.filter((card) => card.type.includes("Land"));

    const colorTotals = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    const landTotals = { W: 0, U: 0, B: 0, R: 0, G: 0 };

    nonLands.forEach((card) => {
      card.colors.forEach((color) => {
        colorTotals[color] = colorTotals[color] + 1;
      });
    });
    lands.forEach((card) => {
      if (card.colors) {
        card.colors.forEach((color) => {
          landTotals[color] = landTotals[color] + 1;
        });
      }
    });
    const totalBasicsNeeded = 99 - deck.length; //TODO: check if need to change this

    if (totalBasicsNeeded <= 0) return [];

    let existingLandPips = 0;
    Object.keys(landTotals).forEach((color) => {
      existingLandPips += landTotals[color];
    });

    let permanentPips = 0;
    Object.keys(colorTotals).forEach((color) => {
      permanentPips += colorTotals[color];
    });

    const permanentRatios = {};

    Object.keys(colorTotals).forEach((color) => {
      permanentRatios[color] = colorTotals[color] / permanentPips;
    });

    const basicsNeeded = { W: 0, U: 0, B: 0, R: 0, G: 0 };

    let basicsAllocated = 0;

    Object.keys(basicsNeeded).forEach((color) => {
      const pipsNeeded =
        permanentRatios[color] * (existingLandPips + totalBasicsNeeded);
      const neededOfType = Math.floor(pipsNeeded - landTotals[color]);
      basicsNeeded[color] = neededOfType > 0 ? neededOfType : 0;
      basicsAllocated += basicsNeeded[color];
    });

    const neededColors = Object.keys(colorTotals).filter(
      (key) => !!colorTotals[key],
    );
    const eachGets = Math.floor(
      (totalBasicsNeeded - basicsAllocated) / neededColors.length,
    );
    const remainder =
      (totalBasicsNeeded - basicsAllocated) % neededColors.length;

    neededColors.forEach((color, i) => {
      basicsNeeded[color] += eachGets;
      if (i < remainder) basicsNeeded[color] += 1;
    });

    let basics = [];
    Object.keys(basicsNeeded).forEach((color) => {
      if (basicsNeeded[color]) {
        basics = [
          ...basics,
          {
            name: COLOR_LAND_MAP[color],
            type: "Land",
            amount: basicsNeeded[color],
          },
        ];
      }
    });

    basics = basics.filter((type) => type.amount > 0);
    return basics;
  };

  const handleUpload = React.useCallback(async () => {
    const text = await navigator.clipboard.readText();
    const lines = text.split("\n");
    const legendName = lines[1].slice(2).split("(")[0].trim();

    if (!legendName.length) {
      setAlert(`Invalid deck format pasted`);
      return;
    }

    const legend = arenaCards.find((ac) => ac.name.includes(legendName));
    setLegend(legend);

    const deckList = lines
      .slice(4)
      .map((row) => row.split(" ").slice(1).join(" ").split("(")[0].trim())
      .filter((card) => !Object.values(COLOR_LAND_MAP).includes(card));

    setPastedDeck(deckList);
    setAlert(null);
  }, []);

  const handleTotalLandsChange = React.useCallback((newVal) => {
    if (Number.isInteger(+newVal)) setTotalLands(+newVal);
  }, []);

  //Pull Data
  React.useEffect(() => {
    if (legend) {
      let legName = legend.name;
      if (Object.keys(LEGEND_TRANSLATIONS).includes(legName))
        legName = LEGEND_TRANSLATIONS[legName];

      const cleanedName = legName
        .split("//")[0]
        .trim()
        .toLowerCase()
        .replaceAll(",", "")
        .replaceAll(" ", "-")
        .replaceAll(".", "")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ñ", "n")
        .replaceAll("ó", "o")
        .replaceAll("ü", "u")
        .replaceAll("ú", "u")
        .replaceAll("û", "u")
        .replaceAll("'", "");

      getJSON(
        `https://json.edhrec.com/pages/commanders/${cleanedName}.json`,
        (err, data) => {
          if (err !== null) {
            console.log("Something went wrong: " + err);
            setAlert(`Failed to pull data for commander: ${legend?.name}`);
          } else {
            let dataWithUsage: ListCard[] = [];

            data.container.json_dict.cardlists.forEach((list) => {
              list.cardviews.forEach((card) => {
                const cleanedName = cleanName(card.name);
                const arenaCard = arenaCards.find(
                  (ac) =>
                    ac.name.split("//")[0].trim() ===
                    cleanedName.split("//")[0].trim(),
                );

                dataWithUsage = [
                  ...dataWithUsage,
                  {
                    ...arenaCard,
                    usage: card.inclusion / card.potential_decks,
                    totalDecks: card.inclusion,
                  },
                ];
              });
            });
            setLegendData(dataWithUsage);
            const sorted = orderBy(dataWithUsage, ["usage"], ["desc"]);

            const arenaNames = arenaCards.map((card) => card.name);

            const filtered = uniqBy(
              sorted.filter((card) => arenaNames.includes(card.name)),
              "name",
            );
            const withTypes = filtered.map((card) => {
              const arenaCard = arenaCards.find((ac) => ac.name === card.name);
              return {
                ...card,
                type: arenaCard.type,
                colors: arenaCard.colors,
                amount: 1,
                rank: arenaCard.edh_rank,
                id: arenaCard.name,
              };
            });

            setCardsWithUsage([
              ...withTypes,
              ...arenaCards.filter(
                (ac) =>
                  !withTypes.map((card) => card.name).includes(ac.name) &&
                  (!ac.colors.length ||
                    ac.colors.every((col) => legend.colors.includes(col))),
              ),
            ]);
            setAlert(null);
          }
        },
      );
    }
  }, [arenaCards, legend]);

  //Deck Builder
  React.useEffect(() => {
    if (legendData !== null) {
      const consideredCards = !pastedDeck.length
        ? orderBy(
            cardsWithUsage.filter(
              (card) =>
                !!card.usage &&
                !Object.values(COLOR_LAND_MAP).includes(card.name),
            ),
            ["owned", "usage"],
            ["desc", "desc"],
          )
        : cardsWithUsage
            .filter(
              (card) =>
                pastedDeck.includes(card.name) &&
                !Object.values(COLOR_LAND_MAP).includes((card) => card.name),
            )
            .map((card) => ({ ...card, amount: 1 }));

      const nonLands = !pastedDeck.length
        ? consideredCards
            .filter((card) => !card.type.includes("Land"))
            .slice(0, 99 - totalLands)
        : consideredCards;

      const lands = !pastedDeck.length
        ? consideredCards.filter(
            (card) =>
              card.type.includes("Land") &&
              card.usage > nonLands[nonLands.length - 1].usage &&
              !Object.values(COLOR_LAND_MAP).includes(card.name),
          )
        : consideredCards.filter((card) => card.type.includes("Land"));

      const deck = [...nonLands, ...lands];

      const basics = getBasics(deck);

      setDeck([...deck, ...basics]);
    }
  }, [cardsWithUsage, legend, legendData, pastedDeck, totalLands]);

  //Deck String Builder
  React.useEffect(() => {
    if (!!legend && !!deck) {
      const legendName = legend.name.split("//")[0].trim();
      let stringifiedDeck = `About\nName ${legendName}\nFormat Brawl\n\nCommander\n1 ${legendName}\n\nDeck`;

      deck.forEach((card) => {
        const cardName =
          card.layout === "split" && !card.type.includes("Room")
            ? card.name.replaceAll(" // ", " /// ")
            : card.layout === "adventure" ||
                card.layout === "transform" ||
                card.layout === "modal_dfc"
              ? card.name.split("//")[0].trim()
              : card.name;
        stringifiedDeck += `\n${card.amount} ${cardName}`;
      });
      setDeckString(stringifiedDeck);
    } else {
      setDeckString("");
    }
  }, [legend, deck]);

  const data = React.useMemo(
    () =>
      cardsWithUsage.sort((a, b) => {
        if (pastedDeck.includes(a.name)) {
          if (pastedDeck.includes(b.name)) return 0;
          else return -1;
        } else {
          if (pastedDeck.includes(b.name)) return 1;
          else return 0;
        }
      }),
    [cardsWithUsage, pastedDeck],
  );

  return (
    <ThemeContextProvider>
      <Header />
      {!!alert && (
        <Alert className="main-content" severity="error">
          {alert}
        </Alert>
      )}
      <div
        className="main-content"
        style={{
          display: "flex",
          gap: "0.5em",
          justifyContent: "space-between",
          maxWidth: "1024px",
        }}
      >
        <Autocomplete
          disablePortal
          options={filteredLegends}
          value={legend?.name ?? null}
          onChange={(event: any, newValue: string | null) => {
            setAnchorEl(null);
            setPreviewImage(null);
            setLegend(arenaCards.find((card) => card.name.includes(newValue)));
            setPastedDeck([]);
          }}
          onInputChange={(event, newInputValue) => {
            if (!newInputValue) {
              setLegend(null);
              setLegendData(null);
              setDeckString("");
            }
            setLegendFilter(newInputValue);
          }}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            const leg = arenaCards.find((card) => card.name === option);
            return (
              <div key={key} {...optionProps}>
                <span
                  onMouseEnter={(e) => {
                    setAnchorEl(e.currentTarget);
                    setPreviewImage(leg?.images?.normal);
                  }}
                  onMouseLeave={() => {
                    setAnchorEl(null);
                    setPreviewImage(null);
                  }}
                >
                  {option}
                </span>
              </div>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select a Commander" />
          )}
          sx={{ width: "100%" }}
        />
        <IconButton
          onClick={() => {
            const num = Math.floor(Math.random() * legends.length);
            const leg = legends[num];
            const x = arenaCards.find((card) => card.name === leg);
            setLegend(x);
          }}
          title="Random Commander"
        >
          <Casino fontSize="inherit" />
        </IconButton>
        <IconButton onClick={handleUpload} title="Upload MTGA Decklist">
          <Upload fontSize="inherit" />
        </IconButton>
      </div>
      {imageLink && (
        <img style={{ borderRadius: "4.75% / 3.5%" }} src={imageLink} />
      )}
      {legendData && (
        <div
          className="main-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",

            gap: "1em",
          }}
        >
          <div style={{ height: "600px", width: "100%", alignSelf: "center" }}>
            <CardTable
              allowSelection
              showUsage
              data={data}
              selectedRowIds={deck.map((card) => card.name)}
              onRowSelected={(rowSelectionModel) => {
                const newDeck = cardsWithUsage
                  .filter(
                    (card) =>
                      rowSelectionModel.includes(card.name) &&
                      !Object.values(COLOR_LAND_MAP).includes(card.name),
                  )
                  .map((card) => ({ ...card, amount: 1, id: card.name }));
                const basics = getBasics(newDeck);
                setDeck([...newDeck, ...basics]);
              }}
              onNameHoverStart={(element, image) => {
                setAnchorEl(element);
                setPreviewImage(image);
              }}
              onNameHoverEnd={() => {
                setAnchorEl(null);
                setPreviewImage(null);
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "1em" }}>
            <TextField
              value={totalLands}
              label="Total Lands"
              onChange={(e) => handleTotalLandsChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={() => {
                          if (totalLands > 0) setTotalLands((cur) => cur - 1);
                        }}
                        edge="start"
                      >
                        <Remove />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          if (totalLands < 99) setTotalLands((cur) => cur + 1);
                        }}
                        edge="end"
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <p>(Basics: {numBasics})</p>
          </div>
        </div>
      )}
      {deckString && (
        <TextField
          className="main-content"
          multiline
          value={deckString}
          maxRows={20}
          placeholder="Select a commander to get a decklist"
        />
      )}
      <Footer />
      {!!previewImage && (
        <Popper
          sx={{ zIndex: 4000 }}
          open={!!previewImage}
          anchorEl={anchorEl}
          placement={"right"}
        >
          <img
            loading="lazy"
            src={previewImage}
            style={{
              borderRadius: "4.75% / 3.5%",
              aspectRatio: 5 / 7,
              width: "15em",
              marginLeft: "4em",
            }}
          />
        </Popper>
      )}
    </ThemeContextProvider>
  );
};

export default Home;
