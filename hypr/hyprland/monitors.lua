------------------
---- MONITORS ----
------------------

require("hyprland/config")

-- See https://wiki.hypr.land/Configuring/Basics/Monitors/
if desktop then
  hl.monitor({
    output   = mainMonitor,
    mode     = "3840x2160@60",
    position = "3840x0",
    scale    = 1,
  })
  
  hl.monitor({
    output   = altMonitor,
    mode     = "3840x2160@60",
    position = "0x0",
    scale    = 1,
  })
else
  hl.monitor({
    output   = mainMonitor,
    mode     = "preferred",
    position = "auto",
    scale    = 1,
  })
end

