import {Bar} from "./bar.js"
import {applauncher} from "./applauncher.js"

App.config({
    style: "./style.css",
    windows: [
        // bars
        Bar(0),

        // app launcher
        applauncher,
    ],
})

const cssFile = `${App.configDir}/style.css`
Utils.monitorFile(cssFile, () => {
    App.resetCss()
    App.applyCss(cssFile)
})
