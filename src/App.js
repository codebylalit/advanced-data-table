import React, { useMemo } from "react";
import AdvancedTable from "./components/AdvanceTable";
import sampleData from "./SampleData.json";

const App = () => {
 const columns = [
   {
     Header: "ID",
     accessor: "id",
   },
   {
     Header: "Name",
     accessor: "name",
   },
   {
     Header: "Category",
     accessor: "category",
   },
   {
     Header: "Subcategory",
     accessor: "subcategory",
   },
   {
     Header: "Created At",
     accessor: "createdAt",
   },
   {
     Header: "Updated At",
     accessor: "updatedAt",
   },
   {
     Header: "Price",
     accessor: "price",
   },
   {
     Header: "Sale Price",
     accessor: "sale_price",
   },
 ];


  return (
    <div className="App">
      <h1 className="text-2xl font-bold text-center mb-4">
        Advanced Data Table
      </h1>
      <AdvancedTable columns={columns} data={sampleData} />
    </div>
  );
};

export default App;
