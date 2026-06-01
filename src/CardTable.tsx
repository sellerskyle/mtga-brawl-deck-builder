// @ts-nocheck
import React, { useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Check, Close, MoreVert } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";

const colDef = [
  {
    field: "name",
    headerName: "Name",
    width: 350,
    renderCell: (data) => {
      return (
        <span
          onMouseEnter={(e) => {
            data.row.onNameHoverStart(
              e.currentTarget,
              data?.row?.images?.normal,
            );
          }}
          onMouseLeave={() => data.row.onNameHoverEnd()}
        >
          {data.value}
        </span>
      );
    },
  },
  {
    field: "cmc",
    headerName: "CMC",
    width: 110,
    renderCell: (data) => {
      return data.value;
    },
  },
  {
    field: "rarity",
    headerName: "Rarity",
    width: 120,
    renderCell: (data) => {
      return data.value;
    },
  },
  {
    field: "colors",
    headerName: "Colors",
    width: 120,
    renderCell: (data) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25em",
            height: "100%",
          }}
        >
          {data.value.map((val) => (
            <img
              src={`/pips/${val.toUpperCase()}.svg`}
              style={{ height: "1.25em", aspectRatio: 1 }}
            />
          ))}
        </div>
      );
    },
  },
  { field: "type", headerName: "Type", width: 300 },
  {
    field: "usage",
    headerName: "Usage",
    width: 120,
    renderCell: (data) => {
      return data.value ? `${Math.round(data.value * 100)}%` : "—";
    },
  },
  {
    field: "totalDecks",
    headerName: "Total Decks",
    width: 150,
  },
  {
    field: "edhRank",
    headerName: "EDH Rank",
    width: 150,
  },
  {
    field: "prices",
    headerName: "Price",
    width: 110,
    renderCell: (data) => {
      let values = Object.values(data.value)
        .filter((v) => v !== null)
        .map((v) => Number(v));
      if (values.length === 0) values = [0];
      return `$${Math.min(...values).toFixed(2)}`;
    },
    sortComparator: (v1, v2) => {
      let values1 = Object.values(v1)
        .filter((v) => v !== null)
        .map((v) => Number(v));
      if (values1.length === 0) values1 = [0];

      let values2 = Object.values(v2)
        .filter((v) => v !== null)
        .map((v) => Number(v));
      if (values2.length === 0) values2 = [0];
      return Math.min(...values1) > Math.min(...values2);
    },
  },
  {
    field: "owned",
    headerName: "Owned",
    width: 70,
    renderCell: (data) => {
      return data.value === null ? "" : data.value ? <Check /> : <Close />;
    },
  },
  {
    field: "actions",
    headerName: "",
    width: 70,
    sortable: false,
    renderCell: (data) => {
      return (
        <IconButton
          size="small"
          onClick={(event) => {
            data.row?.onOpenActionsMenu?.(event.currentTarget, data.row);
            event.stopPropagation();
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      );
    },
  },
];

const CardTable = ({
  allowSelection = false,
  showUsage = false,
  data,
  selectedRowIds,
  onRowSelected,
  onNameHoverStart,
  onNameHoverEnd,
  onAddToCollection,
  onRemoveFromCollection,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const openActionsMenu = (anchor, row) => {
    setMenuAnchor(anchor);
    setMenuRow(row);
  };

  const closeActionsMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleAddToCollection = () => {
    if (menuRow && onAddToCollection) {
      onAddToCollection(menuRow.name);
    }
    closeActionsMenu();
  };

  const handleRemoveFromCollection = () => {
    if (menuRow && onRemoveFromCollection) {
      onRemoveFromCollection(menuRow.name);
    }
    closeActionsMenu();
  };

  return (
    <>
      <DataGrid
        columns={
          showUsage ? colDef : colDef.filter((col) => col.field !== "usage")
        }
        rows={data.map((row) => ({
          ...row,
          onNameHoverStart: onNameHoverStart,
          onNameHoverEnd: onNameHoverEnd,
          onOpenActionsMenu: openActionsMenu,
        }))}
        checkboxSelection={!!allowSelection}
        rowSelectionModel={selectedRowIds}
        onRowSelectionModelChange={(rowSelectionModel) =>
          onRowSelected(rowSelectionModel)
        }
        slots={{
          toolbar: GridToolbar,
        }}
      />
      <Menu
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={closeActionsMenu}
      >
        {menuRow?.manualCollection ? (
          <MenuItem onClick={handleRemoveFromCollection}>
            Remove from Collection
          </MenuItem>
        ) : (
          <MenuItem onClick={handleAddToCollection}>Add to Collection</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default CardTable;
