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
          title: t("tariffs.minutes.title"),
          basePrice: `${car.price_per_minute} ₸/минута`,
          description: t("tariffs.minutes.description"),
          icon: <Timer className="w-6 h-6" />,
          popular: true,
          features: [
            {
              text: t("tariffs.minutes.features.minRental"),
              icon: <Clock className="w-4 h-4" />,
            },
          ],
        };
      case "hours":
        return {
          title: t("tariffs.hours.title"),
          basePrice: `${car.price_per_hour} ₸/час`,
          description: t("tariffs.hours.description"),
          icon: <Clock className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: t("tariffs.hours.features.minRental"),
              icon: <Clock className="w-4 h-4" />,
            },
            {
              text: t("tariffs.hours.features.fuelNotIncluded"),
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      case "days":
        return {
          title: t("tariffs.days.title"),
          basePrice: `${car.price_per_day} ₸/день`,
          description: t("tariffs.days.description"),
          icon: <Calendar className="w-6 h-6" />,
          popular: false,
          features: [
            {
              text: t("tariffs.days.features.minRental"),
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              text: t("tariffs.days.features.fuelNotIncluded"),
              icon: <Fuel className="w-4 h-4" />,
            },
          ],
        };
      default:
        return {
          title: t("tariffs.default.title"),
          basePrice: "",
          description: t("tariffs.default.description"),
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
                {t("popular")}
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
                  ? "border-[#1D77FF] bg-[#1D77FF]/5"
                  : ""
              }`}
            >
              <div className="text-center space-y-2 relative">
                <Badge className="absolute -top-2 -right-2 bg-[#1D77FF]">
                  {t("popular")}
                </Badge>
                <Timer className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">{t("tariffs.minutes.title")}</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_minute} ₸/мин
                </p>
                <p className="text-sm text-black/60">{t("comparison.shortTrips")}</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg relative ${
                rentalType === "hours" ? "border-[#1D77FF] bg-[#1D77FF]/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Clock className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">{t("tariffs.hours.title")}</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_hour} ₸/час
                </p>
                <p className="text-sm text-black/60">{t("comparison.optimalChoice")}</p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg ${
                rentalType === "days" ? "border-[#1D77FF] bg-[#1D77FF]/5" : ""
              }`}
            >
              <div className="text-center space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-[#1D77FF]" />
                <h3 className="font-semibold">{t("tariffs.days.title")}</h3>
                <p className="text-2xl font-bold text-[#1D77FF]">
                  {car.price_per_day} ₸/день
                </p>
                <p className="text-sm text-black/60">{t("comparison.longTrips")}</p>
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
            {t("additionalInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-black">{t("additionalInfo.insurance.title")}</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.insurance.osago")}</span>
                </li>

                <li className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.insurance.roadsideAssistance")}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-black">
                {t("additionalInfo.services.title")}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Phone className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.services.techSupport")}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <Fuel className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.services.fuelRefill")}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-black/70">
                  <MapPin className="w-4 h-4 text-[#1D77FF] mt-0.5 flex-shrink-0" />
                  <span>{t("additionalInfo.services.parking")}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pricing.title")}</CardTitle>
          <CardDescription className="text-black/60">
            {t("pricing.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricing.duration.thirtyMinutes")}</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 30
                  : rentalType === "hours"
                  ? Math.round(car.price_per_hour / 2)
                  : Math.round(car.price_per_day / 48)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricing.tripType.short")}</p>
            </div>

            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricing.duration.threeHours")}</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 180
                  : rentalType === "hours"
                  ? car.price_per_hour * 3
                  : Math.round(car.price_per_day / 8)}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricing.tripType.medium")}</p>
            </div>

            <div className="text-center p-4 bg-[#1D77FF]/5 rounded-lg">
              <h4 className="font-semibold text-black mb-2">{t("pricing.duration.oneDay")}</h4>
              <p className="text-2xl font-bold text-[#1D77FF]">
                {rentalType === "minutes"
                  ? car.price_per_minute * 1440
                  : rentalType === "hours"
                  ? car.price_per_hour * 24
                  : car.price_per_day}{" "}
                ₸
              </p>
              <p className="text-sm text-black/70">{t("pricing.tripType.long")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
