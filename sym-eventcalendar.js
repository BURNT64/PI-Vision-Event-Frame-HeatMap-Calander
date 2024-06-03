window.PIVisualization = window.PIVisualization || {};
window.PIVisualization.ClientSettings = window.PIVisualization.ClientSettings || {};

(function (PV) {
    'use strict';

    function symbolVis() { };
    PV.deriveVisualizationFromBase(symbolVis);

    //function init(scope, element) {
    symbolVis.prototype.init = function(scope, elem, $http, $q) {
        // Get the eventcalendar-container element
        let  calendarelement = document.querySelector('.eventcalendar-container');
        //console.log(calendarelement);
        // Globals
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChanged;
        this.onResize = resize;
        let origin = window.location.origin;
        let baseUrl = origin + "/piwebapi/";
        let dataUpdateCounter = 0;

        const NoEvArray = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        function dataUpdate(data) {
            //console.log("dataUpdateCounter before: ", dataUpdateCounter);
            if (dataUpdateCounter==0)
            {
                dataUpdateCounter=12; // set to 1 min for safety
                scope.UpdateEvents();
                //UpdateCalendar();
            } else dataUpdateCounter-=Math.sign(scope.config.AutoUpdatePeriod);
            //console.log("dataUpdateCounter after: ", dataUpdateCounter);
        }

        function UpdateCalendar() {
            //console.log("config.MaxDailyEvents: ", scope.config.MaxDailyEvents);
            //const NoEvArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            let dys = document.querySelectorAll('[id^="day"]');
            for (let i = 0; i < dys.length; i++) {
                // for testing color scale
                //NoEvArray[i] = i;
                //NoEvArray[i] = Math.floor(Math.random()*100);
                //console.log(NoEvArray);
                let fCol = fn_fillColor(NoEvArray[i]);
                let tCol = fn_textColor(NoEvArray[i]);
                dys[i].style.setProperty('background', fCol);
                dys[i].style.setProperty('color', tCol);
                //console.log(dys.length);
                //console.log(dys[i].id);
                //console.log(fCol);
                //console.log(tCol);
            };
            let dysNoEv = document.querySelectorAll('[id^="NoEv"]');
            for (let i = 0; i < dysNoEv.length; i++) {
                dysNoEv[i].innerHTML = "("+NoEvArray[i]+")";
                //console.log(dysNoEv[i].innerHTML);
            };
            console.log("UpdateCalendar: ", NoEvArray);;
        };

        // Query all Event Frames from the database of the pulled in element 
        scope.UpdateEvents = function() {
            let body = {};
            let namestream = scope.symbol.DataSources[0];
            let fullPath = namestream.replace(/af\:(.*)/,'$1');
            let path = fullPath.split("?")[0];
            //let isCurrentMo = (presentmonth===new Date().getMonth() && presentyear===new Date().getFullYear()) ? true : false;
            let SDatestring = presentyear + "-" + (presentmonth+1) + "-" + "1";
            let SDateCalendar = new Date(SDatestring);
            //let EDatestring = (isCurrentMo) ? "*" : presentyear + "-" + (presentmonth+1) + "-" + lastdayofmonth; // misses the last day of month
            //let EDateCalendar = new Date((isCurrentMo) ? presentyear + "-" + (presentmonth+1) + "-" + presentday : presentyear + "-" + (presentmonth+1) + "-" + lastdayofmonth);
            
            let EDateCalendar = new Date(SDatestring);
            EDateCalendar.setMonth(SDateCalendar.getMonth() + 1);
            let EDatestring = EDateCalendar.toDateString();
            let getDataStreamURL = encodeURI(baseUrl + "elements?path=" + path);
            //console.log("Update Events.....");
            //console.log("SDatestring: ", SDatestring, "; EDatestring: ", EDatestring);
            //console.log("SDateCalendar: ", SDateCalendar.toString(), "; EDateCalendar: ", EDateCalendar.toString());
            //console.log("namestream: ", namestream, "fullPath: ", fullPath, "; path: ", path);
            //console.log("getDataStreamURL: ", getDataStreamURL);

            // Robiiiiiiiiii
            /*body = {
                "1": {
                    "Method": "GET",
                    "Resource": getDataStreamURL						
                },
                "2": {
                    "Method": "GET",
                    "Resource": "{0}" + "?StartTime=" + SDatestring + "&EndTime=" + EDatestring,
                    "Headers": {
                        'Content-Type': 'application/json'
                    },
                    "ParentIds": ["1"],
                    "Parameters": ["$.1.Content.Links.EventFrames"]
                }
            };*/

            body = {
                "1": {
                    "Method": "GET",
                    "Resource": getDataStreamURL						
                },
                "2": {
                    "Method": "GET",
                    "Resource": "{0}",
                    "Headers": {
                        'Content-Type': 'application/json'
                    },
                    "ParentIds": ["1"],
                    "Parameters": ["$.1.Content.Links.Database"]
                },
                "3": {
                    "Method": "GET",
                    //"Resource": "{0}" + "?StartTime=" + "1-4-2024" + "&EndTime=" + EDatestring,
                    "Resource": "{0}" + "?StartTime=" + SDatestring + "&EndTime=" + EDatestring,
                    "Headers": {
                        'Content-Type': 'application/json'
                    },
                    "ParentIds": ["2"],
                    "Parameters": ["$.2.Content.Links.EventFrames"]
                }
            };

            //console.debug(body);
            //return $http.get(getDataStreamURL,{withCredentials: true})
            $http.post(baseUrl + 'batch', JSON.stringify(body), {withCredentials: true})
            .then((response) => {
                var NextItemURL = "";
                
                // function to process Event Frame items in result data JSON
                function ProcessEventItems(itemJSON) {
                    // iterating all EF objects
                    Object.entries(itemJSON).forEach(function ([key, item]) {
                        //console.log("Key: ",key);
                        if (typeof item === 'object' && item !== null) {
                            //console.log(item);
                            // Looking fos StarTime and EndTime KVPs
                            let SDate = null;
                            let EDate = null;
                            Object.entries(item).forEach(function ([key, item]) {
                                //console.log(key, typeof item);
                                if (typeof item === 'string' && item !== null) {
                                    if (key == "StartTime") { SDate = new Date(item);}; //console.log("SDate: ", SDate.toString());};
                                    if (key == "EndTime") { EDate = new Date(item);}; //console.log("EDate: ", EDate.toString());};
                                }
                            });
                            if (SDate != null && EDate != null) {
                                let SDateMax = new Date(Math.max(SDate,SDateCalendar));
                                let EDateMin = new Date(Math.min(EDate,new Date(Math.min(EDateCalendar-1,new Date()))));
                                //console.log("SDateMax: ", SDateMax.toString());
                                //console.log("EDateMin: ", EDateMin.toString());
                                let SDay = SDateMax.getDate();
                                let EDay = EDateMin.getDate();
                                //console.log("SDay: ",SDay);
                                //console.log("EDay: ",EDay);
                                NoEvArray.forEach((v, i) => {
                                    if (SDay - 1 <= i && EDay - 1 >= i) { NoEvArray[i] += 1; }; //console.log("Added: ",i);}; 
                                });
                            }; // if (SDate != null && EDate != null)
                        }; // if (typeof item === 'object' && item !== null)

                        //console.log(key, item);
                    }); // iteraring all EF objects
                } // function 'ProcessEventItems'

                // Recursive function to process multiple pages with 'Next' links
                function GetNextPage(urlNext) {
                    console.log("GetNextPage: ", urlNext);
                    if (urlNext === "") { // If no more 'Next'
                        // Finalize data update
                        dataUpdateCounter = scope.config.AutoUpdatePeriod * 12 + 1;
                        console.log("Final result: ", NoEvArray);
                        UpdateCalendar();
                    } else { // If more 'Next'
                        $http.get(urlNext, { withCredentials: true })
                            .then((response1) => {
                                console.log("STATUS of Next:", response1.status);
                                if (response1.status == 200) {
                                    scope.Value = response1.data.Items;
                                    ProcessEventItems(scope.Value);
                                    //console.log("Mid-result: ", NoEvArray);
                                    if ("Next" in response1.data.Links) {
                                        NextItemURL = response1.data.Links.Next; // Check Links for more 'Next' links
                                    } else NextItemURL = "";
                                    //console.log("Calling 'GetNextPage' recursively...");
                                    GetNextPage(NextItemURL);
                                    //console.log("End of 'GetNextPage'.");
                                }; // if response OK
                            }).catch((error) => { console.log(error); NextItemURL = ""; });
                    }; // if (urlNext === "")
                } // function 'GetNextPage'
                
                //console.log("Batch last STATUS:", response.data[3].Status);
                if (response.data[3].Status == 200 || response.data[3].Status == 207) {
                    scope.Value = response.data[3].Content.Items;
                    //scope.Value=response.data[3].Content;
                    //console.log(NoEvArray);
                    NoEvArray.forEach((v,i) => {NoEvArray[i]=0;}); // reset daily Event counters
                    ProcessEventItems(scope.Value);
                    //console.log("Http first result: ", NoEvArray);
                    // Multiple response pages?
                    if ("Next" in response.data[3].Content.Links) {
                        NextItemURL = response.data[3].Content.Links.Next; // Check Links for 'Next' if multiple result pages
                    } else NextItemURL = "";
                    //console.log("NextItemURL: ", NextItemURL);
                    // Call the recursive function 'GetNextPage'
                    GetNextPage(NextItemURL);
                    /*// Finalize data update
                    dataUpdateCounter = scope.config.AutoUpdatePeriod * 12 + 1;
                    console.log("Final result: ", NoEvArray);
                    UpdateCalendar();*/
                }; // if response OK
            }).catch((error) => console.log(error));
        };

        function configChanged(newConfig, oldConfig) {
            //console.log("Config Changed... nconfig.HeaderColor: ", newConfig.HeaderColor);
            //console.log("nconfig.BackgroundColor: ", newConfig.BackgroundColor);
            //console.log("nconfig.MaxDailyEvents: ", newConfig.MaxDailyEvents);
            //console.log("nconfig.ColorHue: ", newConfig.ColorHue);
            //console.log("nconfig.AutoUpdatePeriod: ", newConfig.AutoUpdatePeriod);
            
            dataUpdateCounter = dataUpdateCounter==0 ? 0 : newConfig.AutoUpdatePeriod * 12 + 1;
            
            if (newConfig.MaxDailyEvents === null || newConfig.MaxDailyEvents === undefined) {scope.config.MaxDailyEvents=20;};
            if (newConfig.AutoUpdatePeriod === null || newConfig.AutoUpdatePeriod === undefined) {scope.config.AutoUpdatePeriod=10;};

            let rte = document.querySelector(":root");
            rte.style.setProperty('--hdc', newConfig.HeaderColor);
            rte.style.setProperty('--bgc', newConfig.BackgroundColor);
            let ecc = document.getElementsByClassName("eventcalendar-container");
            const ecccompstyle=window.getComputedStyle(ecc[0], null);
            let hde = document.getElementsByClassName("calendar-header");
            const hdecompstyle=window.getComputedStyle(hde[0], null);
            //console.log("bckgrndc: ", ecccompstyle.backgroundColor, ", Headerc: ", hdecompstyle.color);
            //console.log("comps fw: ", ecccompstyle.fontWeight, "comps W: ", ecccompstyle.width, ", H: ", ecccompstyle.height);
            //console.log("ecc fw: ", ecc.style.fontWeight, ", ecc Width: ", ecc.style.width, ", ecc Height: ", ecc.style.height);
            //console.log("ce fw: ", calendarelement.style.fontWeight, ", ce Width: ", calendarelement.style.width, ", ce Height: ", calendarelement.style.height);
            //ecc[0].style.background = newConfig.BackgroundColor;
            UpdateCalendar();
        };

        function resize(width, height) {
            //updateRowHeight();
            let eca = document.getElementsByClassName("calendar-area");
            const ecacompstyle=window.getComputedStyle(eca[0], null);
            //console.log("Resize:  Width: ", ecacompstyle.width, ", Height: ", ecacompstyle.height);
            //console.log("Resize:  Width: ", (parseFloat(ecacompstyle.width) - 20 ) / 300, ", Height: ", (parseFloat(ecacompstyle.height) - 36 ) / 100);
            const dayFontSize =  Math.min((parseFloat(ecacompstyle.width) - 20 ) / 300, (parseFloat(ecacompstyle.height) - 36 ) / 100, 1.6);
            let rte = document.querySelector(":root");
            rte.style.setProperty('--daysize', `${dayFontSize.toString()}em`);
            //console.log("Resize:  daysize: ", ecacompstyle.getPropertyValue('--daysize'));
            //console.log("Resize:  fontSize: ", ecacompstyle.fontSize);
            //rte.style.setProperty('--daysize', "1em");
        };

        function fn_fillColor(NoE) {
            let maxev = scope.config.MaxDailyEvents;//100;//config.MaxDailyEvents;
            let colorsat = Math.floor(NoE/maxev*100);
            let colorlig = Math.floor(10 + Math.min(NoE/maxev,1)*80);
            //console.log("Color saturation: ",colorsat);
            //console.log("Color lightness: ",colorlig);
            let fcolor="hsl("+scope.config.ColorHue+","+colorsat+"%,"+colorlig+"%)";
            /*let coR = 64;
            let coG = 64 + Math.floor((255-64)/maxev*NoE);
            let coB = 64; 
            let fcolor = "rgb("+coR+","+coG+","+coB+")";*/
            return  fcolor;
        };

        function fn_textColor(NoE) {
            let maxev = scope.config.MaxDailyEvents;
            //let greylig = Math.floor(10 + NoE/maxev*80);
            //let tcolor="hsl("+scope.config.ColorHue+",0%,"+greylig+"%)";
            let tcolor = (NoE/maxev*100>50) ? "#242424" : "#eaeaea";
            return  tcolor;
        };
        //};

        //---------- Calendar ---------------
        let presentdate=new Date(); // creates a new date object with the current date and time
        let presentyear=presentdate.getFullYear(); // gets the current year
        let presentmonth=presentdate.getMonth(); // gets the current month (index based, 0-11)
        let presentday=presentdate.getDate(); // gets the current day
        let lastdayofmonth=0; // last date(day) of the month

        const calendararea=document.querySelector(".calendar-area"); // selects the element with class "calendar-area"
        const currdate=document.querySelector(".calendar-current-date"); // selects the element with class "calendar-current-date"
        const prenexIcons=document.querySelectorAll(".calendar-navigation button"); // selects all elements with class "calendar-navigation span"
        // array of month names
        const months=["January","February","March","April","May","June","July","August","September","October","November","December"]; 
        
        // function to generate the calendar
        const manipulate=() => {
            //console.log("presentdate: ", presentdate.toDateString());
            // get the first day of the month
            let dayone=new Date(presentyear, presentmonth, 1).getDay();
            //console.log("dayone: ", dayone);
            // get the last date(day) of the month
            lastdayofmonth=new Date(presentyear, presentmonth + 1, 0).getDate();
            //console.log("lastdayofmonth: ", lastdayofmonth);
            // get the day of the last date of the month
            let dayend=new Date(presentyear, presentmonth, lastdayofmonth).getDay();
            //console.log("dayend: ", dayend);
            // get the last date of the previous month
            let prevmonthlastdate=new Date(presentyear, presentmonth, 0).getDate();
            //console.log("prevmonthlastdate: ", prevmonthlastdate);
            let ddd=""; // variable to store the generated calendar HTML
        
            // loop to add the last days of the previous month
            for (let i=dayone; i > 0; i--) {
                ddd+=`<div class="inactiveday">${prevmonthlastdate - i + 1}</div>`;
            }
        
            // loop to add the days of the current month
            for (let i=1; i <=lastdayofmonth; i++) {
                // check if the current date is today
                let isToday=i===presentday && presentmonth===new Date().getMonth() && presentyear===new Date().getFullYear() ? "activeday": "normalday";
                //ddd+=`<div id="day${i}" class="${isToday}">${i} <span style="font-size:60%;">( ${NoEvArray[i-1]} )</span></div>`;
                ddd+=`<div id="day${i}" class="${isToday}"><p>${i} <span id="NoEv${i}" style="font-size:67%;">(${NoEvArray[i-1]})</span></p></div>`;
            }
        
            // loop to add the first days of the next month
            for (let i=dayend; i < 6; i++) {
                ddd+=`<div class="inactiveday">${i - dayend + 1}</div>`
            }
        
            // update the text of the current date element with the formatted current month and year
            currdate.innerText=`${months[presentmonth]} ${presentyear}`;
        
            // update the HTML of the dates element with the generated calendar
            calendararea.innerHTML=ddd;
        }
        
        manipulate();
        
        // Attach a click event listener to each icon
        prenexIcons.forEach(icon=> {
            // When an icon is clicked
            icon.addEventListener("click", ()=> {
                // Check if the icon is "calendar-prev" or "calendar-next"
                presentmonth=icon.id==="calendar-prev" ? presentmonth - 1 : presentmonth + 1;
                // Check if the month is out of range
                if (presentmonth < 0) { // If Prev Year
                    // Set the year to the previous year
                    presentyear=presentyear-1;
                    // Set the month to the new Decemer
                    presentmonth=11;
                }
                else if (presentmonth > 11) { // If Next Year
                    // Set the year to the next year
                    presentyear=presentyear+1;
                    // Set the month to the new January
                    presentmonth=0;
                }
                // No venturing to the future 
                if ((presentyear==presentdate.getFullYear() && presentmonth>presentdate.getMonth()) || presentyear>presentdate.getFullYear()) {
                    presentyear=presentdate.getFullYear();
                    presentmonth=presentdate.getMonth();
                } else {
                    //console.log("presentmonth: ", presentmonth);
                    // Call the manipulate function to update the calendar display
                    manipulate();
                    // Call the UpdateEvents function to update Event Frames for the new month
                    scope.UpdateEvents();
                }
            });
        });
        //--------- Calendar END ------------
        
    }; // symbolVis.prototype.init

    function getDefaultConfig() {
        let config = {
            //Columns: ['EventName', 'AssetName', 'StartTime', 'EndTime', 'Acknowledged'],
            //ColumnWidths: [175, 175, 175, 175, 175],
            AutoUpdatePeriod: 15,
            HeaderColor: "#121212",
            BackgroundColor: "#8a8a8a",
            Width: 340,
            Height: 220,
            MaxDailyEvents: 100,
            ColorHue: 120
            //SearchModel: {},
            //SortColumn: 'StartTime',
            //Style: 'Dark'
        };
        return config;
    }

    function loadConfig(config) {
        // Remove migration flag
        //delete config.updateDisplay;
        /*if (config) {
            if (config.BackgroundColor !== undefined) {
                delete config.BackgroundColor;
            }
            if (config.Width !== undefined) {
                delete config.Width;
            }
            if (config.Height !== undefined) {
                delete config.Height;
            }
        }*/
        // Prevent symbol host from merging this config with the default config
        return true;
    }

    // Symbol definition
    //var definition = PV.deriveVisualizationFromBase({
    var definition = {
        typeName: 'eventcalendar',
        displayName: 'Event-Calendar',

        //templateUrl: 'scripts/app/editor/symbols/ext/sym-eventcalendar-template.html',   // template for this symbol
        //tableTemplate: PV.ContextPath + 'scripts/app/editor/symbols/ext/sym-eventcalendar-template.html', // referenced in symbol template
        //cellTemplateUrl: 'events-table-cell-template', // cell template referenced by table generator, created in JS above

        iconUrl: 'Images/chrome.event_table_white.svg',
        //columnConfig: tableColumns, // column definitions referenced by table generator
        //sortProperty: 'SortColumn', // property to modify when sorting
	
        // multistate properties
//        StateVariables: ['Fill', 'Blink'],
//        multipleMultistate: true,

        // allows drag-drop from events search nab pane
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
//        defaultAllowDataSourceClass: 'allow-data-type-ef-attribute allow-data-type-ef-attribute_category',
//        generateDatasourcesFromDraggedItems: generateDatasourcesFromDraggedItems,

        // Constructor and dependencies for symbol instantiation
        visObjectType: symbolVis, //eventsTableVis,
        inject: [
            '$http'
//            '$timeout'//, // must be first for PV.getDerivedTableDefinitionFromTemplate
//            'webServices', 'log', 'symbolEventSearchService', 'assetContext', 'timeProvider', 'displayProvider'
        ],

        getDefaultConfig: getDefaultConfig,
        loadConfig: loadConfig,
//        selectSymbolDefaultsFromConfig: selectSymbolDefaultsFromConfig,
        configOptions: function(){
            return [
                {
                    title: "Calendar Settings",
                    mode: "format"
                }
            ];
        },
        // various flags to disable default actions for a symbol
//        setupForCustomDataRequest: setupForCustomDataRequest,
//        excludedFromSymbolCreation: true,
        tooltipOptOut: true,
        supportsNavigationLinks: false,
        supportsSymbolSwitching: false
    }//});

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);
