import React from "react";

interface Props {
  children: React.ReactNode;
}
const ContentWrapper: React.FC<Props> = ({ children }) => {
  return <div className="h-full">{children}</div>;
};

export default ContentWrapper;
