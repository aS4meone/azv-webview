import { ICar, CarStatus, CarBodyType, TransmissionType } from "../models/types/car";
import { vehicleApi } from "../api/routes/vehicles";

// Функция для получения машин из API + fallback данные
export const getMockCars = async (): Promise<ICar[]> => {
  try {
    const response = await vehicleApi.getVehicles();
    const apiCars = response?.vehicles || [];
    
    // Создаем уникальные ID для fallback данных чтобы избежать дублирования
    const maxApiId = apiCars.length > 0 ? Math.max(...apiCars.map(car => car.id)) : 0;
    const fallbackCarsWithUniqueIds = fallbackCars.map((car, index) => ({
      ...car,
      id: maxApiId + index + 1 // Начинаем с maxApiId + 1
    }));
    
    // Объединяем данные с API с fallback данными для создания впечатления что машин много
    const combinedCars = [...apiCars, ...fallbackCarsWithUniqueIds];
    
    console.log(`[getMockCars] API cars: ${apiCars.length}, Fallback cars: ${fallbackCarsWithUniqueIds.length}, Total: ${combinedCars.length}`);
    
    return combinedCars;
  } catch (error) {
    console.error("Failed to fetch vehicles from API:", error);
    // В случае ошибки возвращаем fallback данные
    console.log(`[getMockCars] Using fallback data: ${fallbackCars.length} cars`);
    return fallbackCars;
  }
};

// Готовые данные 20 машин (fallback)
const fallbackCars: ICar[] = [
    // Все машины со статусом occupied с казахстанскими номерами
    { id: 1, name: "Toyota Camry 2020", plate_number: "463 PP 02", latitude: 43.2220, longitude: 76.8512, course: 45, fuel_level: 85, price_per_minute: 25.50, price_per_hour: 1530, price_per_day: 24480, engine_volume: 2.5, year: 2020, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://pictures.dealer.com/p/pearsontoyota/1048/5ee29a438d33791bcdc5b4c49da27974x.jpg?impolicy=downsize_bkpt&w=2500"], owner_id: 1, current_renter_id: 101, status: CarStatus.occupied, open_price: 2500, owned_car: false, rental_id: 1, description: "Отличное состояние, 2020 года выпуска. Седан с 2.5л двигателем." },
    { id: 2, name: "Honda CR-V 2019", plate_number: "463 PP 03", latitude: 43.2250, longitude: 76.8550, course: 90, fuel_level: 70, price_per_minute: 30.00, price_per_hour: 1800, price_per_day: 28800, engine_volume: 2.0, year: 2019, drive_type: 2, transmission_type: TransmissionType.CVT, body_type: CarBodyType.SUV, photos: ["https://di-uploads-pod18.dealerinspire.com/executivehonda/uploads/2019/05/2019-CR-V.jpg"], owner_id: 2, current_renter_id: 102, status: CarStatus.occupied, open_price: 3000, owned_car: false, rental_id: 2, description: "Отличное состояние, 2019 года выпуска. Внедорожник с 2.0л двигателем." },
    { id: 3, name: "Nissan Altima 2021", plate_number: "463 PP 04", latitude: 43.2200, longitude: 76.8500, course: 180, fuel_level: 95, price_per_minute: 22.75, price_per_hour: 1365, price_per_day: 21840, engine_volume: 2.5, year: 2021, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://wieck-nissanao-production.s3.amazonaws.com/photos/4233fdf88fcdc78f42cbdc0ca98209c4251f2af8/preview-928x522.jpg"], owner_id: 3, current_renter_id: 103, status: CarStatus.occupied, open_price: 2200, owned_car: false, rental_id: 3, description: "Отличное состояние, 2021 года выпуска. Седан с 2.5л двигателем." },
    { id: 4, name: "Hyundai Tucson 2020", plate_number: "463 PP 05", latitude: 43.2280, longitude: 76.8520, course: 270, fuel_level: 60, price_per_minute: 28.50, price_per_hour: 1710, price_per_day: 27360, engine_volume: 2.0, year: 2020, drive_type: 2, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.CROSSOVER, photos: ["https://di-uploads-pod11.dealerinspire.com/lithiahyundaiofreno/uploads/2020/07/2020-Hyundai-Santa-Fe-compare.png"], owner_id: 4, current_renter_id: 104, status: CarStatus.occupied, open_price: 2800, owned_car: false, rental_id: 4, description: "Отличное состояние, 2020 года выпуска. Кроссовер с 2.0л двигателем." },
    { id: 5, name: "Kia Sportage 2019", plate_number: "463 PP 06", latitude: 43.2230, longitude: 76.8530, course: 135, fuel_level: 80, price_per_minute: 26.25, price_per_hour: 1575, price_per_day: 25200, engine_volume: 2.4, year: 2019, drive_type: 2, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SUV, photos: ["https://di-uploads-pod15.dealerinspire.com/wilsonkia/uploads/2019/03/2019-Kia-Sportage-EX.png"], owner_id: 5, current_renter_id: 105, status: CarStatus.occupied, open_price: 2600, owned_car: false, rental_id: 5, description: "Отличное состояние, 2019 года выпуска. Внедорожник с 2.4л двигателем." },
    { id: 6, name: "BMW 3 Series 2021", plate_number: "463 PP 07", latitude: 43.2220, longitude: 76.8512, course: 45, fuel_level: 75, price_per_minute: 45.00, price_per_hour: 2700, price_per_day: 43200, engine_volume: 2.0, year: 2021, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://www.bmw.co.za/content/dam/bmw/common/all-models/3-series/sedan/2022/highlights/bmw-3-series-sedan-cp-design-ext-desktop.jpg/jcr:content/renditions/cq5dam.resized.img.1680.large.time1650452824822.jpg"], owner_id: 6, current_renter_id: 106, status: CarStatus.occupied, open_price: 4500, owned_car: false, rental_id: 6, description: "Отличное состояние, 2021 года выпуска. Седан с 2.0л двигателем." },
    { id: 7, name: "Mercedes-Benz C-Class 2020", plate_number: "463 PP 08", latitude: 43.2250, longitude: 76.8550, course: 90, fuel_level: 65, price_per_minute: 50.25, price_per_hour: 3015, price_per_day: 48240, engine_volume: 2.0, year: 2020, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://i.pinimg.com/736x/d5/87/38/d58738bd47b6ffdb35dd30890e61370d.jpg"], owner_id: 7, current_renter_id: 107, status: CarStatus.occupied, open_price: 5000, owned_car: false, rental_id: 7, description: "Отличное состояние, 2020 года выпуска. Седан с 2.0л двигателем." },
    { id: 8, name: "Audi A4 2022", plate_number: "463 PP 09", latitude: 43.2200, longitude: 76.8500, course: 180, fuel_level: 85, price_per_minute: 47.50, price_per_hour: 2850, price_per_day: 45600, engine_volume: 2.0, year: 2022, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://media.ed.edmunds-media.com/audi/a4/2022/oem/2022_audi_a4_sedan_prestige-s-line_fbdg_oem_2_815x543.jpg"], owner_id: 8, current_renter_id: 108, status: CarStatus.occupied, open_price: 4800, owned_car: false, rental_id: 8, description: "Отличное состояние, 2022 года выпуска. Седан с 2.0л двигателем." },
    { id: 9, name: "Lexus RX 2021", plate_number: "463 PP 10", latitude: 43.2280, longitude: 76.8520, course: 270, fuel_level: 70, price_per_minute: 55.75, price_per_hour: 3345, price_per_day: 53520, engine_volume: 3.5, year: 2021, drive_type: 2, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SUV, photos: ["https://i.pinimg.com/736x/81/55/c6/8155c6f5626b0c9c436c180ad06a2e8a.jpg"], owner_id: 9, current_renter_id: 109, status: CarStatus.occupied, open_price: 5500, owned_car: false, rental_id: 9, description: "Отличное состояние, 2021 года выпуска. Внедорожник с 3.5л двигателем." },
    { id: 10, name: "Volkswagen Tiguan 2020", plate_number: "463 PP 11", latitude: 43.2230, longitude: 76.8530, course: 135, fuel_level: 55, price_per_minute: 35.25, price_per_hour: 2115, price_per_day: 33840, engine_volume: 2.0, year: 2020, drive_type: 2, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.CROSSOVER, photos: ["https://cdn.jdpower.com/JDPA_2020%20Volkswagen%20Tiguan%20SEL%20Premium%20R-Line%20White%20Front%20View.jpg"], owner_id: 10, current_renter_id: 110, status: CarStatus.occupied, open_price: 3500, owned_car: false, rental_id: 10, description: "Отличное состояние, 2020 года выпуска. Кроссовер с 2.0л двигателем." },
    { id: 11, name: "Mazda CX-5 2019", plate_number: "463 PP 12", latitude: 43.2220, longitude: 76.8512, course: 45, fuel_level: 30, price_per_minute: 32.00, price_per_hour: 1920, price_per_day: 30720, engine_volume: 2.5, year: 2019, drive_type: 2, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SUV, photos: ["https://i.pinimg.com/1200x/bd/3e/68/bd3e6807d4955fa9149f770f83ca2f94.jpg"], owner_id: 11, current_renter_id: 111, status: CarStatus.occupied, open_price: 3200, owned_car: false, rental_id: 11, description: "Отличное состояние, 2019 года выпуска. Внедорожник с 2.5л двигателем." },
    { id: 12, name: "Subaru Outback 2020", plate_number: "463 PP 13", latitude: 43.2250, longitude: 76.8550, course: 90, fuel_level: 25, price_per_minute: 38.50, price_per_hour: 2310, price_per_day: 36960, engine_volume: 2.5, year: 2020, drive_type: 2, transmission_type: TransmissionType.CVT, body_type: CarBodyType.WAGON, photos: ["https://i.pinimg.com/1200x/26/42/c9/2642c9ce21e96a5da9d4f5909168b38e.jpg"], owner_id: 12, current_renter_id: 112, status: CarStatus.occupied, open_price: 3800, owned_car: false, rental_id: 12, description: "Отличное состояние, 2020 года выпуска. Универсал с 2.5л двигателем." },
    { id: 13, name: "Infiniti Q50 2021", plate_number: "463 PP 14", latitude: 43.2200, longitude: 76.8500, course: 180, fuel_level: 90, price_per_minute: 42.75, price_per_hour: 2565, price_per_day: 41040, engine_volume: 3.0, year: 2021, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://i.pinimg.com/736x/cd/79/c1/cd79c1338e30af7ee6f76eb99ecd0622.jpg"], owner_id: 13, current_renter_id: 113, status: CarStatus.occupied, open_price: 4300, owned_car: false, rental_id: 13, description: "Отличное состояние, 2021 года выпуска. Седан с 3.0л двигателем." },
    { id: 14, name: "Acura TLX 2022", plate_number: "463 PP 15", latitude: 43.2280, longitude: 76.8520, course: 270, fuel_level: 80, price_per_minute: 40.25, price_per_hour: 2415, price_per_day: 38640, engine_volume: 2.4, year: 2022, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://i.pinimg.com/736x/1e/f7/4f/1ef74f3eb94fe96848968ac7c6554aec.jpg"], owner_id: 14, current_renter_id: 114, status: CarStatus.occupied, open_price: 4000, owned_car: false, rental_id: 14, description: "Отличное состояние, 2022 года выпуска. Седан с 2.4л двигателем." },
    { id: 15, name: "Genesis G70 2021", plate_number: "463 PP 16", latitude: 43.2230, longitude: 76.8530, course: 135, fuel_level: 70, price_per_minute: 48.50, price_per_hour: 2910, price_per_day: 46560, engine_volume: 2.0, year: 2021, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.SEDAN, photos: ["https://i.pinimg.com/1200x/40/03/07/4003075034a8cb101f12b106ccc1cce2.jpg"], owner_id: 15, current_renter_id: 115, status: CarStatus.occupied, open_price: 4900, owned_car: false, rental_id: 15, description: "Отличное состояние, 2021 года выпуска. Седан с 2.0л двигателем." },
    { id: 16, name: "Tesla Model 3 2022", plate_number: "463 PP 17", latitude: 43.2220, longitude: 76.8512, course: 45, fuel_level: 95, price_per_minute: 60.00, price_per_hour: 3600, price_per_day: 57600, engine_volume: 0.0, year: 2022, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.ELECTRIC, photos: ["https://i.pinimg.com/1200x/ea/b5/63/eab5637e52fd47130a9a7ab7ad434d78.jpg"], owner_id: 16, current_renter_id: 116, status: CarStatus.occupied, open_price: 6000, owned_car: false, rental_id: 16, description: "Отличное состояние, 2022 года выпуска. Электромобиль." },
    { id: 17, name: "Porsche 911 2020", plate_number: "463 PP 18", latitude: 43.2250, longitude: 76.8550, course: 90, fuel_level: 60, price_per_minute: 75.25, price_per_hour: 4515, price_per_day: 72240, engine_volume: 3.0, year: 2020, drive_type: 1, transmission_type: TransmissionType.MANUAL, body_type: CarBodyType.COUPE, photos: ["https://i.pinimg.com/736x/33/11/6f/33116fe4122ee922f9ac10cdc13c5b13.jpg"], owner_id: 17, current_renter_id: 117, status: CarStatus.occupied, open_price: 7500, owned_car: false, rental_id: 17, description: "Отличное состояние, 2020 года выпуска. Купе с 3.0л двигателем." },
    { id: 18, name: "Ferrari 488 2021", plate_number: "463 PP 19", latitude: 43.2220, longitude: 76.8512, course: 45, fuel_level: 80, price_per_minute: 85.50, price_per_hour: 5130, price_per_day: 82080, engine_volume: 3.9, year: 2021, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.COUPE, photos: ["https://i.pinimg.com/1200x/3d/63/34/3d63341cb51e560ad1f007d3dac49e01.jpg"], owner_id: 18, current_renter_id: 118, status: CarStatus.occupied, open_price: 8500, owned_car: false, rental_id: 18, description: "Отличное состояние, 2021 года выпуска. Купе с 3.9л двигателем." },
    { id: 19, name: "Lamborghini Huracan 2022", plate_number: "463 PP 20", latitude: 43.2250, longitude: 76.8550, course: 90, fuel_level: 75, price_per_minute: 95.75, price_per_hour: 5745, price_per_day: 91920, engine_volume: 5.2, year: 2022, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.COUPE, photos: ["https://i.pinimg.com/1200x/34/ab/df/34abdf267fb11e538bff5826dc06e9f6.jpg"], owner_id: 19, current_renter_id: 119, status: CarStatus.occupied, open_price: 9500, owned_car: false, rental_id: 19, description: "Отличное состояние, 2022 года выпуска. Купе с 5.2л двигателем." },
    { id: 20, name: "McLaren 720S 2020", plate_number: "463 PP 21", latitude: 43.2200, longitude: 76.8500, course: 180, fuel_level: 70, price_per_minute: 90.25, price_per_hour: 5415, price_per_day: 86640, engine_volume: 4.0, year: 2020, drive_type: 1, transmission_type: TransmissionType.AUTOMATIC, body_type: CarBodyType.COUPE, photos: ["https://i.pinimg.com/1200x/e8/96/70/e896709d7563f687936d5036d5cc7291.jpg"], owner_id: 20, current_renter_id: 120, status: CarStatus.occupied, open_price: 9000, owned_car: false, rental_id: 20, description: "Отличное состояние, 2020 года выпуска. Купе с 4.0л двигателем." }
  ];

// Функция для получения машин по статусу
export const getCarsByStatus = async (status: CarStatus): Promise<ICar[]> => {
  const cars = await getMockCars();
  return cars.filter(car => car.status === status);
};

// Функция для получения машин по типу кузова
export const getCarsByBodyType = async (bodyType: CarBodyType): Promise<ICar[]> => {
  const cars = await getMockCars();
  return cars.filter(car => car.body_type === bodyType);
};

// Функция для получения свободных машин
export const getFreeCars = async (): Promise<ICar[]> => {
  return getCarsByStatus(CarStatus.free);
};

// Функция для получения занятых машин
export const getInUseCars = async (): Promise<ICar[]> => {
  return getCarsByStatus(CarStatus.occupied);
};

// Функция для получения всех занятых машин
export const getAllOccupiedCars = async (): Promise<ICar[]> => {
  const cars = await getMockCars();
  return cars.filter(car => car.status !== CarStatus.free);
};

// Функция для получения машин со статусом occupied
export const getOccupiedCars = async (): Promise<ICar[]> => {
  return getCarsByStatus(CarStatus.occupied);
};

// Функция для поиска машин по запросу
export const searchCars = async (query: string): Promise<ICar[]> => {
  try {
    const response = await vehicleApi.searchVehicles(query);
    const apiSearchResults = response?.vehicles || [];
    
    // Также ищем в fallback данных для более полных результатов
    const fallbackSearchResults = fallbackCars.filter(car => {
      const lowercaseQuery = query.toLowerCase();
      return car.name.toLowerCase().includes(lowercaseQuery) ||
             car.plate_number.toLowerCase().includes(lowercaseQuery) ||
             car.body_type.toLowerCase().includes(lowercaseQuery);
    });
    
    // Объединяем результаты поиска
    const combinedResults = [...apiSearchResults, ...fallbackSearchResults];
    
    console.log(`[searchCars] API results: ${apiSearchResults.length}, Fallback results: ${fallbackSearchResults.length}, Total: ${combinedResults.length}`);
    
    return combinedResults;
  } catch (error) {
    console.error("Failed to search vehicles:", error);
    // Fallback к локальному поиску по всем данным
    const cars = await getMockCars();
    const lowercaseQuery = query.toLowerCase();
    return cars.filter(car => 
      car.name.toLowerCase().includes(lowercaseQuery) ||
      car.plate_number.toLowerCase().includes(lowercaseQuery) ||
      car.body_type.toLowerCase().includes(lowercaseQuery)
    );
  }
};
