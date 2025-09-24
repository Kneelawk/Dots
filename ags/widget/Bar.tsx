import app from "ags/gtk4/app"
import {Astal, Gtk, Gdk} from "ags/gtk4"
// import {execAsync} from "ags/process"
import {Accessor, createBinding, createComputed, createState, For, getScope, With} from "ags"

import Hyprland from "gi://AstalHyprland";
import Notifd from "gi://AstalNotifd";
import Wp from "gi://AstalWp";
import Tray from "gi://AstalTray";
import Battery from "gi://AstalBattery";

import {date, WORKSPACE_HEIGHT, WORKSPACE_WIDTH} from "../globals"

function WorkspaceButton({hyprland, id, activeId, workspaces, requestedId}: {
    hyprland: Hyprland.Hyprland,
    id: number,
    activeId: Accessor<number>,
    workspaces: Accessor<number[]>,
    requestedId: Accessor<number[]>
}) {
    let clazz = createComputed([activeId, workspaces, requestedId], (active, workspaces, requested) => {
        if (active === id) {
            return "focused"
        } else if (requested.includes(id)) {
            return "requested"
        } else if (workspaces.includes(id)) {
            return "present"
        } else {
            return "empty"
        }
    })
    return <button
        onClicked={() => hyprland.dispatch("workspace", `${id}`)}
        class={clazz}>
        <label label="•"/>
    </button>
}

function Workspaces() {
    const scope = getScope()
    const hyprland = Hyprland.get_default()
    const activeId = createBinding(hyprland, "focused_workspace")(ws => ws?.id ?? -1)
    const workspaces = createBinding(hyprland, "workspaces")(ws => ws.filter(({id}) => id >= 0).map(({id}) => id))

    const [requestedId, setRequestedId] = createState([] as number[])
    let urgentConnection = hyprland.connect("urgent", (_, urgentClient) => {
        let workspaceId = urgentClient?.workspace?.id ?? -1
        let requestedIds = requestedId.get()
        if (workspaceId > 0 && workspaceId <= (WORKSPACE_WIDTH * WORKSPACE_HEIGHT) && !requestedIds.includes(workspaceId)) {
            setRequestedId([...requestedIds, workspaceId])
        }
    })
    scope.onCleanup(() => hyprland.disconnect(urgentConnection))

    let activeIdConnection = activeId.subscribe(() => {
        let active = activeId.get();
        let requestedIds = requestedId.get()
        let index = requestedIds.indexOf(active)
        if (index >= 0) {
            requestedIds.splice(index, 1)
            setRequestedId(requestedIds)
        }
    })
    scope.onCleanup(() => activeIdConnection())

    let grid = new Gtk.Grid()
    grid.add_css_class("workspaces")

    for (let y = 0; y < WORKSPACE_HEIGHT; y++) {
        for (let x = 0; x < WORKSPACE_WIDTH; x++) {
            let workspaceButton = <WorkspaceButton
                hyprland={hyprland}
                id={x + y * WORKSPACE_WIDTH + 1}
                activeId={activeId}
                workspaces={workspaces}
                requestedId={requestedId}/> as Gtk.Widget
            grid.attach(workspaceButton, x, y, 1, 1)
        }
    }

    // return <box class="workspaces">
    //     <For each={workspaces}>
    //         {(id) => (
    //             <button
    //                 onClicked={() => hyprland.dispatch("workspace", `${id}`)}
    //                 class={activeId(i => `${i === id ? "focused" : ""}`)}>
    //                 <label label={`${id}`}/>
    //             </button>
    //         )}
    //     </For>
    // </box>
    return grid
}

function ClientTitle() {
    const hyprland = Hyprland.get_default()
    const focusedClient = createBinding(hyprland, "focused_client")
    return <box>
        <With value={focusedClient}>{(client) => {
            if (client) {
                let clientTitle = createBinding(client, "title")
                let clientClass = createBinding(client, "class")
                let title = createComputed([clientTitle, clientClass], (title, clazz) => {
                    if (title?.trim()) {
                        return title
                    } else if (clazz?.trim()) {
                        return clazz
                    } else {
                        return "UwU"
                    }
                })
                return <label class="client-title" label={title}/>
            }
            return <label class="client-title" label="UwU"/>
        }}</With>
    </box>
}

function Clock() {
    return <label class="clock" label={date}/>
}

function Notification({notif}: { notif: Notifd.Notification }) {
    return <box>
        <image iconName={createBinding(notif, "appIcon")}/>
        <label hexpand label={notif.summary}/>
        <button onClicked={() => notif.dismiss()}>
            <image iconName="window-close"/>
        </button>
    </box>
}

function Notifications() {
    const notifd = Notifd.get_default()
    const popups = createBinding(notifd, "notifications")
    const popup = popups(p => p[0])
    return <box class="notification" visible={popup(p => !!p)}>
        <menubutton>
            <box>
                <image iconName="preferences-desktop-notification-symbolic"/>
                <label label={popup(p => p?.summary || "")}/>
            </box>
            <popover>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <For each={popups}>{pop => <Notification notif={pop}/>}</For>
                </box>
            </popover>
        </menubutton>
    </box>
}

function VolumeSlider({volume, setVolume, muted, setMuted}: {
    volume: Accessor<number>,
    setVolume: (volume: number) => void,
    muted: Accessor<boolean>,
    setMuted: (muted: boolean) => void
}) {
    const icons: { [key: number]: string } = {
        101: "high-danger",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    const volumeIcon = createComputed([volume, muted], (volume1, muted1) => {
        let icon = muted1 ? 0 : [101, 67, 34, 1, 0].find(threshold => threshold <= volume1 * 100) ?? 0
        return `audio-volume-${icons[icon]}`
    })

    return <box class="volume-slider" css="min-width: 180px">
        <slider hexpand drawValue={false} onChangeValue={({value}) => {
            setVolume(value)
        }} value={volume}/>
        <label label={volume(vol => `${Math.floor(vol * 100)}%`)} css="min-width: 40px"/>
        <button onClicked={() => {
            setMuted(!muted.get())
        }}>
            <image iconName={volumeIcon}/>
        </button>
    </box>
}

function VolumeSlider2({stream}: { stream: Wp.Endpoint | Wp.Stream }) {
    return <VolumeSlider volume={createBinding(stream, "volume")} setVolume={(volume) => stream.volume = volume}
                         muted={createBinding(stream, "mute")} setMuted={(muted) => stream.mute = muted}/>
}

function EndpointsList({endpoints}: { endpoints: Accessor<Wp.Endpoint[]> }) {
    return <scrolledwindow
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        minContentWidth={400}
        minContentHeight={400}>
        <box class="volumes" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <For each={endpoints}>{(endpoint) => (
                <box class="endpoint" orientation={Gtk.Orientation.VERTICAL}>
                    <box><label class="volume-name" label={endpoint.description}/>
                        <box hexpand/>
                    </box>
                    <box><label class="volume-path" label={endpoint.path}/>
                        <box hexpand/>
                    </box>
                    <box>
                        <button onClicked={() => {
                            endpoint.isDefault = true
                        }}>
                            <image
                                iconName={createBinding(endpoint, "isDefault")(isDefault => isDefault ? "rating" : "rating-unrated")}/>
                        </button>
                        <VolumeSlider2 stream={endpoint}/>
                    </box>
                </box>
            )}</For>
        </box>
    </scrolledwindow>
}

function StreamsList({streams}: { streams: Accessor<Wp.Stream[]> }) {
    return <scrolledwindow
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        minContentWidth={400}
        minContentHeight={400}>
        <box class="volumes" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <For each={streams}>{(stream) => (
                <box class="stream" orientation={Gtk.Orientation.VERTICAL}>
                    <box><label class="volume-name" label={stream.description}/>
                        <box hexpand/>
                    </box>
                    <box><label class="volume-path" label={stream.name}/>
                        <box hexpand/>
                    </box>
                    <VolumeSlider2 stream={stream}/>
                </box>
            )}</For>
        </box>
    </scrolledwindow>
}

function Volume() {
    const wp = Wp.get_default();
    if (wp === null) return <label label="Audio Broken"/>

    const audio = wp.audio
    const speakers = createBinding(audio, "speakers")
    const microphones = createBinding(audio, "microphones")
    const streams = createBinding(audio, "streams")
    const recorders = createBinding(audio, "recorders")

    const notebook = new Gtk.Notebook()
    notebook.append_page(<EndpointsList endpoints={speakers}/> as Gtk.Widget, <label label="Speakers"/> as Gtk.Widget)
    notebook.append_page(<EndpointsList endpoints={microphones}/> as Gtk.Widget, <label
        label="Microphones"/> as Gtk.Widget)
    notebook.append_page(<StreamsList streams={streams}/> as Gtk.Widget, <label label="App Outputs"/> as Gtk.Widget)
    notebook.append_page(<StreamsList streams={recorders}/> as Gtk.Widget, <label label="App Inputs"/> as Gtk.Widget)

    return <box class="volume" css="min-width: 180px">
        <menubutton>
            <image iconName="preferences-desktop-sound"/>
            <popover>
                {notebook}
            </popover>
        </menubutton>
        <VolumeSlider2 stream={audio.default_speaker}/>
    </box>
}

function SysTray() {
    const tray = Tray.get_default()

    const items = createBinding(tray, "items")

    return <box>
        <For each={items}>{item => (
            <menubutton
                tooltipMarkup={createBinding(item, "tooltipMarkup")}
                menuModel={createBinding(item, "menuModel")}
                $={(self) => {
                    const scope = getScope()
                    self.insert_action_group("dbusmenu", item.actionGroup)

                    let conn = item.connect("notify::action-group", () => {
                        self.insert_action_group("dbusmenu", item.actionGroup)
                    })
                    scope.onCleanup(() => item.disconnect(conn))
                }}>
                <image gicon={createBinding(item, "gicon")}/>
            </menubutton>
        )}</For>
    </box>
}

function BatteryUi() {
    const battery = Battery.get_default()
    const percent = createBinding(battery, "percentage")(p => `${Math.floor(p * 100)}%`)
    return <box>
        <image iconName={createBinding(battery, "iconName")}/>
        <label css="padding-left: 2px" label={percent}/>
    </box>
}

function Left() {
    return <box class="left">
        <box class="left-box" spacing={8}>
            <Workspaces/>
        </box>
    </box>
}

function Center() {
    return <box class="center">
        <centerbox class="center-box">
            <box $type="start"/>
            <ClientTitle $type="center"/>
            <box $type="end"/>
        </centerbox>
    </box>
}

function Right() {
    return <box class="right" halign={Gtk.Align.END}>
        <box class="right-box" spacing={8}>
            <Notifications/>
            <Volume/>
            <SysTray/>
            <Clock/>
            {/*<BatteryUi/>*/}
        </box>
    </box>
}

export default function Bar(gdkmonitor: Gdk.Monitor, monitorId: number) {
    const {TOP, LEFT, RIGHT} = Astal.WindowAnchor

    return (
        <window
            visible
            name={`bar-${monitorId}`}
            class="bar"
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={app}
        >
            <centerbox class="bar-inner">
                <Left $type="start"/>
                {/*<button*/}
                {/*    $type="start"*/}
                {/*    onClicked={() => execAsync("echo hello").then(console.log)}*/}
                {/*    hexpand*/}
                {/*    halign={Gtk.Align.CENTER}*/}
                {/*>*/}
                {/*    <label label="We lcome to AGS!"/>*/}
                {/*</button>*/}
                <Center $type="center"/>
                {/*<box $type="center"/>*/}
                <Right $type="end"/>
                {/*<menubutton $type="end" hexpand halign={Gtk.Align.CENTER}>*/}
                {/*    <label label={date}/>*/}
                {/*    <popover>*/}
                {/*        <Gtk.Calendar/>*/}
                {/*    </popover>*/}
                {/*</menubutton>*/}
            </centerbox>
        </window>
    )
}

export function fixBars() {
    app.get_windows().forEach(win => {
        if (win.name?.startsWith("bar-")) {
            win.close()
            app.remove_window(win)
        }
    })
    app.get_monitors().map(Bar)
}
