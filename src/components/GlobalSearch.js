import React, { useState } from "react";

const GlobalSearch = ({ setGlobalFilter }) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500); 

  React.useEffect(() => {
    setGlobalFilter(debouncedSearchValue || undefined); 
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
