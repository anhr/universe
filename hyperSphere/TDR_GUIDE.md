
# How to Increase or Disable the TDR (Timeout Detection and Recovery) Limit in Windows

When processing large-scale 4D math or dense point clouds in the **Hypersphere Universe Engine**, your GPU might take longer than 2 seconds to complete a single compute pass (`dispatchWorkgroups`). 

By default, Windows monitors the GPU response time. If a single GPU operation takes longer than **2 seconds**, the operating system assumes the graphics card is frozen, forcibly restarts the display driver, and terminates the application context. In your browser console, this results in the following crash errors:
* `DXGI_ERROR_DEVICE_HUNG (0x887A0006)`
* `CRITICAL ERROR: GPU Device Lost`

To solve this issue, you can either **decrease your configuration parameters** (such as `pointsPerStep` or `totalSteps`) or **increase the Windows TDR timeout limit** using the guide below.

---

## ⚠️ Important Disclaimer
> **WARNING:** Modifying the Windows Registry can cause system instability if done incorrectly. If you completely disable or drastically increase the TDR limit, and your WGSL shader enters an infinite loop, Windows will not be able to automatically recover the display driver. Your screen will freeze, and you will have to manually restart your PC or press `Win + Ctrl + Shift + B` to reset the graphics stack. Proceed at your own risk.

---

## Step-by-Step Guide to Change TDR Settings

### Step 1: Open the Windows Registry Editor
1. Press the **`Win + R`** keys on your keyboard to open the **Run** dialog box.
2. Type **`regedit`** and press **Enter** (or click OK). 
3. If prompted by User Account Control (UAC), click **Yes** to grant administrator permissions.

### Step 2: Navigate to the GraphicsDrivers Key
In the left sidebar of the Registry Editor, navigate to the following path:
```text
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\GraphicsDrivers

