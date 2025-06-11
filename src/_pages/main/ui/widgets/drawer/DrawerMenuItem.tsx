import { ArrowLeftIcon } from "@/shared/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";

export interface DrawerMenuItemProps {
  translationKey: string;
  href: string;
}

export const DrawerMenuItem = ({
  translationKey,
  href,
}: DrawerMenuItemProps) => {
  const t = useTranslations();

  return (
    <Link
      className="px-8 flex items-center space-x-3 w-full text-left py-4 rounded-lg hover:bg-gray-800 transition-colors group"
      href={href}
    >
      <span className="text-white flex-1">{t(translationKey)}</span>
      <ArrowLeftIcon className="rotate-180" />
    </Link>
  );
};
