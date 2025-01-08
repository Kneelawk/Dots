import { App } from "astal/gtk3"
import style from "./style.scss"
import { Bar, fixBars } from "./widget/Bar"
import { monitorFile } from "astal"
import { AppLauncher, reloadApps } from "./widget/AppLauncher"

App.start({
    css: style,
    requestHandler(request: string, res: (response: any) => void) {
        if (request == "reloadAll") {
            fixBars()
            reloadApps()
            res("reloading all")
            return
        }
        res("unknown command")
    },
    main() {
        App.get_monitors().map(Bar)
        AppLauncher()
    },
})
