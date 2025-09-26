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
  
  // Отладочная информация
  console.log("User documents data:", user.documents);
  
  const documents = [
    {
      id: 1,
      title: t("documents.idCard"),
      expiry: user?.documents.id_card.expiry || null,
      hasExpiry: user?.documents.id_card.expiry ? true : false,
      hasUrl: user?.documents.id_card.front_url || user?.documents.id_card.back_url ? true : false,
      frontUrl: user?.documents.id_card.front_url,
      backUrl: user?.documents.id_card.back_url,
    },
    {
      id: 2,
      title: t("documents.selfieWithLicense"),
      hasExpiry: user?.documents.selfie_with_license_url ? true : false,
      hasUrl: user?.documents.selfie_with_license_url ? true : false,
      url: user?.documents.selfie_with_license_url,
    },
    {
      id: 3,
      title: t("documents.driverLicense"),
      expiry: user?.documents.drivers_license.expiry || null,
      hasExpiry: user?.documents.drivers_license.expiry ? true : false,
      hasUrl: user?.documents.drivers_license.url ? true : false,
      url: user?.documents.drivers_license.url,
    },
    {
      id: 4,
      title: t("documents.selfie"),
      hasExpiry: user?.documents.selfie_url ? true : false,
      hasUrl: user?.documents.selfie_url ? true : false,
      url: user?.documents.selfie_url,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold text-[#191919]">
            {t("documentsAndData")}
          </h2>
          {user.documents.documents_verified && (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <GoodIcon />
            </div>
          )}
        </div>
        
        {!user.documents.documents_verified && (
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium mb-6",
              user.role === UserRole.PENDING
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {user.role === UserRole.PENDING
              ? t("documentsUnderReview")
              : t("documentsRequired")}
          </div>
        )}
        
        <div className="space-y-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#191919]">{doc.title}</h3>
                {doc.hasUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">{t("uploaded")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-500 font-medium">{t("notUploaded")}</span>
                  </div>
                )}
              </div>
              
              {doc.hasUrl && (
                <div className="space-y-4">
                  {/* Показываем фотки документов */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doc.id === 1 ? (
                      // Удостоверение личности - показываем обе стороны
                      <>
                        {doc.frontUrl && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <p className="text-sm font-medium text-gray-700">{t("frontSide")}</p>
                            </div>
                            <div className="relative group">
                              <img
                                src={doc.frontUrl ? `https://api.azvmotors.kz/${doc.frontUrl}` : `data:image/svg+xml;base64,${btoa(`
                                  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100%" height="100%" fill="#f3f4f6"/>
                                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                      Лицевая сторона не загружена
                                    </text>
                                  </svg>
                                `)}`}
                                alt="Front side of ID card"
                                className="w-full h-56 object-cover rounded-xl border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                                onLoad={() => console.log("Front image loaded:", `https://api.azvmotors.kz/${doc.frontUrl}`)}
                                onError={(e) => {
                                  console.log("Front image error:", `https://api.azvmotors.kz/${doc.frontUrl}`);
                                  const target = e.target as HTMLImageElement;
                                  target.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                      <rect width="100%" height="100%" fill="#f3f4f6"/>
                                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                        Ошибка загрузки изображения
                                      </text>
                                    </svg>
                                  `)}`;
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {doc.backUrl && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <p className="text-sm font-medium text-gray-700">{t("backSide")}</p>
                            </div>
                            <div className="relative group">
                              <img
                                src={doc.backUrl ? `https://api.azvmotors.kz/${doc.backUrl}` : `data:image/svg+xml;base64,${btoa(`
                                  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100%" height="100%" fill="#f3f4f6"/>
                                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                      Обратная сторона не загружена
                                    </text>
                                  </svg>
                                `)}`}
                                alt="Back side of ID card"
                                className="w-full h-56 object-cover rounded-xl border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                                onLoad={() => console.log("Back image loaded:", `https://api.azvmotors.kz/${doc.backUrl}`)}
                                onError={(e) => {
                                  console.log("Back image error:", `https://api.azvmotors.kz/${doc.backUrl}`);
                                  const target = e.target as HTMLImageElement;
                                  target.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                      <rect width="100%" height="100%" fill="#f3f4f6"/>
                                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                        Ошибка загрузки изображения
                                      </text>
                                    </svg>
                                  `)}`;
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Остальные документы - показываем одну фотку
                      <div className="space-y-3">
                        <div className="relative group">
                          <img
                            src={doc.url ? `https://api.azvmotors.kz/${doc.url}` : `data:image/svg+xml;base64,${btoa(`
                              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="#f3f4f6"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                  Изображение не загружено
                                </text>
                              </svg>
                            `)}`}
                            alt={doc.title}
                            className="w-full h-56 object-cover rounded-xl border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                            onLoad={() => console.log("Document image loaded:", `https://api.azvmotors.kz/${doc.url}`)}
                            onError={(e) => {
                              console.log("Document image error:", `https://api.azvmotors.kz/${doc.url}`);
                              const target = e.target as HTMLImageElement;
                              target.src = `data:image/svg+xml;base64,${btoa(`
                                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="100%" height="100%" fill="#f3f4f6"/>
                                  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                                    Ошибка загрузки изображения
                                  </text>
                                </svg>
                              `)}`;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {doc.hasExpiry && doc.expiry && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-700 font-medium">
                          {t("validUntilDate")} {new Date(doc.expiry).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <UploadDocuments getUser={getUser} user={user} />
    </>
  );
};

export default UserDocumentsData;
