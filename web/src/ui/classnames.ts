import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// https://korayguler.medium.com/how-to-merge-react-and-tailwind-css-class-names-f5faeb10ed24
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));
