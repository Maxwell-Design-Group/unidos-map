mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;

const selectFilters = [];
const checkboxFilters = [];

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
        zoom: 7,
    });
};

function createPopup(currentFeature) {

    var description = `<h3 style="background-color: black; color: white;">` +
        currentFeature.properties["affiliate_name"] +
        `</h3><h4><b>Address: </b>` +
        currentFeature.properties["full_address"] +
        `</h4><h4><b>Member ID: </b>` +
        currentFeature.properties["member_id"] +
        `</h4>`;

    const popups = document.getElementsByClassName("mapboxgl-popup");
    /** Check if there is already a popup on the map and if so, remove it */
    if (popups[0]) popups[0].remove();
    new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(description)
        .addTo(map);
};

function buildLocationList() {

    const listing = listings.appendChild(document.createElement("div"));
    const link = listing.appendChild(document.createElement("button"));

    link.addEventListener("click", function() {
        createPopup(location);
    });
}


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
};

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
};

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
};

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
};

function filters(filterSettings) {
    filterSettings.forEach(function(filter) {
        if (filter.type === "checkbox") {
            buildCheckbox(filter.title, filter.listItems);
        } else if (filter.type === "dropdown") {
            buildDropDownList(filter.title, filter.listItems);
        }
    });
};

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
};

function removeFiltersButton() {
    const removeFilter = document.getElementById("removeFilters");
    removeFilter.addEventListener("click", function() {
        removeFilters();
    });
};

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
                        "circle-radius": 6,
                        "circle-color": [
                            'match', ['get', 'region'],
                            'California',
                            '#00ADBE',
                            'Far West',
                            '#F05538',
                            'Southeast',
                            '#F5852F',
                            'Texas',
                            '#FFC81B',
                            'Northeast',
                            '#B3D238',
                            'Midwest',
                            '#0D53A5',
                            '#CCC'
                        ],
                        "circle-stroke-color": "white",
                        "circle-stroke-width": 1,
                        "circle-opacity": 0.7,
                    },
                });
            },
            'waterway-label'
        );

        map.on("click", "districts-fill", function(e) {
            const states = map.queryRenderedFeatures(e.point, {
                layers: ['districts-fill']
            });

            x.style.visibility = "visible";
            if (states.length > 0) {
                const endpoint = 'https://theunitedstates.io/images/congress/225x275/';
                const apiKey = 'PiHgOCWadu2hdqmkQGaBmRq39CtXCszpZVOJOeSP';
                var bioId = states[0].properties.j_rep_bio_id;
                var s1bioId = states[0].properties.j_sen1_id;
                var s2bioId = states[0].properties.j_sen2_id;
                var params = 'access_token=' + apiKey;
                var url = endpoint + bioId + '.jpg?' + params;
                var url1 = endpoint + s1bioId + '.jpg?' + params;
                var url2 = endpoint + s2bioId + '.jpg?' + params;

                /*This is the Rep Image*/
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.onload = response;
                xhr.send();

                function response(e) {
                    var urlCreator = window.URL || window.webkitURL;
                    var imageUrl = urlCreator.createObjectURL(this.response);
                    document.querySelector("#image").src = imageUrl;
                };

                /*This is the Senate 1 Image*/
                var xhr1 = new XMLHttpRequest();
                xhr1.open("GET", url1);
                xhr1.responseType = "blob";
                xhr1.onload = response1;
                xhr1.send();

                function response1(x) {
                    var urlCreator1 = window.URL || window.webkitURL;
                    var imageUrl1 = urlCreator1.createObjectURL(this.response);
                    document.querySelector("#sen1").src = imageUrl1;
                };

                /*This is the Senate 2 Image*/
                var xhr2 = new XMLHttpRequest();
                xhr2.open("GET", url2);
                xhr2.responseType = "blob";
                xhr2.onload = response2;
                xhr2.send();

                function response2(y) {
                    var urlCreator2 = window.URL || window.webkitURL;
                    var imageUrl2 = urlCreator2.createObjectURL(this.response);
                    document.querySelector("#sen2").src = imageUrl2;
                };
                /*<img id="image"/>*/

                document.getElementById('pd').innerHTML = '<h2>' + states[0].properties.District + ' Congressional District</h2>' +
                    '<img id="image"/><p style="font-weight: 900; font-size: 14px; padding-top: 30px;">' + states[0].properties.j_rep_first_name + ' ' + states[0].properties.j_rep_last_name + ', ' +
                    states[0].properties.j_rep_party + '</p>' +
                    '<p><img style="width: 12px; vertical-align: middle; padding-bottom: 4px; margin-right: 3px;" src="cursor.png"/><a href="' + states[0].properties.j_rep_url + '">' + states[0].properties.j_rep_url + '</a></p></br>' +
                    '<p><img style="width: 12px; vertical-align: middle; padding-bottom: 4px; margin-right: 3px;" src="call.png"/><a href="tel:' + states[0].properties.j_rep_phone + '">' + states[0].properties.j_rep_phone + '</a></p></br>' +
                    '<hr>' +

                    '<h2>Junior Senator</h2><img id="sen1"/>' +
                    '<p style="font-weight: 700";>' + states[0].properties.j_sen1_first_name + ' ' + states[0].properties.j_sen1_last_name + ', ' + states[0].properties.j_sen1_party + '</p></br>' +
                    '<p>' + states[0].properties.j_sen1_url + '</p></br>' +
                    '<p>' + states[0].properties.j_sen1_phone + '</p></br><hr>' +

                    '<h2>Senior Senator</h2><img id="sen2"/>' +
                    '<p style="font-weight: 700";>' + states[0].properties.j_sen2_first_name + ' ' + states[0].properties.j_sen2_last_name + ', ' + states[0].properties.j_sen2_party + '</p></br>' +
                    '<p>' + states[0].properties.j_sen2_url + '</p></br>' +
                    '<p>' + states[0].properties.j_sen2_phone + '</p><hr></br>';


                document.getElementById('data-card').innerHTML = '<h2>' + states[0].properties.District +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Population #</h2>' +
                    '<p>Total Population: ' + states[0].properties.j_total_pop + '</p></br>' +
                    '<p>Total Latino Pop.: ' + states[0].properties.j_latino_pop + '</p></br>' +
                    '<p>Total Eligible Voters: ' + states[0].properties.j_eligible_voter_pop + '</p></br>' +
                    '<p>Total Latino Elig. Voters: ' + states[0].properties.j_latino_eligible_voter_pop + '</p></br>' +

                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Population %</h2>' +
                    '<p>% of Pop. Latino: ' + states[0].properties.j_share_latino_pop * 100 + '%</p></br>' +
                    '<p>% of Latino Among Eligible Voters: ' + states[0].properties.j_share_latino_total_eligible_voter_pop * 100 + '%</p></br>' +
                    '<p>% of Latino Pop. Eligible to Vote: ' + states[0].properties.j_share_latino_eligible_pop * 100 + '%</p></br>' +
                    '<hr></br>' +
                    '<h2 style="text-align: left; margin-left: 10px; font-weight: 700;">Donor Investment</h2>' +
                    '<p># of Donors: ' + states[0].properties.j_donor_count + '</p></br>' +
                    '<p>Total Amount Donated: ' + states[0].properties.j_donor_value + '</p></br>';
                $('img').on('error', function() {
                    $(this).attr('src', 'https://github.com/Maxwell-Design-Group/unidos-map/blob/cf1d6e51d89788ea9ce2377d0edc2e32069efb8a/user.png'); // show a fallback image if there is an error
                });
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
var popup = new mapboxgl.Popup({
    closeButton: false
});

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
    }, 'waterway-label');

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
        var feature = e.features[0];
        popup.setLngLat(e.lngLat)
            .setText(feature.properties.District)
            .addTo(map);
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'district-fills', function() {
        popup.remove();
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
    var latinoVoters = document.getElementById('latino-voters');
    var allVoters = document.getElementById('all-voters');
    var partyLegend = document.getElementById('party-legend');

    if (layerId === 'ckq7g8e1k2rhr17llm91ytvp5') { //None
        map.setZoom(3.8);
        map.setPitch(0);
        latinoVoters.style.display = 'none';
        allVoters.style.display = 'none';
        partyLegend.style.display = 'none';
    } else if (layerId === 'ckr6cm0u20vz818qiwjcth186') { //Donors
        map.setZoom(4);
        map.setPitch(40);
        latinoVoters.style.display = 'none';
        allVoters.style.display = 'none';
        partyLegend.style.display = 'none';
    } else if (layerId === 'ckr3i4wkk0sur1anpsgivu5p3') { //Latino Voters
        map.setZoom(4);
        map.setPitch(0);
        latinoVoters.style.display = 'block';
        allVoters.style.display = 'none';
        partyLegend.style.display = 'none';
    } else if (layerId === 'ckr53ol0z0oql17mx36iuqm0z') { //All Voters
        map.setZoom(4);
        map.setPitch(0);
        latinoVoters.style.display = 'none';
        allVoters.style.display = 'block';
        partyLegend.style.display = 'none';
    } else if (layerId === 'ckr2y62ng1ntg18pd6rtrgdc1') { //Party Affiliation
        map.setZoom(4);
        map.setPitch(0);
        latinoVoters.style.display = 'none';
        allVoters.style.display = 'none';
        partyLegend.style.display = 'block';
    } else {
        map.setZoom(4);
        map.setPitch(0);
        latinoVoters.style.display = 'none';
        allVoters.style.display = 'none';
        partyLegend.style.display = 'none';
    }
    map.setStyle('mapbox://styles/dylanmaxwell/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}
