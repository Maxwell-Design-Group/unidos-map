/* eslint-disable strict */
mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;

let geojsonData = {};
const filteredGeojson = {
    type: "FeatureCollection",
    features: [],
};

const map = new mapboxgl.Map({
    container: "map",
    style: config.style,
    center: config.center,
    zoom: config.zoom,
    transformRequest: transformRequest,
});

function flyToLocation(currentFeature) {
    map.flyTo({
        center: currentFeature,
        zoom: 8,
    });
}


function createPopup(currentFeature) {

    var description =
        '<h3>' +
        currentFeature.properties["affiliate_name"] +
        '</h3>' +
        `<h4>` +
        `<b>` +
        `Address: ` +
        `</b>` +
        currentFeature.properties["address"] + "&nbsp;" + currentFeature.properties["city"] + ",&nbsp;" + currentFeature.properties["state"] + "&nbsp;" + currentFeature.properties["zip"] +
        `</h4>` +
        `<h4>` +
        `<b>` +
        `Member ID: ` +
        `</b>` +
        currentFeature.properties["member_id"] +
        `</h4>`;


    const popups = document.getElementsByClassName("mapboxgl-popup");
    /** Check if there is already a popup on the map and if so, remove it */
    if (popups[0]) popups[0].remove();
    const popup = new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(description)
        .addTo(map);


}




function buildLocationList(locationData) {
    /* Add a new listing section to the sidebar. */
    const listings = document.getElementById("listings");
    listings.innerHTML = "";
    locationData.features.forEach(function(location, i) {
        const prop = location.properties;

        const listing = listings.appendChild(document.createElement("div"));
        /* Assign a unique `id` to the listing. */
        listing.id = "listing-" + prop.id;

        /* Assign the `item` class to each listing for styling. */
        listing.className = "item";

        /* Add the link to the individual listing created above. */
        const link = listing.appendChild(document.createElement("button"));
        link.className = "title";
        link.id = "link-" + prop.id;
        link.innerHTML =
            '<h1 style="line-height: 1; text-align:left;">' + prop[columnHeaders[0]] + "</h1>";

        /* Add details to the individual listing. */
        const details = listing.appendChild(document.createElement("div"));
        details.className = "content";

        for (let i = 1; i < columnHeaders.length; i++) {
            const div = document.createElement("div");
            div.innerText += prop[columnHeaders[i]];
            div.className;
            details.appendChild(div);
        }

        link.addEventListener("click", function() {
            const clickedListing = location.geometry.coordinates;
            flyToLocation(clickedListing);
            createPopup(location);

            const activeItem = document.getElementsByClassName("active");
            if (activeItem[0]) {
                activeItem[0].classList.remove("active");
            }
            this.parentNode.classList.add("active");

            const divList = document.querySelectorAll(".content");
            const divCount = divList.length;
            for (i = 0; i < divCount; i++) {
                divList[i].style.maxHeight = null;
            }

            for (let i = 0; i < geojsonData.features.length; i++) {
                this.parentNode.classList.remove("active");
                this.classList.toggle("active");
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            }
        });
    });
}

// Build dropdown list function
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
    const filtersDiv = document.getElementById("filters");
    const mainDiv = document.createElement("div");
    const filterTitle = document.createElement("h3");
    filterTitle.innerText = title;
    filterTitle.classList.add("py12", "txt-bold");
    mainDiv.appendChild(filterTitle);

    const selectContainer = document.createElement("div");
    selectContainer.classList.add("select-container", "center");

    const dropDown = document.createElement("select");
    dropDown.classList.add("select", "filter-option");

    const selectArrow = document.createElement("div");
    selectArrow.classList.add("select-arrow");

    const firstOption = document.createElement("option");

    dropDown.appendChild(firstOption);
    selectContainer.appendChild(dropDown);
    selectContainer.appendChild(selectArrow);
    mainDiv.appendChild(selectContainer);

    for (let i = 0; i < listItems.length; i++) {
        const opt = listItems[i];
        const el1 = document.createElement("option");
        el1.textContent = opt;
        el1.value = opt;
        dropDown.appendChild(el1);
    }
    filtersDiv.appendChild(mainDiv);
}

// Build checkbox function
// listItems - the array of filter items
function buildCheckbox(title, listItems) {
    const filtersDiv = document.getElementById("filters");
    const mainDiv = document.createElement("div");
    const filterTitle = document.createElement("div");
    const formatcontainer = document.createElement("div");
    filterTitle.classList.add("center", "flex-parent", "py12", "txt-bold");
    formatcontainer.classList.add(
        "center",
        "flex-parent",
        "flex-parent--column",
        "px3",
        "flex-parent--space-between-main"
    );
    const secondLine = document.createElement("div");
    secondLine.classList.add(
        "center",
        "flex-parent",
        "py12",
        "px3",
        "flex-parent--space-between-main"
    );
    filterTitle.innerText = title;
    mainDiv.appendChild(filterTitle);
    mainDiv.appendChild(formatcontainer);

    for (let i = 0; i < listItems.length; i++) {
        const container = document.createElement("label");

        container.classList.add("checkbox-container");

        const input = document.createElement("input");
        input.classList.add("px12", "filter-option");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", listItems[i]);
        input.setAttribute("value", listItems[i]);

        const checkboxDiv = document.createElement("div");
        const inputValue = document.createElement("p");
        inputValue.innerText = listItems[i];
        checkboxDiv.classList.add("checkbox", "mr6");
        checkboxDiv.appendChild(Assembly.createIcon("check"));

        container.appendChild(input);
        container.appendChild(checkboxDiv);
        container.appendChild(inputValue);

        formatcontainer.appendChild(container);
    }
    filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
    filterSettings.forEach(function(filter) {
        if (filter.type === "checkbox") {
            columnHeader = filter.columnHeader;
            listItems = filter.listItems;

            const keyValues = {};
            Object.assign(keyValues, { header: columnHeader, value: listItems });
            checkboxFilters.push(keyValues);
        }
        if (filter.type === "dropdown") {
            columnHeader = filter.columnHeader;
            listItems = filter.listItems;

            const keyValues = {};

            Object.assign(keyValues, { header: columnHeader, value: listItems });
            selectFilters.push(keyValues);
        }
    });
}

function applyFilters() {
    const filterForm = document.getElementById("filters");

    filterForm.addEventListener("change", function() {
        const filterOptionHTML = this.getElementsByClassName("filter-option");
        const filterOption = [].slice.call(filterOptionHTML);

        const geojSelectFilters = [];
        const geojCheckboxFilters = [];
        filteredFeatures = [];
        filteredGeojson.features = [];

        filterOption.forEach(function(filter) {
            if (filter.type === "checkbox" && filter.checked) {
                checkboxFilters.forEach(function(objs) {
                    Object.entries(objs).forEach(function([key, value]) {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojCheckboxFilters.push(geojFilter);
                        }
                    });
                });
            }
            if (filter.type === "select-one" && filter.value) {
                selectFilters.forEach(function(objs) {
                    Object.entries(objs).forEach(function([key, value]) {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojSelectFilters.push(geojFilter);
                        }
                    });
                });
            }
        });

        if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
            geojsonData.features.forEach(function(feature) {
                filteredGeojson.features.push(feature);
            });
        } else if (geojCheckboxFilters.length > 0) {
            geojCheckboxFilters.forEach(function(filter) {
                geojsonData.features.forEach(function(feature) {
                    if (feature.properties[filter[0]].includes(filter[1])) {
                        if (
                            filteredGeojson.features.filter(
                                (f) => f.properties.id === feature.properties.id
                            ).length === 0
                        ) {
                            filteredGeojson.features.push(feature);
                        }
                    }
                });
            });
            if (geojSelectFilters.length > 0) {
                const removeIds = [];
                filteredGeojson.features.forEach(function(feature) {
                    let selected = true;
                    geojSelectFilters.forEach(function(filter) {
                        if (
                            feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
                            selected === true
                        ) {
                            selected = false;
                            removeIds.push(feature.properties.id);
                        } else if (selected === false) {
                            removeIds.push(feature.properties.id);
                        }
                    });
                });
                removeIds.forEach(function(id) {
                    const idx = filteredGeojson.features.findIndex(
                        (f) => f.properties.id === id
                    );
                    filteredGeojson.features.splice(idx, 1);
                });
            }
        } else {
            geojsonData.features.forEach(function(feature) {
                let selected = true;
                geojSelectFilters.forEach(function(filter) {
                    if (!feature.properties[filter[0]].includes(filter[1]) &&
                        selected === true
                    ) {
                        selected = false;
                    }
                });
                if (
                    selected === true &&
                    filteredGeojson.features.filter(
                        (f) => f.properties.id === feature.properties.id
                    ).length === 0
                ) {
                    filteredGeojson.features.push(feature);
                }
            });
        }

        map.getSource("locationData").setData(filteredGeojson);
        buildLocationList(filteredGeojson);
    });
}

function filters(filterSettings) {
    filterSettings.forEach(function(filter) {
        if (filter.type === "checkbox") {
            buildCheckbox(filter.title, filter.listItems);
        } else if (filter.type === "dropdown") {
            buildDropDownList(filter.title, filter.listItems);
        }
    });
}

function removeFilters() {
    let input = document.getElementsByTagName("input");
    let select = document.getElementsByTagName("select");
    let selectOption = [].slice.call(select);
    let checkboxOption = [].slice.call(input);
    filteredGeojson.features = [];
    checkboxOption.forEach(function(checkbox) {
        if (checkbox.type == "checkbox" && checkbox.checked == true) {
            checkbox.checked = false;
        }
    });

    selectOption.forEach(function(option) {
        option.selectedIndex = 0;
    });

    map.getSource("locationData").setData(geojsonData);
    buildLocationList(geojsonData);
}

function removeFiltersButton() {
    const removeFilter = document.getElementById("removeFilters");
    removeFilter.addEventListener("click", function() {
        removeFilters();
    });
}

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();



const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: true, // Use the geocoder's default marker style
    zoom: 11,
});

function sortByDistance(selectedPoint) {
    const options = { units: "miles" };
    if (filteredGeojson.features.length > 0) {
        var data = filteredGeojson;
    } else {
        var data = geojsonData;
    }
    data.features.forEach(function(data) {
        Object.defineProperty(data.properties, "distance", {
            value: turf.distance(selectedPoint, data.geometry, options),
            writable: true,
            enumerable: true,
            configurable: true,
        });
    });

    data.features.sort(function(a, b) {
        if (a.properties.distance > b.properties.distance) {
            return 1;
        }
        if (a.properties.distance < b.properties.distance) {
            return -1;
        }
        return 0; // a must be equal to b
    });
    const listings = document.getElementById("listings");
    while (listings.firstChild) {
        listings.removeChild(listings.firstChild);
    }
    buildLocationList(data);
}

geocoder.on("result", function(ev) {
    const searchResult = ev.result.geometry;
    sortByDistance(searchResult);
});

var x = document.getElementById("features")

map.on("style.load", function() {
    x.style.visibility = "hidden";
    // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
    console.log("loaded");
    $(document).ready(function() {
        console.log("ready");
        $.ajax({
            type: "GET",
            url: config.CSV,
            dataType: "text",
            success: function(csvData) {
                makeGeoJSON(csvData);
            },
            error: function(request, status, error) {
                console.log(request);
                console.log(status);
                console.log(error);
            },
        });
    });

    function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(
            csvData, {
                latfield: "Latitude",
                lonfield: "Longitude",
                delimiter: ",",
            },
            function(err, data) {
                data.features.forEach(function(data, i) {
                    data.properties.id = i;
                });

                geojsonData = data;
                // Add the the layer to the map
                map.addLayer({
                    id: "locationData",
                    type: "circle",
                    source: {
                        type: "geojson",
                        data: geojsonData,
                    },
                    paint: {
                        "circle-radius": 6, // size of circles
                        "circle-color": "#29602e", // color of circles
                        "circle-stroke-color": "white",
                        "circle-stroke-width": 2,
                        "circle-opacity": 0.9,
                    },
                });
            },
            'waterway-label'
        );

        function sourceCallback() {
            if (map.getSource(geojsonData) && map.isSourceLoaded(geojsonData)) {
                console.log('source loaded!');
            }
        }
        map.on('sourcedata', sourceCallback);

        map.on("click", "districts-fill", function(e) {
            const states = map.queryRenderedFeatures(e.point, {
                layers: ['districts-fill']
            });
            x.style.visibility = "visible";

            if (states.length > 0) {

                document.getElementById('pd').innerHTML = '<img src="user.png" alt="Avatar" class="avatar"></img><h2>District: ' + states[0].properties.district_name + '</h2>' +
                    '<hr></br><h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Representative Info</h2>' +
                    '<p style="font-weight: 700";>' + states[0].properties.rep_first_name + ' ' + states[0].properties.rep_last_name + ', ' + states[0].properties.rep_gender + '</p></br>' +
                    '<p style="font-weight: 700";>' + states[0].properties.rep_party + '</p></br>' +
                    '<p>' + states[0].properties.rep_phone + '</p></br>' +
                    '<p>' + states[0].properties.rep_url + '</p></br>' +
                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Senate Info</h2>' +
                    '<p style="font-weight: 700";>' + states[0].properties.sen_1_first_name + ' ' + states[0].properties.sen_1_last_name + ', ' + states[0].properties.sen_1_gender + '</p></br>' +
                    '<p style="font-weight: 700";>' + states[0].properties.sen_1_party + '</p></br>' +
                    '<p>' + states[0].properties.sen_1_phone + '</p></br>' +
                    '<p>' + states[0].properties.sen_1_url + '</p></br></br>' +
                    '<p style="font-weight: 700";>' + states[0].properties.sen_2_first_name + ' ' + states[0].properties.sen_2_last_name + ', ' + states[0].properties.sen_2_gender + '</p></br>' +
                    '<p style="font-weight: 700";>' + states[0].properties.sen_2_party + '</p></br>' +
                    '<p>' + states[0].properties.sen_2_phone + '</p></br>' +
                    '<p>' + states[0].properties.sen_2_url + '</p></br>' +
                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Donor Investment</h2>' +
                    '<p># of Donors: ' + states[0].properties.donor_count + '</p></br>' +
                    '<p>Total Amount Donated: ' + states[0].properties.donor_value + '</p></br>' +
                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Population #</h2>' +
                    '<p>Total Population: ' + states[0].properties.total_pop + '</p></br>' +
                    '<p>Total Latino Pop.: ' + states[0].properties.latino_pop + '</p></br>' +
                    '<p>Total Eligible Voters: ' + states[0].properties.eligible_voter_pop + '</p></br>' +
                    '<p>Total Latino Elig. Voters: ' + states[0].properties.latino_eligible_voter_pop + '</p></br>' +

                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Population %</h2>' +
                    '<p>% of Pop. Latino: ' + states[0].properties.share_latino_pop * 100 + '%</p></br>' +
                    '<p>% of Latino Among Eligible Voters: ' + states[0].properties.share_latino_total_eligible_voter_pop * 100 + '%</p></br>' +
                    '<p>% of Latino Pop. Eligible to Vote: ' + states[0].properties.share_latino_eligible_pop * 100 + '%</p></br>';
            }
        });
        map.on("click", "locationData", function(e) {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ["locationData"],
            });
            const clickedPoint = features[0].geometry.coordinates;
            flyToLocation(clickedPoint);
            sortByDistance(clickedPoint);
            createPopup(features[0]);
        });

        map.on("mouseenter", "locationData", function() {
            map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "locationData", function() {
            map.getCanvas().style.cursor = "default";
        });
        buildLocationList(geojsonData);

    }
});

var hoveredStateId = null;
var zoomThreshold = 5.2;
var minizoomi = 5.3;


map.on('style.load', function() {
    map.addSource('distro', {
        'type': 'geojson',
        'data': './district.geojson'
    });

    // The feature-state dependent fill-opacity expression will render the hover effect
    // when a feature's hover state is set to true.
    map.addLayer({
        'id': 'district-fills',
        'type': 'fill',
        'source': 'distro',
        'minzoom': zoomThreshold,
        'layout': {},
        'paint': {
            'fill-color': '#212121',
            'fill-opacity': [
                'case', ['boolean', ['feature-state', 'hover'], false],
                0.4,
                0,
            ]
        }
    });


    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'district-fills', function(e) {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState({ source: 'distro', id: hoveredStateId }, { hover: false });
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState({ source: 'distro', id: hoveredStateId }, { hover: true });
        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'district-fills', function() {
        if (hoveredStateId !== null) {
            map.setFeatureState({ source: 'distro', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
    });
});

map.on('style.load', function() {
    map.addSource('states', {
        'type': 'geojson',
        'data': './states.geojson'
    });

    // The feature-state dependent fill-opacity expression will render the hover effect
    // when a feature's hover state is set to true.
    map.addLayer({
        'id': 'state-fills',
        'type': 'fill',
        'source': 'states',
        'maxzoom': zoomThreshold,
        'layout': {},
        'paint': {
            'fill-color': '#212121',
            'fill-opacity': [
                'case', ['boolean', ['feature-state', 'hover'], false],
                0.4,
                0,
            ]
        }
    });

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'state-fills', function(e) {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState({ source: 'states', id: hoveredStateId }, { hover: false });
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState({ source: 'states', id: hoveredStateId }, { hover: true });
        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'state-fills', function() {
        if (hoveredStateId !== null) {
            map.setFeatureState({ source: 'states', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
    });
});


// Modal - popup for filtering results
const filterResults = document.getElementById("filterResults");
const exitButton = document.getElementById("exitButton");
const modal = document.getElementById("modal");

filterResults.addEventListener("click", () => {
    modal.classList.remove("hide-visually");
    modal.classList.add("z5");
});

exitButton.addEventListener("click", () => {
    modal.classList.add("hide-visually");
});

const title = document.getElementById("title");
title.innerText = config.title;
const description = document.getElementById("description");
description.innerText = config.description;

function transformRequest(url, resourceType) {
    var isMapboxRequest =
        url.slice(8, 22) === "api.mapbox.com" ||
        url.slice(10, 26) === "tiles.mapbox.com";
    return {
        url: isMapboxRequest ? url.replace("?", "?pluginName=finder&") : url,
    };
}
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/dylanmaxwell/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}