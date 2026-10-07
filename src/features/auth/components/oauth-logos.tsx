import Svg, { Path } from 'react-native-svg';

type LogoProps = {
  size?: number;
};

type AppleLogoProps = LogoProps & {
  color: string;
};

export function GoogleLogo({ size = 18 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" testID="google-logo">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export function AppleLogo({ size = 18, color }: AppleLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 814 1000" testID="apple-logo">
      <Path
        fill={color}
        d="M788 341c-6 4-108 62-108 190 0 149 131 201 135 203-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-164-40c-77 0-104 41-167 41s-106-58-156-128C45 791 0 666 0 548c0-190 123-290 245-290 65 0 119 43 160 43 39 0 100-45 174-45 28 0 129 2 196 97zM559 165c31-36 52-87 52-138 0-7-1-14-2-20-50 2-109 33-145 74-28 32-54 83-54 135 0 8 1 16 2 18 3 1 9 2 14 2 45 0 101-30 133-71z"
      />
    </Svg>
  );
}
