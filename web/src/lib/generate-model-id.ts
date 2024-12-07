// ! @types/uuid not updated to have v7 blah
// @ts-ignore
import { v7 as uuidv7 } from "uuid";

export const generateModelId = () => {
  return uuidv7();
};
