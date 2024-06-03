# PI-Vision-Event-Frame-HeatMap-Calander

********************************************************************************
 Event Frame Calendar - PIVision Custom Symbol
 IT Vizion Inc.
 June 2024
********************************************************************************

![Event frame count display](https://github.com/BURNT64/PI-Vision-Event-Frame-HeatMap-Calander/assets/88587722/4b9d3bb6-9ab5-464b-af7e-02f487518bca)

# Function
 The Event Calendar is a custom PI Vision symbol to visualize the monthly
frequency of all Event Frames within a given PI AF database.
The calendar shows the selected month, displaying the number of all active Event
Frames day by day. The background color for each day corresponds to the active
events on a scale from dark grey to a light color based on the configuration.

The symbol is built on the PI Vision extensibility tool including Javasript,
HTML and CSS files. Data is obtained from the PI AF server via PIWebAPI calls. 

# Usage
 After selecting the symbol icon and dragging an AF element to the display,
Event Frame Calendar symbol appears with the actual month initially.
It takes ALL Event Frames from the PI AF database of the selected element.
Although the symbol can be resized, its minimum size is 340x220 pixels.
Months can be scrolled with the navigation buttons '<<' and '>>', but venturing
to the future is not possible.

# Calendar Settings
 The configuration setting can be invoked by right-clicking on the symbol.

# Configuration section:
 - Header color: color pick for the text of title, month and year
 - Background color: color pick for the symbol's background
 - Events/day cap: daily maximum number of events, at which the color of days
     get its brightest on the scale (2-1000, def.: 100)
 - Color hue: Hue for the color-scale from dark grey to the brightest of it,
     green by default

# Data Update section:
 - Auto Update (mins): Data update frequency in minutes (0-1440, def.: 15),
    zero value turns off auto-updating, events get refreshed only when
    navigating to previous or next month  

 Numeric values are integers and reset to default immediately in case of any
invalid input.

# Symbol source files
 - sym-eventcalendar-template
 - sym-eventcalendar.js
 - sym-eventcalendar-style.css
 - sym-eventcalendar-config.html
