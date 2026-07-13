-----------------------
---- WINDOWS RULES ----
-----------------------

-- See https://wiki.hypr.land/Configuring/Basics/Window-Rules/
-- and https://wiki.hypr.land/Configuring/Basics/Workspace-Rules/

hl.window_rule({
    -- Ignore maximize requests from all apps. You'll probably like this.
    name  = "suppress-maximize-events",
    match = { class = ".*" },

    suppress_event = "maximize",
})

hl.window_rule({
    -- Fix some dragging issues with XWayland
    name  = "fix-xwayland-drags",
    match = {
        class      = "^$",
        title      = "^$",
        xwayland   = true,
        float      = true,
        fullscreen = false,
        pin        = false,
    },

    no_focus = true,
})

hl.window_rule({
  name = "kitty-rules",
  match = {
    class = "^(kitty)$",
  },
  
  opacity = "0.8 1.0",
  no_blur = true,
})

hl.window_rule({
  name = "fix-adobe-drag",
  match = {
    class = "^(Adobe Substance 3D Painter|Substance Designer)$",
  },

  no_initial_focus = true,
})

hl.window_rule({
  name = "game-float",
  match = {
    class = "^(steam_app_438100)$",
  },

  float = true,
})

hl.window_rule({
  name = "pin-effy",
  match = {
    initial_title = "^(Discord Popout)$",
  },

  float = true,
  pin = true,
  opacity = "1.0 1.0",
})

hl.window_rule({ match = { class = "^(Tor Browser)$" }, float = true })
hl.window_rule({ match = { class = "^(hyprland-dialog)$" }, no_initial_focus = true })

