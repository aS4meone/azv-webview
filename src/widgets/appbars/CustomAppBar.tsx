import { ROUTES } from "@/shared/constants/routes";
import { ArrowLeftIcon, LogoIcon } from "@/shared/icons";
import { Button } from "@/shared/ui";
import Link from "next/link";
import React from "react";

interface ICustomAppBar {
  title?: string;
  backHref: string;
}

const CustomAppBar = ({ title, backHref }: ICustomAppBar) => {
  return (
    <header className="flex items-center justify-between px-8 py-3">
      <div className="flex items-center">
        <Link href={backHref}>
          <Button variant="icon" className="mr-2">
            <ArrowLeftIcon color="black" />
          </Button>
        </Link>
        {title && <h2 className="text-[20px] text-[#191919]">{title}</h2>}
      </div>

      <LogoIcon isBlack />
    </header>
  );
};

export default CustomAppBar;
