import React from "react";
import { handleLink } from "@/shared/utils/handleLink";

interface WebViewLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const WebViewLink: React.FC<WebViewLinkProps> = ({
  href,
  children,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleLink(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </a>
  );
};
