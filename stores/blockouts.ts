import { defineStore } from "pinia";
import { type Blockout } from "../types/data";

export const useBlockoutsStore = defineStore("blockouts", () => {
  const blockouts = ref([] as Blockout[]);

  const fetchBlockouts = async () => {
    const data = await $fetch("/api/blockouts");
    if (!data) return;
    const blockoutList: Blockout[] = Object.keys(data).map((key) => {
      return {
        key,
        ...data[key],
      };
    });
    blockouts.value = blockoutList;
    return blockoutList;
  };

  return {
    blockouts,
    fetchBlockouts,
  };
});
