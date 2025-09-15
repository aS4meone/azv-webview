import { IUser, UserRole } from "@/shared/models/types/user";

import { UploadDocuments } from "./UploadDocuments";
import { GoodIcon } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";

const UserDocumentsData = ({
  user,
  getUser,
}: {
  user: IUser;
  getUser: () => void;
}) => {
  const t = useTranslations("profile");
  
  const documents = [
    {
      id: 1,
      title: t("documents.idCard"),
      expiry: user?.documents.id_card.expiry || "-",
      hasExpiry: user?.documents.id_card.expiry ? true : false,
    },
    {
      id: 2,
      title: t("documents.selfieWithLicense"),
      hasExpiry: user?.documents.selfie_with_license_url ? true : false,
    },
    {
      id: 3,
      title: t("documents.driverLicense"),
      expiry: user?.documents.drivers_license.expiry || "-",
      hasExpiry: user?.documents.drivers_license.expiry ? true : false,
    },
    {
      id: 4,
      title: t("documents.selfie"),
      hasExpiry: user?.documents.selfie_url ? true : false,
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-[18px] text-[#191919] flex flex-row gap-2">
          <span>{t("documentsAndData")}</span>
          {user.documents.documents_verified ? <GoodIcon /> : null}
        </h2>
        {!user.documents.documents_verified && (
          <div
            className={cn(
              "rounded-[40px] px-4 py-1 text-[14px]",
              user.role === UserRole.PENDING
                ? "bg-yellow-300/15 text-yellow-500"
                : "bg-[#F3D8D8] text-[#E56D6D]"
            )}
          >
            {user.role === UserRole.PENDING
              ? t("documentsUnderReview")
              : t("documentsRequired")}
          </div>
        )}
        <div className="space-y-2 rounded-[18px] overflow-hidden bg-[#F6F6F6]">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-center flex-col p-4 border-b border-[#DADADA] last:border-b-0"
            >
              <div className="text-[#191919] text-[14px]">{doc.title}</div>
              {doc.hasExpiry ? (
                doc.id === 2 || doc.id === 4 ? (
                  <div className="text-[10px] text-[#191919]">{t("uploaded")}</div>
                ) : (
                  <div className="text-[10px] text-[#191919]">
                    {t("validUntilDate")}{" "}
                    {doc.expiry
                      ? new Date(doc.expiry).toLocaleDateString("ru-RU")
                      : t("notSpecified")}
                  </div>
                )
              ) : (
                <div className="text-[10px] text-[#191919]">{t("notUploaded")}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <UploadDocuments getUser={getUser} />
    </>
  );
};

export default UserDocumentsData;
