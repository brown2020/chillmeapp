import React from "react";
import Navbar from "./Navbar";
import ContentWrapper from "./ContentWrapper";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Navbar />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};

export default Layout;
