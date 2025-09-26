"use client";

import { IUser } from "@/shared/models/types/user";
import { UploadDocuments } from "./documents/UploadDocuments";

interface UploadDocumentsButtonProps {
  user: IUser;
  getUser: () => void;
}

export const UploadDocumentsButton = ({ user, getUser }: UploadDocumentsButtonProps) => {
  return <UploadDocuments getUser={getUser} user={user} />;
};