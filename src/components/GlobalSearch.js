import React, { useState } from "react";

const GlobalSearch = ({ setGlobalFilter }) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500); // Debounce for 500ms

  // Update the global filter when debounced value changes
  React.useEffect(() => {
    setGlobalFilter(debouncedSearchValue || undefined); // Set undefined to clear the filter
  }, [debouncedSearchValue, setGlobalFilter]);

  return (
    <input
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Search globally..."
      style={{
        width: "200px",
        padding: "5px",
        marginBottom: "10px",
      }}
    />
  );
};

// Custom debounce function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default GlobalSearch;
