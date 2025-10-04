"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("terms.tariff");

  const getTariffInfo = () => {
    switch (rentalType) {
      case "minutes":
        return {
          title: t("minute.title"),
          basePrice: `${car.price_per_minute} ${t("tariff.perMinute")}`,
          description: t("minute.description"),
          icon: <Timer className="w-6 h-6" />,
          popular: true,
          features: [
            {
              text: t("minute.features.0"),
              icon: <Clock className="w-4 h-4" />,
            },
          ],
        };
      case "hours":
        return {
          title: t("hour.title"),
          basePrice: `${car.price_per_hour} ${t("tariff.perHour")}`,
          description: t("hour.description"),
          icon: <Clock className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: t("hour.features.0"),
              icon: <Clock className="w-4 h-4" />,
            },
            {
              text: t("hour.features.1"),
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      case "days":
        return {
          title: t("day.title"),
          basePrice: `${car.price_per_day} ${t("tariff.perDay")}`,
          description: t("day.description"),
          icon: <Calendar className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: t("day.features.0"),
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              text: t("day.features.1"),
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      default:
        return {
          title: t("notSelected.title"),
          basePrice: "",
          description: t("notSelected.description"),
          icon: <Timer className="w-6 h-6" />,
          popular: false,
          features: [],
        };
    }
  };

  const tariffInfo = getTariffInfo();

  const requirements = [
    {
      text: t("requirements.documents"),
      icon: <FileText className="w-4 h-4" />,
    },
    {
      text: t("requirements.deposit"),
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-black/5 rounded-full text-black">
            {tariffInfo.icon}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-black">
              {tariffInfo.title}
            </h1>
            {tariffInfo.popular && (
              <Badge className="bg-black text-white flex items-center gap-1">
                <Star className="w-3 h-3" />
                {t("comparison.popular")}
              </Badge>
            )}
          </div>

          <p className="text-4xl font-bold text-black mb-2">
            {tariffInfo.basePrice}
          </p>
          <p className="text-black/60 text-lg">{tariffInfo.description}</p>
        </div>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-black" />
            {t("included.title")}
          </CardTitle>
          <CardDescription className="text-black/60">
            {t("included.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tariffInfo.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-black/5 rounded-lg"
              >
                <div className="p-1 bg-black/10 rounded text-black">
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
            <User className="w-5 h-5 text-black" />
            {t("requirements.title")}
          </CardTitle>
          <CardDescription className="text-black/60">
            {t("requirements.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((requirement, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="p-1 bg-black/10 rounded text-black">
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
          <CardTitle>{t("comparison.title")}</CardTitle>
          <CardDescription className="text-black/60">
            {t("comparison.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 border rounded-lg ${
                rentalType === "minutes"
                  ? "border-black bg-black/5"
                  : ""
              }`}
            >
              <div className="text-center space-y-2 relative">
                <Badge className="absolute -top-2 -right-2 bg-black text-white">
                  {t("comparison.popular")}
                </Badge>
                <Timer className="w-6 h-6 mx-auto text-black" />
                <h3 className="font-semibold">{t("minute.title")}</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_minute} {t("tariff.perMin")}
                </p>
                <p className="text-sm text-black/60">{t("comparison.forShortTrips")}</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg relative ${
                rentalType === "hours" ? "border-black bg-black/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Clock className="w-6 h-6 mx-auto text-black" />
                <h3 className="font-semibold">{t("hour.title")}</h3>
                <p className="text-2xl font-bold text-black">
                  {car.price_per_hour} {t("tariff.perHour")}
                </p>
                <p className="text-sm text-black/60">{t("comparison.optimalChoice")}</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg ${
                rentalType === "days" ? "border-black bg-black/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-black" />
                <h3 className="font-semibold">{t("day.title")}</h3>
                <p className="text-2xl font-bold text-black">
                  {car.price_per_day} ₸/день
                </p>
                <p className="text-sm text-black/60">{t("comparison.forLongTrips")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="border-black bg-black/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Shield className="w-5 h-5 text-black" />
            {t("additionalInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-black">{t("additionalInfo.insurance.title")}</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.insurance.ogpoIncluded")}</span>
                </li>

                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.insurance.roadsideAssistance")}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-black">
                {t("additionalInfo.additionalServices.title")}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Phone className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.additionalServices.techSupport24_7")}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Fuel className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.additionalServices.fuelIncluded")}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <MapPin className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.additionalServices.parkingZones")}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pricingCalculator.title")}</CardTitle>
          <CardDescription className="text-black/60">
            {t("pricingCalculator.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricingCalculator.thirtyMinutes")}</h4>
              <p className="text-2xl font-bold text-black">
                {rentalType === "minutes"
                  ? car.price_per_minute * 30
                  : rentalType === "hours"
                  ? Math.round(car.price_per_hour / 2)
                  : Math.round(car.price_per_day / 48)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricingCalculator.shortTrip")}</p>
            </div>

            <div className="text-center p-4 bg-black/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricingCalculator.threeHours")}</h4>
              <p className="text-2xl font-bold text-black">
                {rentalType === "minutes"
                  ? car.price_per_minute * 180
                  : rentalType === "hours"
                  ? car.price_per_hour * 3
                  : Math.round(car.price_per_day / 8)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricingCalculator.mediumTrip")}</p>
            </div>

            <div className="text-center p-4 bg-black/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricingCalculator.oneDay")}</h4>
              <p className="text-2xl font-bold text-black">
                {rentalType === "minutes"
                  ? car.price_per_minute * 1440
                  : rentalType === "hours"
                  ? car.price_per_hour * 24
                  : car.price_per_day}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricingCalculator.longTrip")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
