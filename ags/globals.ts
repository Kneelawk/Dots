// globals.js - Stuff that's needed by everything else

import { Variable } from "astal";

export const date = Variable("").poll(1000, "date '+%H:%M:%S %b %e.'")
export const APPLAUNCHER_NAME = "applauncher"
export const MONITOR_POSITIONS: {[key: string]: number[]} = {
    "S27D360": [0, 0],
    "U32J59x": [1920, 0]
}
