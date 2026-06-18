
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
```
### Step 3: Create or Modify the `TdrDelay` Parameter
1. Check the right panel for a value named `TdrDelay`.

2. If it does not exist:

   * Right-click on an empty space in the right pane, select New, and click DWORD (32-bit) Value.

   * Name it exactly `TdrDelay` (case-sensitive).

3. Double-click on `TdrDelay` to edit it:

   * Change the Base setting to Decimal.

   * In the Value data field, enter the time limit in seconds.

      * Recommended for heavy 4D math: 15 or 30 (this grants the GPU 15 or 30 seconds of uninterrupted execution instead of the default 2).

   * Click OK.

### Step 4: Create or Modify the `TdrDdiDelay` Parameter (Optional but Recommended)
To prevent downstream driver interface timeouts, configure the driver subsystem response limit alongside TdrDelay:

1. Check the right panel for a value named `TdrDdiDelay`.

2. If it does not exist:

   * Right-click on an empty space, select New, and click DWORD (32-bit) Value. Name it exactly `TdrDdiDelay`.

3. Double-click on TdrDdiDelay:

   * Change the Base setting to Decimal.

   * Set the Value data to match your TdrDelay value (e.g., 15 or 30).

   * Click OK.

### Step 5: How to Completely Disable TDR (Alternative Method)
If you do not want Windows to limit your GPU processing time at all:

1. In the same registry folder, create a new DWORD (32-bit) Value named TdrLevel.

2. Double-click it, set the Base to Decimal, and set the Value data to `0`.

3. Click OK.
(Note: If you need to re-enable TDR later, simply delete the TdrLevel key or set its value back to `3`).

### Step 6: Restart Your Computer
Changes made to the Windows Registry graphics keys will not take effect until you restart your operating system. Please save your work and reboot your PC.

## Alternative Solutions
If modifying the registry is not an option on your system (e.g., due to lack of Administrator privileges), you must scale down the simulation payload to prevent the 2-second timeout:

   * Decrease `config.pointsPerStep` to lower the workload per compute pass.

   * Reduce `config.totalSteps` to scale down the global memory allocation footprints.
