# Hypersphere Universe Engine

When you click the ► player button located in the lower left corner of the canvas, you start an iterative process of calculating the coordinates of points in the universe over time. You have two iteration options:

1. CPU calculations. These calculations take a long time.
2. GPU calculations. These calculations are performed tens of times faster than on the CPU.

Below is a guide on how to use the GPU for iteration.

## Technical Guide: Enabling High-Performance GPU for Google Chrome

If you notice that your WebGPU computations are running slower in Google Chrome compared to other browsers, it is likely because Windows is running Chrome on the integrated (Power Saving) GPU instead of your dedicated (High Performance) Graphics Card.

Follow these steps to force Google Chrome to use your high-performance GPU:

Step 1: Open Graphics Settings
Press the Windows Key on your keyboard or click the Start icon.

Type "Graphics settings" in the search bar and press Enter.

This will open the System > Display > Graphics menu.

Step 2: Locate or Add Google Chrome
Scroll down to the "Custom options for apps" section.

Look for Google Chrome in the list.

If Chrome is NOT in the list:

Click the "Browse" button under "Add an app".

Navigate to the following path (copy and paste this into the address bar of the file picker):
C:\Program Files\Google\Chrome\Application\

Select chrome.exe and click Add.

Step 3: Set High Performance Preference
Once Google Chrome appears in the list, click on it once to expand the options.

Click the "Options" button.

A "Graphics preference" window will pop up. Select "High performance" (this should list your dedicated GPU, e.g., NVIDIA or AMD).

Click "Save".

Step 4: Restart Chrome
Close all open Google Chrome windows.

Relaunch the browser for the changes to take effect.

You can verify the active GPU by typing chrome://gpu in the address bar and looking for the "GL_RENDERER" field.

