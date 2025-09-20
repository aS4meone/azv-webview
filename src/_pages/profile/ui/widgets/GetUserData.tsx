import { IUser, UserRole } from "@/shared/models/types/user";

import { UserData } from "./UserData";
import { EditName } from "./EditName";
import UserDocumentsData from "./documents/UserDocumentsData";

const GetUserData = ({
  user,
  getUser,
  isLoading,
}: {
  user: IUser | null;
  getUser: () => void;
  isLoading: boolean;
}) => {
  return !user || isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <EditName user={user} />

      {user.role === UserRole.USER ||
        ((user.role === UserRole.PENDING || user.role === UserRole.CLIENT) && (
          <UserDocumentsData user={user} getUser={getUser} />
        ))}
    </div>
  );
};

export default GetUserData;
