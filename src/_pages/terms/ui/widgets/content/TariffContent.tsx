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
          color: "blue",
          popular: false,
          features: [
            {
              text: "Минимальное время аренды: 15 минут",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              text: "Включена базовая страховка",
              icon: <Shield className="w-4 h-4" />,
            },
            {
              text: "Бензин включен в стоимость",
              icon: <Fuel className="w-4 h-4" />,
            },
            {
              text: "Парковка в разрешенных зонах",
              icon: <MapPin className="w-4 h-4" />,
            },
          ],
        };
      case "hours":
        return {
          title: "Почасовой тариф",
          basePrice: `${car.price_per_hour} ₸/час`,
          description: "Оптимально для длительных поездок",
          icon: <Clock className="w-6 h-6" />,
          color: "green",
          popular: true,
          features: [
            {
              text: "Минимальное время аренды: 1 час",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              text: "Расширенная страховка",
              icon: <Shield className="w-4 h-4" />,
            },
            {
              text: "Бензин включен в стоимость",
              icon: <Fuel className="w-4 h-4" />,
            },
            {
              text: "Бесплатная парковка в специальных зонах",
              icon: <MapPin className="w-4 h-4" />,
            },
          ],
        };
      case "days":
        return {
          title: "Дневной тариф",
          basePrice: `${car.price_per_day} ₸/день`,
          description: "Лучший выбор для длительных поездок",
          icon: <Calendar className="w-6 h-6" />,
          color: "purple",
          popular: false,
          features: [
            {
              text: "Минимальное время аренды: 1 день",
              icon: <Calendar className="w-4 h-4" />,
            },
            { text: "Полная страховка", icon: <Shield className="w-4 h-4" /> },
            {
              text: "Бензин включен в стоимость",
              icon: <Fuel className="w-4 h-4" />,
            },
            {
              text: "Неограниченный пробег",
              icon: <MapPin className="w-4 h-4" />,
            },
            {
              text: "Приоритетная поддержка",
              icon: <Phone className="w-4 h-4" />,
            },
          ],
        };
      default:
        return {
          title: "Тариф не выбран",
          basePrice: "",
          description: "Пожалуйста, выберите тариф",
          icon: <Timer className="w-6 h-6" />,
          color: "gray",
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
    { text: "Стаж вождения от 2 лет", icon: <User className="w-4 h-4" /> },
    { text: "Возраст от 21 года", icon: <User className="w-4 h-4" /> },
    {
      text: "Депозит зависит от класса автомобиля",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`p-4 bg-${tariffInfo.color}-100 rounded-full`}>
            {tariffInfo.icon}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {tariffInfo.title}
            </h1>
            {tariffInfo.popular && (
              <Badge className="bg-green-500 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Популярный
              </Badge>
            )}
          </div>

          <p className="text-4xl font-bold text-blue-600 mb-2">
            {tariffInfo.basePrice}
          </p>
          <p className="text-gray-600 text-lg">{tariffInfo.description}</p>
        </div>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Что включено в тариф
          </CardTitle>
          <CardDescription>
            Все необходимое для комфортной поездки уже включено в стоимость
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tariffInfo.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
              >
                <div className="p-1 bg-green-100 rounded">{feature.icon}</div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Требования для аренды
          </CardTitle>
          <CardDescription>
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
                <div className="p-1 bg-blue-100 rounded">
                  {requirement.icon}
                </div>
                <span className="text-gray-700">{requirement.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Сравнение тарифов</CardTitle>
          <CardDescription>
            Выберите наиболее подходящий тариф для ваших потребностей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 border rounded-lg ${
                rentalType === "minutes" ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Timer className="w-6 h-6 mx-auto text-blue-600" />
                <h3 className="font-semibold">Поминутный</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {car.price_per_minute} ₸/мин
                </p>
                <p className="text-sm text-gray-600">Для коротких поездок</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg relative ${
                rentalType === "hours" ? "border-green-500 bg-green-50" : ""
              }`}
            >
              <Badge className="absolute -top-2 -right-2 bg-green-500">
                Популярный
              </Badge>
              <div className="text-center space-y-2">
                <Clock className="w-6 h-6 mx-auto text-green-600" />
                <h3 className="font-semibold">Почасовой</h3>
                <p className="text-2xl font-bold text-green-600">
                  {car.price_per_hour} ₸/час
                </p>
                <p className="text-sm text-gray-600">Оптимальный выбор</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg ${
                rentalType === "days" ? "border-purple-500 bg-purple-50" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-purple-600" />
                <h3 className="font-semibold">Дневной</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {car.price_per_day} ₸/день
                </p>
                <p className="text-sm text-gray-600">Для длительных поездок</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Shield className="w-5 h-5" />
            Дополнительная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-900">Страхование</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>КАСКО и ОСАГО включены</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Франшиза от 50,000 ₸</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Помощь на дороге 24/7</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-amber-900">
                Дополнительные услуги
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Техподдержка 24/7</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <Fuel className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Заправка за наш счет</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-amber-800">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
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
          <CardDescription>
            Рассчитайте приблизительную стоимость вашей поездки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">30 минут</h4>
              <p className="text-2xl font-bold text-blue-600">
                {rentalType === "minutes"
                  ? car.price_per_minute * 30
                  : rentalType === "hours"
                  ? Math.round(car.price_per_hour / 2)
                  : Math.round(car.price_per_day / 48)}{" "}
                ₸
              </p>
              <p className="text-sm text-blue-700">Короткая поездка</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">3 часа</h4>
              <p className="text-2xl font-bold text-green-600">
                {rentalType === "minutes"
                  ? car.price_per_minute * 180
                  : rentalType === "hours"
                  ? car.price_per_hour * 3
                  : Math.round(car.price_per_day / 8)}{" "}
                ₸
              </p>
              <p className="text-sm text-green-700">Средняя поездка</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">1 день</h4>
              <p className="text-2xl font-bold text-purple-600">
                {rentalType === "minutes"
                  ? car.price_per_minute * 1440
                  : rentalType === "hours"
                  ? car.price_per_hour * 24
                  : car.price_per_day}{" "}
                ₸
              </p>
              <p className="text-sm text-purple-700">Длительная поездка</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
