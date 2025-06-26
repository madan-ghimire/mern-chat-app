export const spacing = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  8: "8",
  10: "10",
  12: "12",
  16: "16",
  20: "20",
};

export type Spacing = keyof typeof spacing;

export type BoxStyleProps = {
  p?: Spacing;
  pt?: Spacing;
  pr?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
  px?: Spacing;
  py?: Spacing;
  m?: Spacing;
  mx?: Spacing;
  my?: Spacing;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  bg?: string; // Tailwind class suffix like 'gray-100'
};
