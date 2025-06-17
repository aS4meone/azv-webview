import { useRouter } from "next/navigation";

export interface QueryCar {
  id: number;
  lat: number;
  lng: number;
}

export const useFormatCarInUrl = ({
  car,
  route,
}: {
  car: QueryCar;
  route: string;
}) => {
  const router = useRouter();

  const redirectToCar = () => {
    router.push(`${route}?carId=${car.id}&lat=${car.lat}&lng=${car.lng}`);
  };

  return {
    redirectToCar,
  };
};
