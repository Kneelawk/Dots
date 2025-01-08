import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { Variable } from "astal"

import Apps from "gi://AstalApps"

import { APPLAUNCHER_NAME } from "../globals";

const apps = Variable(new Apps.Apps())

function hide() {
    App.get_window(APPLAUNCHER_NAME)?.hide()
}

function AppItem({app}: {app: Apps.Application}) {
    return <button
        onClicked={() => {
            hide()
            app.launch()
        }}>
            <box className="app">
                <icon icon={app.icon_name || ""} icon_name={app.icon_name || ""} iconSize={6} pixelSize={48} />
                <label className="title" label={app.name} xalign={0} truncate />
            </box>
        </button>
}

function AppLauncherMain({width = 500, height = 500, text}: {width: number, height: number, text: Variable<string>}) {
    const list = Variable.derive([text, apps], (text1, apps1) => apps1.fuzzy_query(text1))

    const applications = list(l => l.map(app => <AppItem app={app} />))

    const listBox = <box vertical width_request={width}>{applications}</box>

    const entry = <entry
        hexpand
        onActivate={() => {
            hide()
            list.get()[0]?.launch()
        }}
        onChanged={self => text.set(self.text)}
        text={text()} />
    
    return <box
        vertical
        className="applauncher-box">
            {entry}
            <scrollable
                hscroll={Gtk.PolicyType.NEVER}
                min_content_width={width}
                min_content_height={height}>
                    {listBox}
                </scrollable>
        </box>
}

export function AppLauncher() {
    const text = Variable("")

    return <window
        name={APPLAUNCHER_NAME}
        application={App}
        visible={false}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}
        onShow={() => text.set("")}
        onKeyReleaseEvent={(self, event) => {
            if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                self.hide()
            }
        }}>
            <AppLauncherMain width={500} height={500} text={text} />
        </window>
}

export function reloadApps() {
    apps.set(new Apps.Apps())
}