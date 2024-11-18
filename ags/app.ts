import { App } from "astal/gtk3"
import style from "./style.scss"
import { Bar, fixBars } from "./widget/Bar"
import { monitorFile } from "astal"
import { AppLauncher } from "./widget/AppLauncher"

App.start({
    css: style,
    requestHandler(request: string, res: (response: any) => void) {
        if (request == "fixBars") {
            fixBars()
            res("reloading bars")
            return
        }
        res("unknown command")
    },
    main() {
        App.get_monitors().map(Bar)
        AppLauncher()
    },
})
