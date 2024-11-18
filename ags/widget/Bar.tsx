// Bar.tsx - the top bar

import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { bind, Binding, Variable } from "astal"

import Hyprland from "gi://AstalHyprland"
import Notifd from "gi://AstalNotifd"
import Wp from "gi://AstalWp"
import Tray from "gi://AstalTray"

import { date, MONITOR_POSITIONS } from "../globals"

function Workspaces() {
    const hyprland = Hyprland.get_default()
    const activeId = bind(hyprland, "focused_workspace").as(ws => ws.id);
    const workspaces = bind(hyprland, "workspaces").as(ws => ws.filter(({id}) => id >= 0).map(({id}) => <button
            onClick={() => hyprland.dispatch("workspace", `${id}`)}
            className={activeId.as(i => `${i === id ? "focused" : ""}`)} >
            <label label={`${id}`} />
        </button>))

    return <box className="workspaces" >{workspaces}</box>
}

function ClientTitle() {
    const hyprland = Hyprland.get_default()
    const focusedClient = bind(hyprland, "focused_client")
    const title = Variable.derive([focusedClient.as(client => client?.title), focusedClient.as(client => client?.class)], (title, cls) => {
        if (title?.trim()) {
            return title
        } else if (cls?.trim()) {
            return cls
        } else {
            return "UwU"
        }
    })
    return <label className="client-title" label={title()} />
}

function Clock() {
    return <label className="clock" label={date()} />
}

function Notifications() {
    const notifd = Notifd.get_default()
    const popups = bind(notifd, "notifications")
    return <box className="notification" visible={popups.as(p => p.length > 0)}>
        <icon icon="preferences-system-notifications-symbolic" />
        <label label={popups.as(p => p[0]?.summary || "")} />
    </box>
}

function Volume() {
    const wp = Wp.get_default()
    if (wp === null) return <label label="Audio Broken" />

    const audio = wp.audio
    const speaker = audio.default_speaker

    return <box className="volume" css="min-width: 180px">
        <icon icon={speaker.volume_icon} />
        <slider hexpand drawValue={false} onDragged={({value}) => speaker.volume = value} value={bind(speaker, "volume")} />
    </box>
}

function SysTray({gdkmonitor}: {gdkmonitor: Gdk.Monitor}) {
    const tray = Tray.get_default()
    for (const item of tray.get_items()) {
        console.log(`item: ${item.title}`)
    }

    const items = bind(tray, "items").as(items => items.map(item => {
        if (item.icon_theme_path) {
            App.add_icons(item.icon_theme_path)
        }

        const menu = item.create_menu()

        return <button
            onClickRelease={(self, event) => {
                if (event.button == Astal.MouseButton.PRIMARY) {
                    const display = Gdk.Display.get_default()
                    const deviceManager = display?.get_device_manager()
                    const device = deviceManager?.get_client_pointer()
                    const [s, x, y] = device?.get_position() || [null, 0, 0]
                    const model = gdkmonitor.get_model() || ""
                    const [offx, offy] = MONITOR_POSITIONS[model] || [0, 0]
                    item.activate(x + offx, y + offy)
                } else if (event.button == Astal.MouseButton.SECONDARY) {
                    menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
                }
            }}
            onDestroy={() => menu?.destroy()}
            tooltipMarkup={bind(item, "tooltip_markup")}>
                <icon gIcon={bind(item, "gicon")} />
            </button>
    }))

    return <box>{items}</box>
}

function Left() {
    return <box className="left">
        <box className="left-box" spacing={8}>
            <Workspaces />
        </box>
    </box>
}

function Center() {
    return <box className="center">
        <centerbox className="center-box" spacing={8}>
            <box />
            <ClientTitle />
            <box />
        </centerbox>
    </box>
}

function Right({gdkmonitor}: {gdkmonitor: Gdk.Monitor}) {
    return <box className="right" halign={Gtk.Align.END}>
        <box className="right-box" spacing={8}>
            <Notifications />
            <Volume />
            <SysTray gdkmonitor={gdkmonitor} />
            <Clock />
        </box>
    </box>
}

export function Bar(gdkmonitor: Gdk.Monitor, monitorId: number) {
    return <window
        name={`bar-${monitorId}`}
        className="bar"
        gdkmonitor={gdkmonitor}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        application={App}>
            <centerbox className="bar-inner">
                <Left />
                <Center />
                <Right gdkmonitor={gdkmonitor} />
            </centerbox>
        </window>
}

export function fixBars() {
    App.get_windows().forEach(win => {
        if (win.name?.startsWith("bar-")) {
            win.close()
            App.remove_window(win)
        }
    })
    App.get_monitors().map(Bar)
}
