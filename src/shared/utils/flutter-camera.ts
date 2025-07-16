interface FlutterCameraResult {
  success: boolean;
  data?: string | string[];
  type?: "single" | "multiple";
  count?: number;
  error?: string;
}

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (
        handlerName: string,
        ...args: unknown[]
      ) => Promise<unknown>;
    };
    flutter_channels?: {
      capturePhoto: (cameraType: string) => void;
      pickSinglePhoto: () => void;
      pickMultiplePhotos: (maxImages: number) => void;
      captureMultiplePhotos: (
        minPhotos: number,
        maxPhotos: number,
        cameraType: string
      ) => void;
      getCurrentPosition: () => void;
      logout: () => void;
    };
    flutterCameraResult?: (result: FlutterCameraResult) => void;
  }
}

export class FlutterCamera {
  private static resultCallback:
    | ((result: FlutterCameraResult) => void)
    | null = null;

  /**
   * Проверяет, доступна ли Flutter камера
   */
  static isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      (!!window.flutter_inappwebview ||
        !!window.flutter_channels ||
        // Проверяем прямой доступ к JavaScript channels
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (window as any).capturePhoto !== "undefined")
    );
  }

  /**
   * Вызывает JavaScript channel напрямую
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static callChannel(channelName: string, ...args: any[]): boolean {
    try {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowWithChannels = window as any;
        const channel = windowWithChannels[channelName];

        if (channel && typeof channel.postMessage === "function") {
          if (args.length === 1) {
            // Если это объект, преобразуем в JSON для Flutter
            if (typeof args[0] === "object" && args[0] !== null) {
              channel.postMessage(JSON.stringify(args[0]));
            } else {
              channel.postMessage(String(args[0]));
            }
          } else if (args.length > 1) {
            channel.postMessage(JSON.stringify(args));
          } else {
            channel.postMessage("");
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(`Error calling channel ${channelName}:`, e);
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
      throw new Error("Flutter camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: FlutterCameraResult) => {
        if (result.success && typeof result.data === "string") {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to capture photo"));
        }
        this.resultCallback = null;
      };

      // Устанавливаем глобальный callback
      window.flutterCameraResult = this.resultCallback;

      // Пробуем разные способы вызова
      let success = false;

      // 1. Прямой вызов JavaScript channel
      if (this.callChannel("capturePhoto", cameraType)) {
        console.log("📱 Используем прямой JavaScript channel для capturePhoto");
        success = true;
      }
      // 2. Через flutter_channels
      else if (window.flutter_channels) {
        console.log("📱 Используем flutter_channels для capturePhoto");
        window.flutter_channels.capturePhoto(cameraType);
        success = true;
      }
      // 3. Через flutter_inappwebview
      else if (window.flutter_inappwebview) {
        console.log("📱 Используем flutter_inappwebview для capturePhoto");
        window.flutter_inappwebview
          .callHandler("capturePhoto", cameraType)
          .catch(reject);
        success = true;
      }

      if (!success) {
        reject(new Error("No Flutter communication method available"));
        return;
      }

      // Таймаут на случай если результат не придет
      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Camera capture timeout"));
          this.resultCallback = null;
        }
      }, 30000);
    });
  }

  /**
   * Выбрать одно фото из галереи
   */
  static async pickSinglePhoto(): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error("Flutter camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: FlutterCameraResult) => {
        if (result.success && typeof result.data === "string") {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to pick photo"));
        }
        this.resultCallback = null;
      };

      window.flutterCameraResult = this.resultCallback;

      let success = false;

      if (this.callChannel("pickSinglePhoto")) {
        console.log(
          "📱 Используем прямой JavaScript channel для pickSinglePhoto"
        );
        success = true;
      } else if (window.flutter_channels) {
        console.log("📱 Используем flutter_channels для pickSinglePhoto");
        window.flutter_channels.pickSinglePhoto();
        success = true;
      } else if (window.flutter_inappwebview) {
        console.log("📱 Используем flutter_inappwebview для pickSinglePhoto");
        window.flutter_inappwebview
          .callHandler("pickSinglePhoto")
          .catch(reject);
        success = true;
      }

      if (!success) {
        reject(new Error("No Flutter communication method available"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Photo picker timeout"));
          this.resultCallback = null;
        }
      }, 30000);
    });
  }

  /**
   * Выбрать несколько фото из галереи
   */
  static async pickMultiplePhotos(maxImages: number = 10): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error("Flutter camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: FlutterCameraResult) => {
        if (result.success && Array.isArray(result.data)) {
          resolve(result.data);
        } else {
          reject(new Error(result.error || "Failed to pick photos"));
        }
        this.resultCallback = null;
      };

      window.flutterCameraResult = this.resultCallback;

      let success = false;

      if (this.callChannel("pickMultiplePhotos", { maxImages })) {
        console.log(
          "📱 Используем прямой JavaScript channel для pickMultiplePhotos"
        );
        success = true;
      } else if (window.flutter_channels) {
        console.log("📱 Используем flutter_channels для pickMultiplePhotos");
        window.flutter_channels.pickMultiplePhotos(maxImages);
        success = true;
      } else if (window.flutter_inappwebview) {
        console.log(
          "📱 Используем flutter_inappwebview для pickMultiplePhotos"
        );
        window.flutter_inappwebview
          .callHandler("pickMultiplePhotos", maxImages)
          .catch(reject);
        success = true;
      }

      if (!success) {
        reject(new Error("No Flutter communication method available"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Multiple photo picker timeout"));
          this.resultCallback = null;
        }
      }, 30000);
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
      throw new Error("Flutter camera is not available");
    }

    return new Promise((resolve, reject) => {
      this.resultCallback = (result: FlutterCameraResult) => {
        if (result.success && Array.isArray(result.data)) {
          resolve(result.data);
        } else {
          reject(
            new Error(result.error || "Failed to capture multiple photos")
          );
        }
        this.resultCallback = null;
      };

      window.flutterCameraResult = this.resultCallback;

      let success = false;

      // 1. Прямой вызов JavaScript channel
      if (
        this.callChannel("captureMultiplePhotos", {
          minPhotos,
          maxPhotos,
          cameraType,
        })
      ) {
        console.log(
          "📱 Используем прямой JavaScript channel для captureMultiplePhotos",
          {
            minPhotos,
            maxPhotos,
            cameraType,
          }
        );
        success = true;
      }
      // 2. Через flutter_channels
      else if (window.flutter_channels) {
        console.log(
          "📱 Используем flutter_channels для captureMultiplePhotos",
          {
            minPhotos,
            maxPhotos,
            cameraType,
          }
        );
        window.flutter_channels.captureMultiplePhotos(
          minPhotos,
          maxPhotos,
          cameraType
        );
        success = true;
      }
      // 3. Через flutter_inappwebview
      else if (window.flutter_inappwebview) {
        console.log(
          "📱 Используем flutter_inappwebview для captureMultiplePhotos"
        );
        window.flutter_inappwebview
          .callHandler(
            "captureMultiplePhotos",
            minPhotos,
            maxPhotos,
            cameraType
          )
          .catch(reject);
        success = true;
      }

      if (!success) {
        reject(new Error("No Flutter communication method available"));
        return;
      }

      setTimeout(() => {
        if (this.resultCallback) {
          reject(new Error("Multiple photo capture timeout"));
          this.resultCallback = null;
        }
      }, 60000); // Больший таймаут для множественной съемки
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
