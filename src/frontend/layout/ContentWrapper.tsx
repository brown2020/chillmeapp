import React from "react";

interface Props {
  children: React.ReactNode;
}
const ContentWrapper: React.FC<Props> = ({ children }) => {
  return <div className="mx-4 my-4">{children}</div>;
};

export default ContentWrapper;
