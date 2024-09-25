import React, { useCallback, useEffect, useState } from "react";
import { useTable, useSortBy } from "react-table";
 import Fuse from "fuse.js";
import {
  EyeIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TableComponent = ({ columns, data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showGroupingPanel, setShowGroupingPanel] = useState(false);
  const [showSortingPanel, setShowSortingPanel] = useState(false); // New state for showing sorting panel
  const [groupedData, setGroupedData] = useState(null);
  const [selectedGroupColumn, setSelectedGroupColumn] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showEyePanel, setShowEyePanel] = useState(false); // New state for eye icon panel
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    subcategory: "",
    createdAt: { from: "", to: "" },
    updatedAt: { from: "", to: "" },
    price: { from: "", to: "" },
  });

  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, column) => {
      acc[column.accessor] = true;
      return acc;
    }, {})
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setSortBy,
  } = useTable({ columns, data }, useSortBy);
  const [filteredResults, setFilteredResults] = useState(data); // Initialize with original data

  const rowsPerPage = 10; // Number of rows to display per page

  const startRow = currentPage * rowsPerPage; // Starting row index
  const endRow = startRow + rowsPerPage; // Ending row index

  // Calculate displayed rows based on filtered results or grouped data
  const displayedRows =
    filteredResults.length > 0
      ? filteredResults.slice(startRow, endRow) // Slice filtered results
      : groupedData
      ? groupedData
          .flatMap((group) =>
            group.subcategories.flatMap((subgroup) => subgroup.items)
          )
          .slice(startRow, endRow) // Slice grouped data
      : [];

  // Pagination controls
  const pageCount = Math.ceil(filteredResults.length / rowsPerPage); // Total number of pages based on filtered results

  // Inside your TableComponent
  const filterData = (currentFilters) => {
    const options = {
      keys: ["name"], // Fields to search in
      includeScore: true,
      threshold: 0.4, // Adjust for fuzziness (0 = exact match, 1 = no match)
    };

    const fuse = new Fuse(data, options);

    const filteredByName = currentFilters.name
      ? fuse.search(currentFilters.name).map((result) => result.item)
      : data;

    const filteredResults = filteredByName.filter((item) => {
      const matchesCategory = currentFilters.category
        ? item.category
            ?.toLowerCase()
            .includes(currentFilters.category.toLowerCase())
        : true;
      const matchesSubcategory = currentFilters.subcategory
        ? item.subcategory
            ?.toLowerCase()
            .includes(currentFilters.subcategory.toLowerCase())
        : true;

      const matchesCreatedAt =
        (!currentFilters.createdAt.from ||
          new Date(item.createdAt) >=
            new Date(currentFilters.createdAt.from)) &&
        (!currentFilters.createdAt.to ||
          new Date(item.createdAt) <= new Date(currentFilters.createdAt.to));

      const matchesUpdatedAt =
        (!currentFilters.updatedAt.from ||
          new Date(item.updatedAt) >=
            new Date(currentFilters.updatedAt.from)) &&
        (!currentFilters.updatedAt.to ||
          new Date(item.updatedAt) <= new Date(currentFilters.updatedAt.to));

      const matchesPrice =
        (!currentFilters.price.from ||
          item.price >= currentFilters.price.from) &&
        (!currentFilters.price.to || item.price <= currentFilters.price.to);

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesCreatedAt &&
        matchesUpdatedAt &&
        matchesPrice
      );
    });

    console.log("Filtered results:", filteredResults.length);
    setFilteredResults(filteredResults);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFilterData = useCallback(debounce(filterData, 300), [data]);

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        [field]: value,
      };
      debouncedFilterData(updatedFilters); // Use the debounced function
      return updatedFilters;
    });
  };

  // Call filterData initially to populate filteredResults with default filters
  useEffect(() => {
    filterData(filters);
  }, [data]); // Run filterData whenever data changes

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleToggleColumn = (accessor) => {
    const newVisibility = {
      ...columnVisibility,
      [accessor]: !columnVisibility[accessor],
    };
    setColumnVisibility(newVisibility);
  };


  const handleGroupByCategoryAndSubcategory = (
    categoryColumnId,
    subcategoryColumnId
  ) => {
    const grouped = data.reduce((acc, item) => {
      const category = item[categoryColumnId] || "No Category";
      const subcategory = item[subcategoryColumnId] || "No Subcategory";
      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = [];
      acc[category][subcategory].push(item);
      return acc;
    }, {});

    const groupedArray = Object.keys(grouped).map((category) => ({
      category,
      subcategories: Object.keys(grouped[category]).map((subcategory) => ({
        subcategory,
        items: grouped[category][subcategory],
      })),
    }));

    setGroupedData(groupedArray);
    setCurrentPage(0);
  };

  const handleApplyGrouping = () => {
    if (selectedGroupColumn === "category") {
      handleGroupByCategoryAndSubcategory("category", "subcategory");
    }
  };

  const handleClearGrouping = () => {
    setGroupedData(null);
    setSelectedGroupColumn("");
  };

  // Function to clear sorting
  const handleClearSorting = () => {
    setSortBy([]); // Reset sorting to default state
  };

  const handleSort = (columnId) => {
    const newData = [...data];
    const sortedData = newData.sort((a, b) => {
      if (a[columnId] < b[columnId]) return -1;
      if (a[columnId] > b[columnId]) return 1;
      return 0;
    });
    setGroupedData(sortedData);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border px-2 py-1 rounded-md w-1/3"
        />

        <div className="flex space-x-2 items-center">
          <EyeIcon
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => setShowEyePanel(!showEyePanel)} // Toggle eye panel
          />
          <ArrowsUpDownIcon
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => setShowSortingPanel(!showSortingPanel)} // Toggle the sorting panel
          />
          <Bars3Icon
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => setShowColumnPanel(!showColumnPanel)}
          />
          <Squares2X2Icon
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => setShowGroupingPanel(!showGroupingPanel)}
          />
        </div>
      </div>

      {/* Table Component */}
      <table {...getTableProps()} className="min-w-full table-auto">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="border-b">
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-2 text-left text-gray-600 text-sm"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {displayedRows.length > 0 ? (
            displayedRows.map((item) => (
              <tr key={item.id} className="border-b">
                {columns.map((column) => (
                  <td
                    key={column.accessor}
                    className={`px-4 py-2 text-sm text-gray-700 ${
                      !columnVisibility[column.accessor] ? "hidden" : ""
                    }`}
                  >
                    {item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-2 text-center">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {startRow + 1} to{" "}
          {Math.min(
            endRow,
            filteredResults.length ||
              groupedData?.flatMap((group) =>
                group.subcategories.flatMap((subgroup) => subgroup.items)
              ).length ||
              0
          )}{" "}
          of{" "}
          {filteredResults.length ||
            groupedData?.flatMap((group) =>
              group.subcategories.flatMap((subgroup) => subgroup.items)
            ).length ||
            0}{" "}
          entries
        </span>

        <div className="flex justify-center space-x-1">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`px-3 py-1 border text-sm text-gray-700 rounded-md ${
                currentPage === index ? "bg-gray-200" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Eye Icon Panel */}
      {showEyePanel && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white p-4 border-l shadow-lg transform transition-transform duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Filters</h2>
            <XMarkIcon
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => setShowEyePanel(false)}
            />
          </div>

          <div className="mt-4">
            {/* Name Filter */}
            <input
              type="text"
              placeholder="Name"
              value={filters.name}
              onChange={(e) => {
                const newValue = e.target.value;
                handleFilterChange("name", newValue);
                setFilters((prev) => ({
                  ...prev,
                  name: newValue,
                }));
              }}
              className="border px-2 py-1 rounded-md w-full mb-2"
            />

            {/* Category Filter */}
            <input
              type="text"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border px-2 py-1 rounded-md w-full mb-2"
            />

            {/* Subcategory Filter */}
            <input
              type="text"
              placeholder="Subcategory"
              value={filters.subcategory}
              onChange={(e) =>
                handleFilterChange("subcategory", e.target.value)
              }
              className="border px-2 py-1 rounded-md w-full mb-2"
            />

            {/* Created At Filter */}
            <div className="mb-2">
              <label>Created At</label>
              <input
                type="date"
                value={filters.createdAt.from}
                onChange={(e) =>
                  handleFilterChange("createdAt", {
                    ...filters.createdAt,
                    from: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full mb-1"
              />
              <input
                type="date"
                value={filters.createdAt.to}
                onChange={(e) =>
                  handleFilterChange("createdAt", {
                    ...filters.createdAt,
                    to: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full"
              />
            </div>

            {/* Updated At Filter */}
            <div className="mb-2">
              <label>Updated At</label>
              <input
                type="date"
                value={filters.updatedAt.from}
                onChange={(e) =>
                  handleFilterChange("updatedAt", {
                    ...filters.updatedAt,
                    from: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full mb-1"
              />
              <input
                type="date"
                value={filters.updatedAt.to}
                onChange={(e) =>
                  handleFilterChange("updatedAt", {
                    ...filters.updatedAt,
                    to: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full"
              />
            </div>

            {/* Price Filter */}
            <div className="mb-2">
              <label>Price</label>
              <input
                type="number"
                placeholder="From"
                value={filters.price.from}
                onChange={(e) =>
                  handleFilterChange("price", {
                    ...filters.price,
                    from: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full mb-1"
              />
              <input
                type="number"
                placeholder="To"
                value={filters.price.to}
                onChange={(e) =>
                  handleFilterChange("price", {
                    ...filters.price,
                    to: e.target.value,
                  })
                }
                className="border px-2 py-1 rounded-md w-full"
              />
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setFilters({
                  name: "",
                  category: "",
                  subcategory: "",
                  createdAt: { from: "", to: "" },
                  updatedAt: { from: "", to: "" },
                  price: { from: "", to: "" },
                });
              }}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Grouping Panel */}
      {showGroupingPanel && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white p-4 border-l shadow-lg transform transition-transform duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Create Groups</h2>
            <XMarkIcon
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => setShowGroupingPanel(false)}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-600">Select Column</label>
            <select
              value={selectedGroupColumn}
              onChange={(e) => setSelectedGroupColumn(e.target.value)}
              className="mt-2 w-full border px-2 py-1 rounded-md"
            >
              <option value="">Select a column</option>
              <option value="category">Category</option>
              {/* Add other groupable columns here */}
            </select>

            <div className="mt-4">
              <button
                onClick={handleApplyGrouping}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Apply Grouping
              </button>
            </div>

            <div className="mt-2">
              <button
                onClick={handleClearGrouping}
                className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
              >
                Clear Grouping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Panel */}
      {showSortingPanel && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white p-4 border-l shadow-lg transform transition-transform duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Sorting Options</h2>
            <XMarkIcon
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => setShowSortingPanel(false)}
            />
          </div>
          <div className="mt-4">
            {showSortingPanel && (
              <div className="fixed top-0 right-0 w-72 h-full bg-white p-4 border-l shadow-lg transform transition-transform duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Sorting Options</h2>
                  <XMarkIcon
                    className="w-5 h-5 text-gray-600 cursor-pointer"
                    onClick={() => setShowSortingPanel(false)}
                  />
                </div>
                <div className="mt-4">
                  {columns && columns.length > 0 && (
                    <ul className="list-none">
                      {headerGroups.map((headerGroup) => (
                        <li key={headerGroup.id}>
                          {headerGroup.headers.map((column) => (
                            <div
                              key={column.id}
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                              className="py-2 px-2 m-4 border rounded-md border-blue-200 text-gray-600 text-sm cursor-pointer hover:text-blue-500"
                            >
                              {column.render("Header")}
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded-md w-full mt-4"
                  onClick={handleClearSorting}
                >
                  Clear Sort
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Column Panel */}
      {showColumnPanel && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white p-4 border-l shadow-lg transform transition-transform duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Show/Hide Columns</h2>
            <XMarkIcon
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => setShowColumnPanel(false)}
            />
          </div>

          <div className="mt-4">
            {columns.map((column) => (
              <div
                key={column.accessor}
                className="flex justify-between items-center py-2"
              >
                <span className="text-sm text-gray-600">{column.Header}</span>
                <input
                  type="checkbox"
                  checked={columnVisibility[column.accessor]}
                  onChange={() => handleToggleColumn(column.accessor)}
                  className="form-checkbox h-5 w-5"
                />
              </div>
            ))}

            <div className="mt-4">
              <button
                onClick={() =>
                  setColumnVisibility(
                    columns.reduce((acc, column) => {
                      acc[column.accessor] = true;
                      return acc;
                    }, {})
                  )
                }
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Show all columns
              </button>
            </div>

            <div className="mt-2">
              <button
                onClick={() =>
                  setColumnVisibility(
                    columns.reduce((acc, column) => {
                      acc[column.accessor] = false;
                      return acc;
                    }, {})
                  )
                }
                className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
              >
                Hide all columns
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableComponent;
