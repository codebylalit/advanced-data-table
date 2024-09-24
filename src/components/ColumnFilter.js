import React from "react";
import {
  Slider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

export const ColumnFilters = ({ columns }) => {
  const [priceRange, setPriceRange] = React.useState([0, 1000]);
  const [category, setCategory] = React.useState("");

  // Range filter for price
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="Electronics">Electronics</MenuItem>
          <MenuItem value="Clothing">Clothing</MenuItem>
        </Select>
      </FormControl>

      <div>
        <label>Price Range</label>
        <Slider
          value={priceRange}
          onChange={handlePriceRangeChange}
          min={0}
          max={1000}
          valueLabelDisplay="auto"
        />
      </div>
    </div>
  );
};
