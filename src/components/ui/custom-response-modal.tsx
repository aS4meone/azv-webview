import React from "react";
import { CustomPushScreen } from "./custom-push-screen";
import { ResponseBottomModalContent } from "@/shared/ui/modal";
import { ResponseBottomModalProps } from "@/shared/ui";

export const CustomResponseModal = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText,
  onButtonClick,
  type = "success",
}: ResponseBottomModalProps) => {
  return (
    <CustomPushScreen
      isOpen={isOpen}
      onClose={onClose}
      withHeader={false}
      fullScreen={false}
      isCloseable={true}
      direction="bottom"
      height="auto"
    >
      <ResponseBottomModalContent
        type={type}
        title={title}
        description={description}
        buttonText={buttonText}
        onButtonClick={async () => {
          onButtonClick();
        }}
      />
    </CustomPushScreen>
  );
};
