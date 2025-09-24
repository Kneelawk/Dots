import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar, {fixBars} from "./widget/Bar"
import {AppLauncher, reloadApps} from "./widget/AppLauncher";
import {getScope, Scope} from "ags";

let scope: Scope

app.start({
    css: style,
    requestHandler(argv: string[], res: (response: any) => void) {
        if (argv[0] == "reloadAll") {
            scope.run(() => {
                fixBars()
                reloadApps()
            })
            res("reloading all")
            return
        }
        res(`unknown command ${argv[0]}`)
    },
    main() {
        scope = getScope()
        app.get_monitors().map(Bar)
        AppLauncher()
    },
})
