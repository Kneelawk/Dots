import {createPoll} from "ags/time";

export const date = createPoll("", 1000, "date '+%H:%M:%S %b %e.'")
export const APPLAUNCHER_NAME = "applauncher"
export const MONITOR_POSITIONS: {[key: string]: number[]} = {
    "S27D360": [0, 0],
    "U32J59x": [1920, 0]
}

export const WORKSPACE_WIDTH = 4
export const WORKSPACE_HEIGHT = 4
