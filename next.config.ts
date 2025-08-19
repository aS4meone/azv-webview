import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  images: {
    domains: ["api.azvmotors.kz"],
  },
};

export default withNextIntl(config);
