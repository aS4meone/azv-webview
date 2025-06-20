import { LogoIcon } from "@/shared/icons";
import { ArrowLeftIcon } from "@/shared/icons/";
import { Button } from "@/shared/ui";

import React from "react";

const DefaultAppBar = ({ onClick }: { onClick?: () => void }) => {
  return (
    <header className="flex items-center justify-between px-10 py-4">
      <Button variant="icon" onClick={onClick}>
        <ArrowLeftIcon />
      </Button>
      <LogoIcon />
    </header>
  );
};

export default DefaultAppBar;
