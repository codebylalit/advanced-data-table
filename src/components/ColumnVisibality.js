import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

export const ColumnVisibility = ({ columns }) => {
  const [visibility, setVisibility] = React.useState(
    columns.reduce((acc, column) => {
      acc[column.accessorKey] = true; // Default all columns to visible
      return acc;
    }, {})
  );

  const toggleColumnVisibility = (accessorKey) => {
    setVisibility((prev) => ({
      ...prev,
      [accessorKey]: !prev[accessorKey],
    }));
  };

  return (
    <div>
      {columns.map((column) => (
        <FormControlLabel
          key={column.accessorKey}
          control={
            <Checkbox
              checked={visibility[column.accessorKey]}
              onChange={() => toggleColumnVisibility(column.accessorKey)}
            />
          }
          label={column.header}
        />
      ))}
    </div>
  );
};
