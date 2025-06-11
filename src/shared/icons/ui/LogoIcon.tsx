import Image from "next/image";
import { IIcon } from "../types/IIcon";

interface ILogoIcon extends IIcon {
  isBlack?: boolean;
}

const LogoIcon = ({ className, width, height, color, isBlack }: ILogoIcon) => {
  if (isBlack) {
    return (
      <svg
        width={width || 27}
        height={height || 38}
        viewBox="0 0 27 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g filter="url(#filter0_i_1198_4773)">
          <path
            d="M8.51074 12.4805L8.66016 12.6738H23.6855L17.1885 18.4609L16.3311 17.3623L19.0352 14.9541L20.0156 14.0811H9.75391L10.3809 14.8877L13.623 19.0605L13.7197 19.1846L15.1133 20.9844L15.1104 20.9873L15.4072 21.3691L21.626 29.3721L22.5205 30.5244V20.9551L23.8906 19.7764V34.542L14.5781 22.5576L14.585 22.5537L14.2832 22.168L12.4756 19.8516H12.4746L10.2744 17.0205L10.2822 17.0146L9.9834 16.6309L3.76465 8.62793L2.86914 7.47559V19.334L1.5 20.5117V3.45703L8.51074 12.4805Z"
            fill="#191919"
            stroke="#191919"
          />
          <path
            d="M11.3396 23.6702L9.04858 25.7112V23.8499L10.4822 22.5715L11.3396 23.6702Z"
            fill="#191919"
            stroke="#191919"
          />
          <path
            d="M1 2V21.6015L3.36938 19.5635V8.93436L9.58841 16.9376L9.58178 16.943L12.081 20.1592L13.8894 22.4754L13.8843 22.4795L24.3902 36V18.6884L22.0206 20.7264V29.0656L15.8018 21.0622L15.8046 21.0598L14.0187 18.753L14.0182 18.7536L10.776 14.5807H18.7029L15.6488 17.3011L17.1231 19.1896L25 12.1734H8.90518L1 2Z"
            fill="#191919"
            stroke="#191919"
          />
          <path
            d="M12.0229 23.7322L10.5488 21.844L8.54858 23.6254V26.8271L12.0229 23.7322Z"
            fill="#191919"
            stroke="#191919"
          />
        </g>
        <defs>
          <filter
            id="filter0_i_1198_4773"
            x="0.5"
            y="0.541748"
            width="25.8131"
            height="38.3593"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1.44282" />
            <feGaussianBlur stdDeviation="0.721412" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.23 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_1198_4773"
            />
          </filter>
        </defs>
      </svg>
    );
  }
  return (
    <Image
      src="/images/logo.png"
      alt="Logo"
      width={width || 25}
      height={height || 35}
      className={className}
      style={{
        color: color,
      }}
    />
  );
};

export { LogoIcon };
