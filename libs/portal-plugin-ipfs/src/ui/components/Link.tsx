import React from "react";
import { useNavigate } from "react-router";

interface LinkProps {
  path: string;
  children: React.ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ path, children, className }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Update URL search params without triggering full route re-render
    const searchParams = new URLSearchParams(window.location.search);
    if (path === "/") {
      searchParams.delete("path");
    } else {
      searchParams.set("path", path);
    }

    navigate({ search: searchParams.toString() }, { replace: true });
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};
