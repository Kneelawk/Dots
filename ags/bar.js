// bar.js - the top bar

const hyprland = await Service.import('hyprland')
const notifications = await Service.import('notifications')
const mpris = await Service.import('mpris')
const audio = await Service.import('audio')
const systemtray = await Service.import('systemtray')

import {date} from "./globals.js"

const Workspaces = () => {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces").as(ws => ws.filter(({id}) => id >= 0).map(({id}) => Widget.Button({
        on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
        child: Widget.Label(`${id}`),
        class_name: activeId.as(i => `${i === id ? "focused" : ""}`),
    })))

    return Widget.Box({
        class_name: "workspaces",
        children: workspaces,
    })
}

const ClientTitle = () => {
    return Widget.Label({
        class_name: "client-title",
        label: Utils.merge([hyprland.active.client.bind("title"), hyprland.active.client.bind("class")], (title, cls) => {
                if (!title.trim()) {
                    return cls
                } else {
                    return title
                }
            }
        )
    })
}

const Clock = () => {
    return Widget.Label({
        class_name: "clock",
        label: date.bind()
    })
}

const Notifications = () => {
    const popups = notifications.bind("popups")
    return Widget.Box({
        class_name: "notification",
        visible: popups.as(p => p.length > 0),
        children: [
            Widget.Icon({
                icon: "preferences-system-notifications-symbolic",
            }),
            Widget.Label({
                label: popups.as(p => p[0]?.summary || "")
            })
        ]
    })
}

const Volume = () => {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    const getIcon = () => {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(threshold => threshold <= audio.speaker.volume * 100);
        return `audio-volume-${icons[icon]}-symbolic`
    }

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.speaker, getIcon)
    })

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        on_change: ({value}) => audio.speaker.volume = value,
        setup: self => self.hook(audio.speaker, () => {
            self.value = audio.speaker.volume || 0
        })
    })

    return Widget.Box({
        class_name: "volume",
        css: "min-width: 180px",
        children: [icon, slider]
    })
}

const SysTray = () => {
    const items = systemtray.bind("items").as(items => items.map(item => Widget.Button({
        child: Widget.Icon({icon: item.bind("icon")}),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        tooltip_markup: item.bind("tooltip_markup")
    })))

    return Widget.Box({
        children: items
    })
}

const Left = () => {
    return Widget.Box({
        class_name: "left",
        children: [
            Widget.Box({
                class_name: "left-box",
                spacing: 8,
                children: [
                    Workspaces(),
                ]
            }),
        ]
    })
}

const Center = () => {
    return Widget.Box({
        class_name: "center",
        children: [
            Widget.CenterBox({
                class_name: "center-box",
                spacing: 8,
                center_widget: ClientTitle(),
            })
        ]
    })
}

const Right = () => {
    return Widget.Box({
        class_name: "right",
        hpack: "end",
        children: [
            Widget.Box({
                class_name: "right-box",
                spacing: 8,
                children: [
                    Notifications(),
                    Volume(),
                    SysTray(),
                    Clock(),
                ]
            })
        ]
    })
}

export const Bar = (monitor = 0) => {
    return Widget.Window({
        name: `bar-${monitor}`,
        class_name: "bar",
        monitor,
        anchor: ["top", "left", "right"],
        exclusivity: 'exclusive',
        child: Widget.CenterBox({
            class_name: "bar-inner",
            start_widget: Left(),
            center_widget: Center(),
            end_widget: Right(),
        })
    })
}

export const fixBars = () => {
    App.windows.map(win => {
        if (win.name?.startsWith("bar-")) {
            App.removeWindow(win.name);
        }
    })
    hyprland.monitors.forEach(monitor => App.addWindow(Bar(monitor.id)));
}
globalThis.fixBars = fixBars;
