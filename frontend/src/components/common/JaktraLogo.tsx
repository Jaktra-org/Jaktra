interface JaktraLogoProps {
  size?: number | string;
  className?: string;
}

export function JaktraLogo({ size = 26, className = "" }: JaktraLogoProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1254 1254"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 block select-none ${className}`}
      aria-label="Jaktra"
      role="img"
    >
      <defs>
        <linearGradient id="jaktra-brand-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#3d5fb8" />
          <stop offset="1" stopColor="#6b8fe9" />
        </linearGradient>
      </defs>
      <path
        fill="#b7d2f8"
        d="M 460,50 L459,298 L767,298 L788,304 L804,318 L814,338 L815,762 L809,794 L796,824 L780,848 L761,867 L733,885 L714,893 L680,899 L533,899 L526,907 L526,991 L531,1005 L751,1187 L758,1190 L780,1187 L835,1166 L882,1140 L936,1099 L976,1059 L1004,1023 L1025,989 L1043,953 L1064,895 L1077,835 L1081,786 L1081,233 L1074,191 L1056,148 L1035,119 L1012,96 L973,70 L920,52 Z"
      />
      <path
        fill="url(#jaktra-brand-grad)"
        d="M 194,687 L179,703 L172,729 L172,900 L272,901 L273,1128 L283,1156 L296,1174 L314,1187 L341,1197 L384,1203 L656,1203 L655,1199 L468,1044 L457,1030 L447,999 L447,813 L582,812 L582,731 L576,708 L566,693 L551,682 L533,677 L218,677 Z"
      />
    </svg>
  );
}

export default JaktraLogo;
