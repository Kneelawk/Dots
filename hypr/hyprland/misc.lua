----------------
----  MISC  ----
----------------

hl.config({
    misc = {
        force_default_wallpaper    = -1,    -- Set to 0 or 1 to disable the anime mascot wallpapers
        disable_hyprland_logo      = false, -- If true disables the random hyprland logo / anime girl background. :(
        allow_session_lock_restore = true,
    },
})


---------------
---- DEBUG ----
---------------



----------------------
---- NVIDIA FIXES ----
----------------------

hl.env("LIBVA_DRIVER_NAME", "nvidia")
hl.env("GBM_BACKEND", "nvidia-drm")
hl.env("__GLX_VENDOR_LIBRARY_NAME", "nvidia")
hl.env("NVD_BACKEND", "direct")


