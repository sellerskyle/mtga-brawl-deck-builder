// @ts-nocheck
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const colDef: GridColDef[] = [
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
              data?.row?.images?.normal
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
      return !!data.value ? `${Math.round(data.value * 100)}%` : "—";
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
];

const CardTable = ({
  allowSelection = false,
  showUsage = false,
  data,
  selectedRowIds,
  onRowSelected,
  onNameHoverStart,
  onNameHoverEnd,
}) => {
  return (
    <DataGrid
      columns={
        showUsage ? colDef : colDef.filter((col) => col.field !== "usage")
      }
      rows={data.map((row) => ({
        ...row,
        onNameHoverStart: onNameHoverStart,
        onNameHoverEnd: onNameHoverEnd,
      }))}
      checkboxSelection={!!allowSelection}
      rowSelectionModel={selectedRowIds}
      onRowSelectionModelChange={(rowSelectionModel, details) =>
        onRowSelected(rowSelectionModel)
      }
      slots={{
        toolbar: GridToolbar,
      }}
    />
  );
};

export default CardTable;
