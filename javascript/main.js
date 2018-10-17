var currentfilter = {
    minbuild: 100,
    maxbuild: 6000,
    minarea: 0.0,
    maxarea: 10.0,
    minbdens: 160,
    maxbdens: 3000,
    mindist: 0,
    maxdist: 241000,
    mobile: "nofilter"
};

var currentSelection = null;
var info = L.control({position: 'bottomright'});

// measuring is used in leaflet.measure.js
var measuring = false; // ! check dependencies before deleting this variable

var buildingSlider = document.getElementById('sliderbuild');
var bdensitySlider = document.getElementById('sliderbdens');
var distanceSlider = document.getElementById('sliderdist');
var areaSlider = document.getElementById('sliderarea');

var input0 = document.getElementById('input-with-keypress-0');
var input1 = document.getElementById('input-with-keypress-1');
var input2 = document.getElementById('input-with-keypress-2');
var input3 = document.getElementById('input-with-keypress-3');
var input4 = document.getElementById('input-with-keypress-4');
var input5 = document.getElementById('input-with-keypress-5');
var input6 = document.getElementById('input-with-keypress-6');
var input7 = document.getElementById('input-with-keypress-7');

var inputs_build = [input0, input1];
var inputs_bdens = [input2, input3];
var inputs_dist = [input4, input5];
var inputs_area = [input6, input7];

var highlightStyle = {
    fillColor: "#0044ff",
    fillOpacity: 0.5,
    stroke: true,
    fill: true,
    color: "#0044ff",
    opacity: 0.5,
    weight: 2
};

var normalStyle = {
    fillOpacity: 0.5,
    weight: 1,
    stroke: true,
    fill: true,
    fillOpacity: 0.5,
    color: "#111111",
    fillColor: "red",
};

var magicStyle = {
    fillColor: "#00ffff",
    fillOpacity: 0.5,
    stroke: true,
    fill: true,
    color: "#ff44ff",
    opacity: 0.5,
    weight: 2
};



function url_from_coords(zoom, coords) {
   xtile = long2tile(coords.lng,zoom);
   ytile = long2tile(coords.lat * -1,zoom);
   return zoom + "/" + xtile + "/" + ytile;
}

function url_from_coords_yx(zoom, coords) {
    xtile = long2tile(coords.lng,zoom);
    ytile = long2tile(coords.lat * -1,zoom);
   return zoom + "/" + ytile + "/" + xtile;
}

function long2tile(lon,zoom) {
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

function lat2tile(lat,zoom) {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

function RefreshPreview() {
    document.getElementById("topo_preview").src="https://a.tile.opentopomap.org/" + url_from_coords(map.getZoom(), map.getCenter()) + ".png"
    document.getElementById("osm_preview").src="https://a.tile.openstreetmap.de/tiles/osmde/" + url_from_coords(map.getZoom(), map.getCenter()) + ".png"
    document.getElementById("aerial_preview").src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + url_from_coords_yx(map.getZoom(), map.getCenter()) + ".png"
}

function hide(id) {
    var e = document.getElementById(id);
    e.style.display = 'none';
}

function show(id) {
    var e = document.getElementById(id);
    e.style.display = 'block';
}

function SelectBasemap(input){
    var i;
    var maps = ["Esri Aerial", "OpenStreetMap", "OpenTopoMap", "GHI"];
    for (i = 0; i < maps.length; i++){
        if (map.hasLayer(baseMaps[maps[i]]) && maps[i] != input) {
                map.removeLayer(baseMaps[maps[i]]);
        }
    }
    map.addLayer(baseMaps[input]);
    baseMaps[input].bringToBack();
}

function toggleGHI() {
    var checkbox = document.getElementById('GHI');
    if (checkbox.checked == false) {
        hide("ghi_legend");
        if (map.hasLayer(ghi)) {
            map.removeLayer(ghi);
        }
    }
    else {
        show("ghi_legend");
        map.addLayer(ghi);
    }
}

function toggleEGrid() {
    var checkbox = document.getElementById('EGrid');
    if (checkbox.checked == false) {
        hide("grid_legend");
        if (map.hasLayer(gridLayer)) {
            map.removeLayer(gridLayer);
        }
    }
    else {
        show("grid_legend");
        map.addLayer(gridLayer);
        //alert("show getan?")
    }
}

function toggleVecTileLayer() {
    var checkbox = document.getElementById('toggle_vl');
    if (checkbox.checked == false) {
        if (map.hasLayer(vecTileLayer)) {
            map.removeLayer(vecTileLayer);
        }
    }
    else {
        map.addLayer(vecTileLayer);
    }
}

function toggleLegend(){
    var checkboxes = document.getElementsByName('legendary');
    var k;
    for (k = 0; k < checkboxes.length; k++) {
        if (checkboxes[k].checked == false){
            hide(checkboxes[k].id + "_Legend");
        }
        else {
            show(checkboxes[k].id + "_Legend");
        }
    }
}

function toggleOverlay(){
    var checkboxes = document.getElementsByName('togglebutton');
    var checkboxes_with_legends = document.getElementsByName('legendary');
    var j;
    for (j = 0; j < checkboxes.length; j++) {
        //alert(checkboxes[j].id);
        if (checkboxes[j].checked == false){
            //alert(typeof(gray));
            map.removeLayer(overlaymaps[checkboxes[j].id]);
        }
        else {
            map.addLayer(overlaymaps[checkboxes[j].id]);
        }
    }
    for (k = 0; k < checkboxes_with_legends.length; k++) {
        if (checkboxes_with_legends[k].checked == false){
            map.removeLayer(overlaymaps[checkboxes_with_legends[k].id]);
        }
        else {
            map.addLayer(overlaymaps[checkboxes_with_legends[k].id]);
        }
    }
    toggleLegend();
}

function toggleTSites() {
    var checkbox = document.getElementById('TSites');
    if (checkbox.checked == false) {
        if (map.hasLayer(tourismSitesLayer)) {
            map.removeLayer(tourismSitesLayer);
        }
    }
    else {
        map.addLayer(tourismSitesLayer);
        //alert("show getan?")
    }
}

function cellfilter(){
    currentfilter.mobile = document.getElementById('selectcellcoverage').value;
    if (document.getElementById('selectcellcoverage').value == 0) {
        currentfilter.mobile = null;
    }
    map.fireEvent("filterchange", currentfilter);
}

function setBuildingsHandle(i, value) {
    var r = [null,null];
    r[i] = value;
    buildingSlider.noUiSlider.set(r);
}

function setBDensHandle(i, value) {
    var r = [null,null];
    r[i] = value;
    bdensitySlider.noUiSlider.set(r);
}

function setDistHandle(i, value) {
    var r = [null,null];
    r[i] = value;
    distanceSlider.noUiSlider.set(r);
}

function setAreaHandle(i, value) {
    var r = [null,null];
    r[i] = value;
    areaSlider.noUiSlider.set(r);
}

// create sliders and connect to input fields and functions
//buildings
noUiSlider.create(buildingSlider, {
    start: [currentfilter.minbuild, currentfilter.maxbuild],
    connect: true,
    range: {
        'min': [100, 1],
        '10%': [300, 100],
        'max': currentfilter.maxbuild
    }
});

buildingSlider.noUiSlider.on('update', function( values, handle ) {
    inputs_build[handle].value = values[handle];
});

buildingSlider.noUiSlider.on('change', function( values, handle ) {
    currentfilter.minbuild = values[0];
    currentfilter.maxbuild = values[1];
    map.fireEvent("filterchange", currentfilter);
});

buildingSlider.noUiSlider.on('set', function( values, handle ) {
    currentfilter.minbuild = values[0];
    currentfilter.maxbuild = values[1];
    map.fireEvent("filterchange", currentfilter);
});



//building-density
noUiSlider.create(bdensitySlider, {
    start: [currentfilter.minbdens, currentfilter.maxbdens],
    connect: true,
    range: {
        'min': [160, 10],
        'max': currentfilter.maxbdens
    }
});

bdensitySlider.noUiSlider.on('update', function( values, handle ) {
    inputs_bdens[handle].value = values[handle];
});

bdensitySlider.noUiSlider.on('change', function( values, handle ) {
    currentfilter.minbdens = values[0];
    currentfilter.maxbdens = values[1];
    map.fireEvent("filterchange", currentfilter);
});

bdensitySlider.noUiSlider.on('set', function( values, handle ) {
    currentfilter.minbdens = values[0];
    currentfilter.maxbdens = values[1];
    map.fireEvent("filterchange", currentfilter);
});




//grid distance
noUiSlider.create(distanceSlider, {
    start: [currentfilter.mindist, currentfilter.maxdist],
    connect: true,
    range: {
        'min': [0, 500],
        'max': currentfilter.maxdist
    }
});
distanceSlider.noUiSlider.on('update', function( values, handle ) {
    inputs_dist[handle].value = values[handle];
});
distanceSlider.noUiSlider.on('change', function( values, handle ) {
    currentfilter.mindist = values[0];
    currentfilter.maxdist = values[1];
    map.fireEvent("filterchange", currentfilter);
});
distanceSlider.noUiSlider.on('set', function( values, handle ) {
    currentfilter.mindist = values[0];
    currentfilter.maxdist = values[1];
    map.fireEvent("filterchange", currentfilter);
});


//grid area
noUiSlider.create(areaSlider, {
    start: [currentfilter.minarea, currentfilter.maxarea],
    connect: true,
    range: {
        'min': [0, 0.02],
        'max': currentfilter.maxarea
    }
});

areaSlider.noUiSlider.on('update', function( values, handle ) {
    inputs_area[handle].value = values[handle];
});

areaSlider.noUiSlider.on('change', function( values, handle ) {
    currentfilter.minarea = values[0];
    currentfilter.maxarea = values[1];
    map.fireEvent("filterchange", currentfilter);
});

areaSlider.noUiSlider.on('set', function( values, handle ) {
    currentfilter.minarea = values[0];
    currentfilter.maxarea = values[1];
    map.fireEvent("filterchange", currentfilter);
});





// Listen to keydown events on the input field.
inputs_build.forEach(function(input, handle) {
    input.addEventListener('change', function(){
        setBuildingsHandle(handle, this.value);
    });
    input.addEventListener('keydown', function( e ) {
        var values = buildingSlider.noUiSlider.get();
        var value = Number(values[handle]);
        // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
        var steps = buildingSlider.noUiSlider.steps();
        // [down, up]
        var step = steps[handle];
        var position;
        // 13 is enter,
        // 38 is key up,
        // 40 is key down.
        switch ( e.which ) {
            case 13:
                setBuildingsHandle(handle, this.value);
                break;
            case 38:
                // Get step to go increase slider value (up)
                position = step[1];
                // false = no step is set
                if ( position === false ) {
                    position = 1;
                }
                // null = edge of slider
                if ( position !== null ) {
                    setBuildingsHandle(handle, value + position);
                }

                break;
            case 40:
                position = step[0];
                if ( position === false ) {
                    position = 1;
                }
                if ( position !== null ) {
                    setBuildingsHandle(handle, value - position);
                }
                break;
        }
    });
});

// Listen to keydown events on the input field.
inputs_bdens.forEach(function(input, handle) {
    input.addEventListener('change', function(){
        setBDensHandle(handle, this.value);
    });
    input.addEventListener('keydown', function( e ) {
        var values = bdensitySlider.noUiSlider.get();
        var value = Number(values[handle]);
        // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
        var steps = bdensitySlider.noUiSlider.steps();
        // [down, up]
        var step = steps[handle];
        var position;
        // 13 is enter,
        // 38 is key up,
        // 40 is key down.
        switch ( e.which ) {
            case 13:
                setBDensHandle(handle, this.value);
                break;
            case 38:
                // Get step to go increase slider value (up)
                position = step[1];
                // false = no step is set
                if ( position === false ) {
                    position = 1;
                }
                // null = edge of slider
                if ( position !== null ) {
                    setBDensHandle(handle, value + position);
                }

                break;
            case 40:
                position = step[0];
                if ( position === false ) {
                    position = 1;
                }
                if ( position !== null ) {
                    setBDensHandle(handle, value - position);
                }
                break;
        }
    });
});


// Listen to keydown events on the input field.
inputs_dist.forEach(function(input, handle) {
    input.addEventListener('change', function(){
        setDistHandle(handle, this.value);
    });
    input.addEventListener('keydown', function( e ) {
        var values = distanceSlider.noUiSlider.get();
        var value = Number(values[handle]);
        // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
        var steps = distanceSlider.noUiSlider.steps();
        // [down, up]
        var step = steps[handle];
        var position;
        // 13 is enter,
        // 38 is key up,
        // 40 is key down.
        switch ( e.which ) {
            case 13:
                setDistHandle(handle, this.value);
                break;
            case 38:
                // Get step to go increase slider value (up)
                position = step[1];
                // false = no step is set
                if ( position === false ) {
                    position = 1;
                }
                // null = edge of slider
                if ( position !== null ) {
                    setDistHandle(handle, value + position);
                }

                break;
            case 40:
                position = step[0];
                if ( position === false ) {
                    position = 1;
                }
                if ( position !== null ) {
                    setDistHandle(handle, value - position);
                }
                break;
        }
    });
});

// Listen to keydown events on the input field.
inputs_area.forEach(function(input, handle) {
    input.addEventListener('change', function(){
        setAreaHandle(handle, this.value);
    });
    input.addEventListener('keydown', function( e ) {
        var values = areaSlider.noUiSlider.get();
        var value = Number(values[handle]);
        var steps = areaSlider.noUiSlider.steps();
        var step = steps[handle];
        var position;
        switch ( e.which ) {
            case 13:
                setAreaHandle(handle, this.value);
                break;
            case 38:
                position = step[1];
                if ( position === false ) {
                    position = 1;
                }
                if ( position !== null ) {
                    setAreaHandle(handle, value + position);
                }
                break;
            case 40:
                position = step[0];
                if ( position === false ) {
                    position = 1;
                }
                if ( position !== null ) {
                    setAreaHandle(handle, value - position);
                }
                break;
        }
    });
});

let options = {
    center: [-13.22, 27.85],
    zoom: 6,
    //center: [-16.2951, 26.6655],
    //zoom: 12,
    minZoom: 6,
    maxZoom: 19,
    zoomControl: false,
    //maxBounds: [[-24, 7],[-2, 48]]
}


//
// Create empty leaflet-map (named "map") on canvas with parameters defined in options
//

let map = L.map("map", options);

//
// Definition of Basemap-Tile Sources to add map
// find more basemaps here (please inspect licenses): https://mc.bbbike.org/mc/?num=2&mt0=mapnik&mt1=mapnik-bw
//


let osm = L.tileLayer("https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.de/index.html">OpenStreetMap (de)</a>'
});

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
});

let aerial = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

let ghi = L.tileLayer("https://wam.rl-institut.de:84/data/ghi/{z}/{x}/{y}.png", {
    maxZoom: 19,
    maxNativeZoom: 12,
    attribution: '&copy; <a href="www.http://globalsolaratlas.info/">Global Solar Atlas</a>'
});


var borderLayer = L.vectorGrid.protobuf("https://wam.rl-institut.de:84/data/zambia-borders/{z}/{x}/{y}.pbf", {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            provinces: function(prop, zoom) {
                return{
                    color: "white",
                    Opacity: 1,
                    weight: 1,
                    maxZoom: 19,
                    maxNativeZoom: 17,
                    minZoom: 5,
                    interactive: true,
                };
            }
        }

}).addTo(map);

var gridLayer = L.vectorGrid.protobuf("https://wam.rl-institut.de:84/data/zambia-grid/{z}/{x}/{y}.pbf", {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            grid: function(prop, zoom) {
                return{
                    color: "#e45e47",
                    Opacity: 0.45,
                    weight: 1.2,
                    maxZoom: 19,
                    maxNativeZoom: 17,
                    minZoom: 5,
                    interactive: false,
                    smoothFactor: 5,
                };
            }
        }

})

var farmBlocksLayer = L.vectorGrid.protobuf("https://wam.rl-institut.de:84/data/zambia-farm-blocks/{z}/{x}/{y}.pbf", {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            farm_blocks: function(prop, zoom) {
                return{
                    opacity: 1,
                    color: "black",
                    fill: true,
                    fillOpacity: 0.7,
                    fillColor: "#cfac21",
                    weight: 1,
                    maxZoom: 19,
                    maxNativeZoom: 15,
                    minZoom: 5,
                    interactive: false
                };
            }
        }

})


//let vecTileLayer = L.vectorGrid.protobuf("data/temporary_tiles/{z}/{x}/{y}.pbf", {
var vecTileLayer = L.vectorGrid.protobuf("https://wam.rl-institut.de:84/data/zambia-vector/{z}/{x}/{y}.pbf", {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            borders: function(prop, zoom) {
                return{
                    color: "white",
                    Opacity: 0,
                    weight: 0
                };
            },
            clusters: function(prop, zoom) {
                //if (prop.building < 250) {
                //    amountcolor = "red";
                //} else {
                //    amountcolor = "green";
                //}
                //L.marker([prop.lon, prop.lat]).addTo(map);
                return {
                    fill: true,
                    fillColor: "red",
                    fillOpacity: 0.5,
                    color: "#111111",
                    weight: 1
                };
            },
        },
        maxZoom: 19,
        maxNativeZoom: 15,
        minZoom: 5,
        interactive: true,
    getFeatureId: function(f) {
        if (f.properties.ID !== undefined) {
            return f.properties.ID;
        }
        if (f.properties.type !== undefined) {
            return "g" + f.properties.ID;
        }
        return "r" + f.properties.OBJECTID;
    },
})


.on("click", function(e) {
    if (measuring == false){
        this.clearHighlight();
        let properties = e.layer.properties;
        if (properties.ID !== undefined) {
            var bbox = (properties.bb_south + ',' + properties.bb_west + ',' + properties.bb_north + ',' + properties.bb_east);
            downloadstring =('http://overpass-api.de/api/interpreter?data=(node[building](' + bbox + ');way[building](' + bbox + '););(._;>;);out meta;');
            
            var mobileCoverageText = "unknown"
            if (properties.mobile_cov == 1) { mobileCoverageText = "yes"}

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                this.update();
                L.DomEvent.disableClickPropagation(this._div);
                return this._div;
            };
            info.update = function (props) {
                this._div.innerHTML = '<h4 class="selection_detail_header">Selection Detail</h4>' +
                                      '<table class="selection_detail">' +
                                      '<tr><td align="right"><b>ID</b>:</td><td>' + properties.ID + '</td></tr>' +
                                      '<tr><td align="right"><b>Province</b>:</td><td>'+properties.NAME_1+'</td></tr>' +
                                      '<tr><td align="right"><b>Buildings</b>:</td><td>'+properties.building+'</td></tr>' +
                                      '<tr><td align="right"><b>Area</b>:</td><td>'+properties.area_km2 + ' km²' + '</td></tr>' +
                                      '<tr><td align="right"><b>Density</b>:</td><td>'+Math.round(properties.buid_dens)+'</td></tr>' +
                                      '<tr><td align="right"><b>Distance to Grid</b>:</td><td>'+Math.round(properties.distance / 1000) + ' km' + '</td></tr>' +
                                      '<tr><td align="right"><b>Mobile Coverage</b>:</td><td>'+ mobileCoverageText +'</td></tr>' +
                                      '<tr><td align="right"><b>Number of Schools</b>:</td><td>' + properties.numschool + '</td></tr>' +
                                      '<tr><td align="right"><b>Download Buildings</b>:</td><td>' + '<a href="' + downloadstring + '" > Link<a/>' +'</td></tr>' +
                                      '<tr><td align="right"><b>Priority Class</b>:</td><td>'+properties.prio_class+'</td></tr>' +
                                      '</table>';
                this._div.innerHTML
            };
            info.addTo(map);
            var layers = [];
            map.eachLayer(function(layer) {
                if( layer instanceof L.TileLayer )
                    layers.push(layer);
            });
            currentSelection = properties.ID;
            var type = "c";
            var ID = properties.ID;
        } else {
            var type = "r";
            var ID = "r" + properties.ID;
        }
        if (type != "r") {
            this.highlight = properties.ID;
            this.setFeatureStyle(ID, highlightStyle);
            L.DomEvent.stop(e);
        }
    }
});

vecTileLayer.highlight = null;
vecTileLayer.hidden = null;
vecTileLayer.hiddenstyle = {
    color: "#668999",
    fillColor: "gray",
    fillOpacity: 0.1,
    opacity: 0.5,
    fill: true
};
vecTileLayer.clearHidden = function() {
    if (this.hiddenIDs) {
        for (let i = 0, len = this.hiddenIDs.length; i < len; i++) {
            let id = this.hiddenIDs[i];
            this.resetFeatureStyle(id);
        }
    }
};

vecTileLayer.clearHighlight = function() {
    // || this.highlight == 0 is necessary for the element with ID == 0
    if (this.highlight || this.highlight == 0) {
        if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1){
            this.setFeatureStyle(this.highlight, this.hiddenstyle);
        }
        else{
            this.resetFeatureStyle(this.highlight);
        }
    }
    this.highlight = null;
    currentSelection = null;
    map.removeControl(info);
};

// the filter function selects objects by the limiting values set in the slider(s)
// and applies different styles to these selections.
vecTileLayer.filter = function(filter) {
    let newhiddenIDs = [];
    let vt = this._vectorTiles;
    for (let vtkey in vt) {
        let f = vt[vtkey]._features;
        for (let fkey in f) {
            let prop = f[fkey].feature.properties;
            if (
                    (prop.building >= currentfilter.minbuild && prop.building <= currentfilter.maxbuild) &&
                    (prop.buid_dens >= currentfilter.minbdens && prop.buid_dens <= currentfilter.maxbdens) &&
                    (prop.distance >= currentfilter.mindist && prop.distance <= currentfilter.maxdist) &&
                    (prop.area_km2 >= currentfilter.minarea && prop.area_km2 <= currentfilter.maxarea) &&
                    ((currentfilter.mobile != "nofilter" && currentfilter.mobile == prop.mobile_cov) || currentfilter.mobile == "nofilter" )
            )
            {
                this.setFeatureStyle(prop.ID, normalStyle);
            }
            else {
                newhiddenIDs.push(prop.ID);
                this.setFeatureStyle(prop.ID, this.hiddenstyle);
            }
            // when the map is panned or zoomed, the selected feature is newly styled 
            // according to the filter parameters. In order to keep the object highlighted
            // it is called and restyled again here.  
            if (prop.ID == currentSelection) 
            {
                //alert(currentSelection);
                this.setFeatureStyle(prop.ID, highlightStyle);
            }
        }
    }
    this.hiddenIDs = newhiddenIDs;
};


map.addLayer(vecTileLayer);
map.on("click", function() {
    vecTileLayer.clearHighlight();
});



    var tourismSitesLayer = L.geoJSON([tsites], {
        style: function (feature) {
            return feature.properties && feature.properties.style;
        },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 4,
                    fillColor: "#81c3d7",
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1,
                    interactive: false,
                });
            }
    })


    //select datasources and apply style
    var circles = L.geoJSON([centroids], {
        style: function (feature) {
            return feature.properties && feature.properties.style;
        },
        // uncomment below to allow popups for this layer
         //onEachFeature: onEachFeature,

            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 0,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 0,
                    fillOpacity: 0,
                });
            }
    });


var clusteracc = L.markerClusterGroup({chunkedLoading: true, spiderfyOnMaxZoom: false});
clusteracc.addLayer(circles);
//map.addLayer(clusteracc)

clusteracc.filter = function(filter, map) {
    this.clearLayers();
    let markerList = [];
    for (let i = 0; i < centroids.features.length; i++) {
        let point = centroids.features[i];
        if (
                point.properties.building >= currentfilter.minbuild && point.properties.building <= currentfilter.maxbuild &&
                point.properties.buid_dens >= currentfilter.minbdens && point.properties.buid_dens <= currentfilter.maxbdens &&
                point.properties.distance >= currentfilter.mindist && point.properties.distance <= currentfilter.maxdist &&
                point.properties.area_km2 >= currentfilter.minarea && point.properties.area_km2 <= currentfilter.maxarea &&
                ((currentfilter.mobile != "nofilter" && point.properties.mobile_cov != currentfilter.mobile) || currentfilter.mobile == "nofilter" )
        )
            {
            let info = point.properties.building;
            let orange =  L.circleMarker([point.properties.lon, point.properties.lat], {
                           radius: 0,
                           fillColor: "#ff7800",
                           color: "#000",
                           weight: 1,
                           opacity: 0,
                           fillOpacity: 0,
                });
            markerList.push(orange);
        }
    }
    this.addLayers(markerList);
};


var sidebar = L.control.sidebar('sidebar', {
    position: 'left'
});
L.control.scale({
    position: "topright"
}).addTo(map);
L.control.zoom({
    position: "topright"
}).addTo(map);

var measurecontrol = L.control.measure(
    {
    //  control position
    position: 'topright',
    //  weather to use keyboard control for the measure plugin
    keyboard: true,
    //  shortcut to activate measure
    activeKeyCode: 'M'.charCodeAt(0),
    //  shortcut to cancel measure, defaults to 'Esc'
    cancelKeyCode: 27,
    //  line color
    lineColor: 'red',
    //  line weight
    lineWeight: 2,
    //  line dash
    lineDashArray: '6, 6',
    //  line opacity
    lineOpacity: 1
});

map.addControl(measurecontrol);
map.addControl(sidebar);

    let baseMaps = {
        "Esri Aerial": aerial,
        "OpenStreetMap": osm,
        "OpenTopoMap": topo,
    };

    // define and include overlaymaps
    let overlaymaps = {
        "Clusters": vecTileLayer,
        "Borders": borderLayer,
        "Centroids": circles,
        "Cluster Accumulations": clusteracc,
        "GHI": ghi,
        "EGrid": gridLayer,
        "TSites": tourismSitesLayer,
        "FBlocks": farmBlocksLayer

    };

    toggleVecTileLayer();
    toggleOverlay();
    // called on refresh to show/hide legend based on toggle-button (cache may override default settings)

    toggleGHI();
    toggleEGrid();
   

    map.on('zoomend', function() {
        RefreshPreview();
    });
    map.on('moveend', function() {
        RefreshPreview();
        // when the map is panned, newly visible objects need to be filtered according
        // to the selected parameters. the function to do so is called here.
        map.fireEvent("mapmove", currentfilter);
    });

    map.on("layeradd",function(){
        vecTileLayer.bringToFront();
        }
    );

    map.addEventListener("filterchange", function(filter) {
        vecTileLayer.filter(currentfilter);
        clusteracc.filter(currentfilter, map);
    });

    map.addEventListener("mapmove", function(filter) {
        vecTileLayer.filter(currentfilter);
    });


/*
                basemap layer seletor with radio buttons
                <form action="">
                  <input type="radio" name="basemap" id="Esri Aerial" onclick="BaseMapSwitch()" checked> Aerial Images (Esri)<br>
                  <input type="radio" name="basemap" id="OpenStreetMap" onclick="BaseMapSwitch()" > OpenStreetMap<br>
                  <input type="radio" name="basemap" id="Grayscale" onclick="BaseMapSwitch()" > OpenStreetMap-Gray<br>
                  <input type="radio" name="basemap" id="OpenTopoMap" onclick="BaseMapSwitch()" > OpenTopoMap<br>
                </form>

                <script>
                function BaseMapSwitch() {
                    var x = document.getElementsByName("basemap");
                    var i;
                    for (i = 0; i < x.length; i++) {
                        if (x[i].checked){
                            map.addLayer(baseMaps[x[i].id]);
                        }
                        else {
                            map.removeLayer(baseMaps[x[i].id]);
                        }
                    }
                }
                </script>
*/

/*
            function onEachFeature(feature, layer) {
                var popupContent = "<b> Sweet Popup Title</b><br>"; //define popuptitle here, if needed. fails to load if it references missing key in one of the elements

            // iterate through all properties of all features and display them in popup
                Object.keys(feature.properties).forEach(function(key,index) {
                    popupContent = popupContent + "<b>" + key + ":</b> " + feature.properties[key] + "<br>";
                });

                if (feature.properties && feature.properties.popupContent) {
                    popupContent += feature.properties.popupContent;
                        }

                        layer.bindPopup(popupContent);
                    }
*/


        //L.marker([-14.456, 27.971]).addTo(map);
