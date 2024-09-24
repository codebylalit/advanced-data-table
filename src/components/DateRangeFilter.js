import React, { useState } from "react";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { TextField } from "@mui/material";

export const DateRangeFilter = ({ setDateRange }) => {
  const [value, setValue] = useState([null, null]);

  return (
    <DateRangePicker
      startText="Start Date"
      endText="End Date"
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        setDateRange(newValue);
      }}
      renderInput={(startProps, endProps) => (
        <>
          <TextField {...startProps} />
          <TextField {...endProps} />
        </>
      )}
    />
  );
};
