export interface UploadDocumentsDto {
  /**
   * Front side image of ID card in binary format
   */
  id_front: string;

  /**
   * Back side image of ID card in binary format
   */
  id_back: string;

  /**
   * Driver's license image in binary format
   */
  drivers_license: string;

  /**
   * Selfie image in binary format
   */
  selfie: string;

  /**
   * Full name of the user
   * @minLength 2
   * @maxLength 100
   */
  full_name: string;

  /**
   * Birth date of the user
   */
  birth_date: string;

  iin: string;

  /**
   * ID card expiry date
   */
  id_card_expiry: string;

  /**
   * Driver's license expiry date
   */
  drivers_license_expiry: string;
}
