import app from "ags/gtk4/app"
import {Astal, Gdk, Gtk} from "ags/gtk4";
import {createComputed, createState, getScope, Accessor, Setter, For} from "ags"
import Apps from "gi://AstalApps"

import {APPLAUNCHER_NAME} from "../globals";
import GObject from "gi://GObject";

const [apps, setApps]: [Accessor<Apps.Apps>, Setter<Apps.Apps>] = createState(new Apps.Apps())

function hide() {
    app.get_window(APPLAUNCHER_NAME)?.hide()
}

function AppItem({app}: { app: Apps.Application }) {
    return <button
        onClicked={() => {
            hide()
            app.launch()
        }}>
        <box class="app">
            <image iconName={app.iconName || ""} pixelSize={48}/>
            <label class="title" label={app.name} xalign={0}/>
        </box>
    </button>
}

function AppLauncherMain({width = 500, height = 500, text, setText, visible}: {
    width: number,
    height: number,
    text: Accessor<string>,
    setText: Setter<string>,
    visible: (callback: () => void) => void
}) {
    const list = createComputed([text, apps], (text1, apps1) => apps1.fuzzy_query(text1))

    const listBox = <box orientation={Gtk.Orientation.VERTICAL} width_request={width}>
        <For each={list}>
            {(item, _: Accessor<number>) => (
                <AppItem app={item}/>
            )}
        </For>
    </box>

    const entry =
        <entry
            hexpand
            onActivate={() => {
                hide()
                list.get()[0]?.launch()
            }}
            onNotifyText={({text}) => setText(text)}
            text={text}/> as Gtk.Entry

    visible(() => {
        entry.grab_focus()
    })

    return <box
        orientation={Gtk.Orientation.VERTICAL} class="applauncher-box">
        {entry}
        <scrolledwindow
            hscrollbarPolicy={Gtk.PolicyType.NEVER}
            minContentWidth={width}
            minContentHeight={height}>
            {listBox}
        </scrolledwindow>
    </box>
}

export function AppLauncher() {
    const [text, setText]: [Accessor<string>, Setter<string>] = createState("")

    let visibleListener: () => void

    return <window
        name={APPLAUNCHER_NAME}
        application={app}
        visible={false}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.EXCLUSIVE}
        onShow={() => setText("")}
        $={(self) => {
            const scope = getScope()
            const conns: Map<GObject.Object, number> = new Map()
            const keyController = Gtk.EventControllerKey.new()
            self.add_controller(keyController)

            conns.set(keyController, keyController.connect("key-pressed", (_, keyval, keycode) => {
                if (keyval === Gdk.KEY_Escape) {
                    self.hide()
                }
            }))
            conns.set(self, self.connect("show", (_) => {
                visibleListener?.()
            }))

            scope.onCleanup(() => conns.forEach((id, obj) => obj.disconnect(id)))
        }}>
        <AppLauncherMain width={500} height={500} text={text} setText={setText}
                         visible={(callback) => visibleListener = callback}></AppLauncherMain>
    </window>
}

export function reloadApps() {
    setApps(new Apps.Apps())
}
