import React from "react";
import Navbar from "./Navbar";
import ContentWrapper from "./ContentWrapper";
import { Toaster } from "@frontend/components/ui";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Toaster />
      <Navbar />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};

export default Layout;
