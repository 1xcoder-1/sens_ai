import React from "react";

const MainLayout = async ({ children }) => {
  return <div className="container mx-auto mt-24">{children}</div>;
};

export default MainLayout;