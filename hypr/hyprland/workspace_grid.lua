require("hyprland/config")

------------------
---- KEYBINDS ----
------------------

local binds = {
  ["7"] = 1,
  ["8"] = 2,
  ["9"] = 3,
  ["0"] = 4,
  ["U"] = 5,
  ["I"] = 6,
  ["O"] = 7,
  ["P"] = 8,
  ["J"] = 9,
  ["K"] = 10,
  ["L"] = 11,
  semicolon = 12,
  ["M"] = 13,
  comma = 14,
  period = 15,
  slash = 16,
--  ["H"] = 17,
}

function workspace_binds(key, number)
  hl.bind(winMod .. " + " .. key, hl.dsp.focus({ workspace = number }))
  hl.bind(winMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = number }))
end

for key,value in pairs(binds) do
  workspace_binds(key, value)
end

if desktop then
  workspace_binds("H", 17)
end


-------------------------
---- WORKSPACE RULES ----
-------------------------

if desktop then
  for i=1,16 do
    hl.workspace_rule({
      workspace = i,
      monitor   = "DP-1",
    })
  end
  
  hl.workspace_rule({
    workspace  = "17",
    monitor    = "DP-2",
    default    = true,
    persistent = true,
  })
end

