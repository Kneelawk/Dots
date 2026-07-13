require("hyprland/config")

---------------------
---- KEYBINDINGS ----
---------------------

-- https://wiki.hypr.land/Configuring/Basics/Binds/ for more
hl.bind(mainMod .. " + Q", hl.dsp.exec_cmd(terminal))
hl.bind(mainMod .. " + C", hl.dsp.window.close())
hl.bind(mainMod .. " + Escape", hl.dsp.exec_cmd("command -v hyprshutdown >/dev/null 2>&1 && hyprshutdown || hyprctl dispatch 'hl.dsp.exit()'"))
hl.bind(mainMod .. " + X", hl.dsp.exec_cmd(reload_cmd))
hl.bind(mainMod .. " + Z", hl.dsp.exec_cmd(reload_ags))
hl.bind(mainMod .. " + E", hl.dsp.exec_cmd(fileManager))
hl.bind(mainMod .. " + F", hl.dsp.exec_cmd(browser))
hl.bind(mainMod .. " + SHIFT + F", hl.dsp.exec_cmd(browser2))
hl.bind(mainMod .. " + V", hl.dsp.window.float({ action = "toggle" }))
hl.bind(mainMod .. " + R", hl.dsp.exec_cmd(menu))
hl.bind(mainMod .. " + Period", hl.dsp.window.pseudo())
hl.bind(mainMod .. " + Slash", hl.dsp.layout("togglesplit"))    -- dwindle only

-- Move focus with mainMod + arrow keys
hl.bind(mainMod .. " + H",  hl.dsp.focus({ direction = "left" }))
hl.bind(mainMod .. " + L", hl.dsp.focus({ direction = "right" }))
hl.bind(mainMod .. " + K",    hl.dsp.focus({ direction = "up" }))
hl.bind(mainMod .. " + J",  hl.dsp.focus({ direction = "down" }))

-- Example special workspace (scratchpad)
function scratch_workspace(key, name)
  hl.bind(mainMod .. " + " .. key,         hl.dsp.workspace.toggle_special(name))
  hl.bind(mainMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = ("special:" .. name) }))
end
scratch_workspace("W", "terminals")
scratch_workspace("A", "additional")
scratch_workspace("S", "system")
scratch_workspace("D", "scratch")

-- Scroll through existing workspaces with mainMod + scroll
-- hl.bind(mainMod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
-- hl.bind(mainMod .. " + mouse_up",   hl.dsp.focus({ workspace = "e-1" }))

-- Move/resize windows with mainMod + LMB/RMB and dragging
hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(),   { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })

-- Laptop multimedia keys for volume and LCD brightness
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"), { locked = true, repeating = true })
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"),      { locked = true, repeating = true })
hl.bind("XF86AudioMute",        hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"),     { locked = true, repeating = true })
hl.bind("XF86AudioMicMute",     hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),   { locked = true, repeating = true })
hl.bind("XF86MonBrightnessUp",  hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%+"),                  { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown",hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%-"),                  { locked = true, repeating = true })

-- Requires playerctl
hl.bind("XF86AudioNext",  hl.dsp.exec_cmd("playerctl next"),       { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPlay",  hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPrev",  hl.dsp.exec_cmd("playerctl previous"),   { locked = true })

-- Fullscreen keybinds
hl.bind(mainMod .. " + F11", hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle" }))
hl.bind(mainMod .. " + SHIFT + F11", hl.dsp.window.fullscreen({ mode = "maximized", action = "toggle" }))
hl.bind(mainMod .. " + CTRL + F11", hl.dsp.window.fullscreen_state({ internal = -1, client = 2, action = "toggle" }))
hl.bind(mainMod .. " + ALT + F11", hl.dsp.window.fullscreen_state({ internal = -1, client = -1, action = "set" }))

-- Launch Calculators
hl.bind(mainMod .. " + O", hl.dsp.exec_cmd(octave))
hl.bind(mainMod .. " + P", hl.dsp.exec_cmd(numpy))
hl.bind(mainMod .. " + SHIFT + Q", hl.dsp.exec_cmd(qalc))

-- App Push-To-Talk buttons
local mouseDevice = { device = { inclusive = true, list = mouseDevices }, ignore_mods = true }
local mouseDeviceR = { device = { inclusive = true, list = mouseDevices }, ignore_mods = true, release = true }

function pushToTalk(key, outputMod, outputKey, window)
  hl.bind(key, hl.dsp.send_shortcut({ mods = outputMod, key = outputKey, window = window }), mouseDevice)
  hl.bind(key, hl.dsp.send_shortcut({ mods = outputMod, key = outputKey, window = window }), mouseDeviceR)
end

pushToTalk(discordPTT, "", "F12", "class:^(vesktop|discord)$")
pushToTalk(minecraftPTT, "", "code:193", "class:^(.*Minecraft.*)$")

-- Lock Screen
hl.bind(mainMod .. " + ALT + L", hl.dsp.exec_cmd(lock_screen))

-- Screenshot
hl.bind("Print", hl.dsp.exec_cmd('grim -g "$(slurp)"'))
hl.bind("SHIFT + Print", hl.dsp.exec_cmd('grim -g "$(slurp)" - | wl-copy'))

