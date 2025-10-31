import { sum } from "./util";
export async function main() {
  try {
    const r = await sum(1, 2);
    console.log(r);
  } catch (e) {
    console.error("error:", e);
  }
}
