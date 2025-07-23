interface ReactNativeCameraResult {
  success: boolean;
  data?: string | string[];
  type?: "single" | "multiple";
  count?: number;
  error?: string;
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    reactNativeCameraResult?: (result: ReactNativeCameraResult) => void;
  }
}

export class FlutterCamera {
  private static resultCallback:
    | ((result: ReactNativeCameraResult) => void)
    | null = null;

  /**
   * Проверяет, доступна ли React Native камера
   */
  static isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.ReactNativeWebView;
  }

  /**
   * Отправляет сообщение в React Native
   */
  private static sendMessage(action: string, data?: any): boolean {
    try {
      if (typeof window !== "undefined" && window.ReactNativeWebView) {
        const message = JSON.stringify({ action, data });
        window.ReactNativeWebView.postMessage(message);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Error sending message ${action}:`, e);
      return false;
    }
  }

  /**
   * Сделать фото с камеры
   */
  static async capturePhoto(
    cameraType: "front" | "back" = "back"
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error("React Native camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: ReactNativeCameraResult) => {
        if (result.success && typeof result.data === "string") {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to capture photo"));
        }
        this.resultCallback = null;
      };

      // Устанавливаем глобальный callback
      window.reactNativeCameraResult = this.resultCallback;
      console.log("📱 Callback установлен:", !!window.reactNativeCameraResult);

      // Отправляем сообщение в React Native
      if (this.sendMessage("capturePhoto", cameraType)) {
        console.log("📱 Отправляем capturePhoto в React Native");
      } else {
        reject(new Error("Failed to send message to React Native"));
        return;
      }

      // Таймаут на случай если результат не придет
      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Camera capture timeout (30s)"));
          this.resultCallback = null;
        }
      }, 10000); // Уменьшаем таймаут до 10 секунд
    });
  }

  /**
   * Выбрать одно фото из галереи
   */
  static async pickSinglePhoto(): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error("React Native camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: ReactNativeCameraResult) => {
        if (result.success && typeof result.data === "string") {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to pick photo"));
        }
        this.resultCallback = null;
      };

      window.reactNativeCameraResult = this.resultCallback;

      if (this.sendMessage("pickSinglePhoto")) {
        console.log("📱 Отправляем pickSinglePhoto в React Native");
      } else {
        reject(new Error("Failed to send message to React Native"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Photo picker timeout (10s)"));
          this.resultCallback = null;
        }
      }, 10000); // Уменьшаем таймаут до 10 секунд
    });
  }

  /**
   * Выбрать несколько фото из галереи
   */
  static async pickMultiplePhotos(maxImages: number = 10): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error("React Native camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: ReactNativeCameraResult) => {
        if (result.success && Array.isArray(result.data)) {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to pick photos"));
        }
        this.resultCallback = null;
      };

      window.reactNativeCameraResult = this.resultCallback;

      if (this.sendMessage("pickMultiplePhotos", { maxImages })) {
        console.log("📱 Отправляем pickMultiplePhotos в React Native");
      } else {
        reject(new Error("Failed to send message to React Native"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Multiple photo picker timeout (10s)"));
          this.resultCallback = null;
        }
      }, 10000); // Уменьшаем таймаут до 10 секунд
    });
  }

  /**
   * Сделать несколько фото с камеры подряд
   */
  static async captureMultiplePhotos(
    minPhotos: number = 1,
    maxPhotos: number = 10,
    cameraType: "front" | "back" = "back"
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error("React Native camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: ReactNativeCameraResult) => {
        if (result.success && Array.isArray(result.data)) {
          resolve(result.data);
        } else {
          reject(
            new Error(result.error || "Failed to capture multiple photos")
          );
        }
        this.resultCallback = null;
      };

      window.reactNativeCameraResult = this.resultCallback;

      if (
        this.sendMessage("captureMultiplePhotos", {
          minPhotos,
          maxPhotos,
          cameraType,
        })
      ) {
        console.log("📱 Отправляем captureMultiplePhotos в React Native", {
          minPhotos,
          maxPhotos,
          cameraType,
        });
      } else {
        reject(new Error("Failed to send message to React Native"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Multiple photo capture timeout (20s)"));
          this.resultCallback = null;
        }
      }, 20000); // Уменьшаем таймаут до 20 секунд для множественной съемки
    });
  }

  /**
   * Конвертирует base64 строку в File объект
   */
  static base64ToFile(
    base64String: string,
    filename: string = "photo.jpg"
  ): File {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Конвертирует массив base64 строк в массив File объектов
   */
  static base64ArrayToFiles(
    base64Array: string[],
    filenamePrefix: string = "photo"
  ): File[] {
    return base64Array.map((base64, index) =>
      this.base64ToFile(base64, `${filenamePrefix}_${index + 1}.jpg`)
    );
  }
}
