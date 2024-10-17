import {APPLAUNCHER_NAME} from "./globals.js";

const {query} = await Service.import("applications")

const AppItem = app => Widget.Button({
    on_clicked: () => {
        App.closeWindow(APPLAUNCHER_NAME)
        app.launch()
    },
    attribute: { app },
    child: Widget.Box({
        class_name: 'app',
        children: [
            Widget.Icon({
                icon: app.icon_name || "",
                size: 42
            }),
            Widget.Label({
                class_name: "title",
                label: app.name,
                xalign: 0,
                vpack: "center",
                truncate: "end",
            })
        ]
    })
})

const AppLauncher = ({width = 500, height = 500}) => {
    let applications = query("").map(AppItem)

    const list = Widget.Box({
        vertical: true,
        children: applications,
    })

    const repopulate = () => {
        applications = query("").map(AppItem)
        list.children = applications
    }

    const entry = Widget.Entry({
        hexpand: true,
        on_accept: () => {
            const results = applications.filter((item) => item.visible)
            if (results[0]) {
                App.closeWindow(APPLAUNCHER_NAME)
                results[0].attribute.app.launch()
            }
        },

        on_change: ({text}) => applications.forEach(item => {
            item.visible = item.attribute.app.match(text ?? "")
        })
    })

    return Widget.Box({
        vertical: true,
        class_name: 'applauncher-box',
        children: [
            entry,
            Widget.Scrollable({
                hscroll: "never",
                css: `min-width: ${width}px;`
                    + `min-height: ${height}px`,
                child: list,
            })
        ],
        setup: self => self.hook(App, (_, windowName, visible) => {
            if (windowName !== APPLAUNCHER_NAME) return

            if (visible) {
                repopulate()
                entry.text = ""
                entry.grab_focus()
            }
        })
    })
}

export const applauncher = Widget.Window({
    name: APPLAUNCHER_NAME,
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(APPLAUNCHER_NAME)
    }),
    visible: false,
    keymode: "exclusive",
    child: AppLauncher({
        width: 500,
        height: 500,
    })
})
