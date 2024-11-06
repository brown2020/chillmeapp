import React from "react";

interface Props {
  children: React.ReactNode;
}
const ContentWrapper: React.FC<Props> = ({ children }) => {
  return <div className="px-4 py-4">{children}</div>;
};

export default ContentWrapper;
