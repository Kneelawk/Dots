------------------
---- MONITORS ----
------------------

require("hyprland/config")

-- See https://wiki.hypr.land/Configuring/Basics/Monitors/
if desktop then
  hl.monitor({
    output   = "DP-1",
    mode     = "3840x2160@60",
    position = "3840x0",
    scale    = 1,
  })
  
  hl.monitor({
    output   = "DP-2",
    mode     = "3840x2160@60",
    position = "0x0",
    scale    = 1,
  })
else
  hl.monitor({
    output   = "",
    mode     = "preferred",
    position = "auto",
    scale    = 1,
  })
end

