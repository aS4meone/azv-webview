"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Timer,
  Clock,
  Calendar,
  CheckCircle,
  Star,
  Shield,
  Fuel,
  MapPin,
  Phone,
  CreditCard,
  User,
  FileText,
} from "lucide-react";

type RentalType = "minutes" | "hours" | "days";

interface ICar {
  price_per_minute: number;
  price_per_hour: number;
  price_per_day: number;
}

interface TariffContentProps {
  rentalType: RentalType;
  car: ICar;
}

export const TariffContent = ({ rentalType, car }: TariffContentProps) => {
  const getTariffInfo = () => {
    switch (rentalType) {
      case "minutes":
        return {
          title: "Поминутный тариф",
          basePrice: `${car.price_per_minute} ₸/минута`,
          description: "Идеально для коротких поездок по городу",
          icon: <Timer className="w-6 h-6" />,
          popular: true,
          features: [
            {
              text: "Минимальное время аренды: от 1 минуты",
              icon: <Clock className="w-4 h-4" />,
            },
          ],
        };
      case "hours":
        return {
          title: "Почасовой тариф",
          basePrice: `${car.price_per_hour} ₸/час`,
          description: "Оптимально для длительных поездок",
          icon: <Clock className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: "Минимальное время аренды: 1 час",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              text: "Бензин не включен в стоимость",
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      case "days":
        return {
          title: "Дневной тариф",
          basePrice: `${car.price_per_day} ₸/день`,
          description: "Лучший выбор для длительных поездок",
          icon: <Calendar className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: "Минимальное время аренды: 1 день",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              text: "Бензин не включен в стоимость",
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      default:
        return {
          title: "Тариф не выбран",
          basePrice: "",
          description: "Пожалуйста, выберите тариф",
          icon: <Timer className="w-6 h-6" />,
          popular: false,
          features: [],
        };
    }
  };

  const tariffInfo = getTariffInfo();

  const requirements = [
    {
      text: "Действующий паспорт и водительское удостоверение",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      text: "Депозит зависит от класса автомобиля",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-[#1D77FF]/10 rounded-full text-[#1D77FF]">
            {tariffInfo.icon}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-black">
              {tariffInfo.title}
            </h1>
            {tariffInfo.popular && (
              <Badge className="bg-[#1D77FF] flex items-center gap-1">
                <Star className="w-3 h-3" />
                Популярный
              </Badge>
            )}
          </div>

          <p className="text-4xl font-bold text-[#1D77FF] mb-2">
            {tariffInfo.basePrice}
          </p>
          <p className="text-black/60 text-lg">{tariffInfo.description}</p>
        </div>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#1D77FF]" />
            Что включено в тариф
          </CardTitle>
          <CardDescription className="text-black/60">
            Все необходимое для комфортной поездки уже включено в стоимость
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tariffInfo.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-[#1D77FF]/5 rounded-lg"
              >
                <div className="p-1 bg-[#1D77FF]/10 rounded text-[#1D77FF]">
                  {feature.icon}
                </div>
                <span className="text-black/70">{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#1D77FF]" />
            Требования для аренды
          </CardTitle>
          <CardDescription className="text-black/60">
            Убедитесь, что вы соответствуете всем требованиям
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((requirement, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="p-1 bg-[#1D77FF]/10 rounded text-[#1D77FF]">
                  {requirement.icon}
                </div>
                <span className="text-black/70">{requirement.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Сравнение тарифов</CardTitle>
          <CardDescription className="text-black/60">
            Выберите наиболее подходящий тариф для ваших потребностей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 border rounded-lg ${
                rentalType === "minutes"
                  ? "border-[#1D77FF] bg-[#1D77FF]/5"
                  : ""
              }`}
            >
              <div className="text-center space-y-2 relative">
                <Badge className="absolute -top-2 -right-2 bg-[#1D77FF]">
                  Популярный
                </Badge>
                <Timer className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">Поминутный</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_minute} ₸/мин
                </p>
                <p className="text-sm text-black/60">Для коротких поездок</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg relative ${
                rentalType === "hours" ? "border-[#1D77FF] bg-[#1D77FF]/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Clock className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">Почасовой</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_hour} ₸/час
                </p>
                <p className="text-sm text-black/60">Оптимальный выбор</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg ${
                rentalType === "days" ? "border-[#1D77FF] bg-[#1D77FF]/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">Дневной</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_day} ₸/день
                </p>
                <p className="text-sm text-black/60">Для длительных поездок</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="border-[#1D77FF] bg-[#1D77FF]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Shield className="w-5 h-5 text-[#1D77FF]" />
            Дополнительная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-black">Страхование</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>ОГПО включены</span>
                </li>

                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>Помощь на дороге 24/7</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-black">
                Дополнительные услуги
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Phone className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>Техподдержка 24/7</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Fuel className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>Заправка за наш счет (только поминутный тариф)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <MapPin className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>Парковка в специальных зонах</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Примерная стоимость</CardTitle>
          <CardDescription className="text-black/60">
            Рассчитайте приблизительную стоимость вашей поездки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">30 минут</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 30
                  : rentalType === "hours"
                  ? Math.round(car.price_per_hour / 2)
                  : Math.round(car.price_per_day / 48)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">Короткая поездка</p>
            </div>

            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">3 часа</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 180
                  : rentalType === "hours"
                  ? car.price_per_hour * 3
                  : Math.round(car.price_per_day / 8)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">Средняя поездка</p>
            </div>

            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">1 день</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 1440
                  : rentalType === "hours"
                  ? car.price_per_hour * 24
                  : car.price_per_day}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">Длительная поездка</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
