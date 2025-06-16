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
    return typeof window !== "undefined" && !!window.flutter_inappwebview;
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

      // Вызываем Flutter handler с параметром типа камеры
      window.flutter_inappwebview
        ?.callHandler("capturePhoto", cameraType)
        .catch(reject);

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

      window.flutter_inappwebview?.callHandler("pickSinglePhoto").catch(reject);

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

      window.flutter_inappwebview
        ?.callHandler("pickMultiplePhotos", maxImages)
        .catch(reject);

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

      window.flutter_inappwebview
        ?.callHandler("captureMultiplePhotos", minPhotos, maxPhotos, cameraType)
        .catch(reject);

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
