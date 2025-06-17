import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["api.azvmotors.kz"],
  },
};

export default withNextIntl(config);
