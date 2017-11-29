/*
    Copyright 2017 Esri

    Licensed under the Apache License, Version 2.0 (the 'License');
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at:
    https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an 'AS IS' BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

require(
    [
        'esri/Map',
        'esri/Graphic',
        'esri/geometry/SpatialReference',
        'esri/layers/GraphicsLayer',
        'esri/layers/FeatureLayer',
        'esri/views/SceneView',
        'esri/tasks/Geoprocessor',
        'esri/tasks/support/FeatureSet',
        'esri/widgets/Home',
        'esri/widgets/Search',
        'dojo/string',
        'dojo/request',
        'dojo/number',
        'dojo/domReady!'
    ],
    function (
        Map,
        Graphic,
        SpatialReference,
        GraphicsLayer,
        FeatureLayer,
        SceneView,
        Geoprocessor,
        FeatureSet,
        Home,
        Search,
        string,
        number
    ) {
        $(document).ready(function () {
            // Enforce strict mode
            'use strict';

            var NORTHAMERICA = {
                position: {
                    x: -11141653,
                    y: 1178945,
                    z: 6491147,
                    spatialReference: {
                        wkid: 102100
                    }
                },
                heading: 0,
                tilt: 23
            };

            var MISSOURI = {
                position: {
                    x: -10106375,
                    y: 4631120,
                    z: 35847,
                    spatialReference: {
                        wkid: 102100
                    }
                },
                heading: 0,
                tilt: 52
            };

            var LEASTCOST = 'https://maps.esri.com/apl22/rest/services/CCM/MosaicLCP2dj/GPServer/MosaicLCP';
            var LOCATIONS = [{
                    name: 'St. Peters',
                    description: 'St. Peters is a city in St. Charles County, Missouri, United States. The 2010 census showed the city\'s population to be 52,575 tied for 10th with Blue Springs, Missouri.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/St._Peters_City_Centre_Park.JPG/800px-St._Peters_City_Centre_Park.JPG',
                    location: {
                        x: -90.60,
                        y: 38.78
                    }
                },
                {
                    name: 'New Melle',
                    description: 'New Melle is a small country community in St. Charles County, Missouri, United States. It is located about 37 miles west of St. Louis. The population was 475 at the 2010 census.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Newmellewatertower.jpg',
                    location: {
                        x: -90.88,
                        y: 38.71
                    }
                },
                {
                    name: 'Sacramento',
                    description: 'Sacramento is the capital city of the U.S. state of California and the seat of Sacramento County. It is at the confluence of the Sacramento River and the American River in the northern portion of California\'s expansive Central Valley, known as the Sacramento Valley. Its estimated 2016 population of 493,025 makes it the sixth-largest city in California, the fastest- growing big city in the state, and the 35th largest city in the United States.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Sacramento_Capitol.jpg',
                    location: {
                        x: -121.47,
                        y: 38.56
                    }
                },
                {
                    name: 'San Francisco',
                    description: 'San Francisco, officially the City and County of San Francisco, is the cultural, commercial, and financial center of Northern California. The consolidated city-county covers an area of about 47.9 square miles (124 km2) at the north end of the San Francisco Peninsula in the San Francisco Bay Area. It is the fourth-most populous city in California, and the 13th-most populous in the United States, with a 2016 census-estimated population of 870,887. The population is projected to reach 1 million by 2033.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Golden_Gate_Bridge_1926.jpg/800px-Golden_Gate_Bridge_1926.jpg',
                    location: {
                        x: -122.42,
                        y: 37.78
                    }
                },
                {
                    name: 'Fresno',
                    description: 'Fresno is a city in California, United States, and the county seat of Fresno County. It covers about 112 square miles (290 km2) in the center of the San Joaquin Valley, the southern portion of the California\'s Central Valley.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Downtown_Fresno_Night.png/800px-Downtown_Fresno_Night.png',
                    location: {
                        x: -119.77,
                        y: 36.75
                    }
                },
                {
                    name: 'Las Vegas',
                    description: 'Las Vegas, officially the City of Las Vegas and often known simply as Vegas, is the 28th-most populated city in the United States, the most populated city in the state of Nevada, and the county seat of Clark County. The city anchors the Las Vegas Valley metropolitan area and is the largest city within the greater Mojave Desert. Las Vegas is an internationally renowned major resort city, known primarily for its gambling, shopping, fine dining, entertainment, and nightlife. The Las Vegas Valley as a whole serves as the leading financial, commercial, and cultural center for Nevada.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Welcome_to_Fabulous_Las_Vegas.jpg/631px-Welcome_to_Fabulous_Las_Vegas.jpg',
                    location: {
                        x: -115.14,
                        y: 36.175
                    }
                },
                {
                    name: 'Los Angeles',
                    description: 'Los Angeles, officially the City of Los Angeles and often known by its initials L.A., is the cultural, financial, and commercial center of Southern California. With a U.S. Census-estimated 2016 population of 3,976,322, it is the second most populous city in the United States (after New York City) and the most populous city in the state of California.',
                    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/640px-HollywoodSign.jpg',
                    location: {
                        x: -118.25,
                        y: 34.05
                    }
                }
            ];

            var page = 1;
            
            var isProcessing = false;
            //var jobid = null;
            var locations = new FeatureLayer({
                fields: [
                    {
                        name: 'objectid',
                        alias: 'objectid',
                        type: 'oid'
                    }, {
                        name: 'name',
                        alias: 'name',
                        type: 'string'
                    }, {
                        name: 'description',
                        alias: 'description',
                        type: 'string'
                    }, {
                        name: 'thumbnail',
                        alias: 'thumbnail',
                        type: 'string'
                    }
                ],
                objectIdField: 'objectid',
                geometryType: 'point',
                spatialReference: {
                    wkid: 4326
                },
                source: LOCATIONS.map(function (v) {
                    return new Graphic({
                        geometry: ({
                            type: 'point',
                            x: v.location.x,
                            y: v.location.y,
                            spatialReference: {
                                wkid: 4326
                            }
                        }),
                        attributes: {
                            name: v.name,
                            description: v.description,
                            thumbnail: v.thumbnail
                        }
                    });
                }),
                renderer: {
                    type: 'simple',
                    symbol: {
                        type: 'picture-marker',
                        url: './img/locations.png',
                        width: '40px',
                        height: '80px'
                    }
                }
            });
            var destination = new FeatureLayer({
                fields: [
                    {
                        name: 'objectid',
                        alias: 'objectid',
                        type: 'oid'
                    }, {
                        name: 'name',
                        alias: 'name',
                        type: 'string'
                    }, {
                        name: 'description',
                        alias: 'description',
                        type: 'string'
                    }, {
                        name: 'thumbnail',
                        alias: 'thumbnail',
                        type: 'string'
                    }
                ],
                objectIdField: 'objectid',
                geometryType: 'point',
                spatialReference: {
                    wkid: 4326
                },
                source: [],
                renderer: {
                    type: 'simple',
                    symbol: {
                        type: 'picture-marker',
                        url: './img/destination.png',
                        width: '40px',
                        height: '80px'
                    }
                }
            });
            var origin = new FeatureLayer({
                fields: [
                    {
                        name: 'OBJECTID',
                        alias: 'OBJECTID',
                        type: 'oid'
                    }, {
                        name: 'StartLocation',
                        alias: 'StartLocation',
                        type: 'string'
                    }
                ],
                objectIdField: 'objectid',
                geometryType: 'point',
                spatialReference: {
                    wkid: 4326
                },
                source: [],
                renderer: {
                    type: 'simple',
                    symbol: {
                        type: 'picture-marker',
                        url: './img/origin.png',
                        width: '40px',
                        height: '80px'
                    }
                }
            });

            var route = new GraphicsLayer();

            var map = new Map({
                basemap: 'satellite',
                ground: 'world-elevation',
                layers: [
                    locations,
                    destination,
                    origin,
                    route
                ]
            });

            //
            var view = new SceneView({
                camera: NORTHAMERICA,
                popup: {
                    dockEnabled: true,
                    dockOptions: {
                        buttonEnabled: true
                    }
                },
                container: 'map',
                ui: {
                    components: [
                        'compass',
                        'zoom'
                    ]
                },
                map: map,
                environment: {
                    lighting: {
                        directShadowsEnabled: false,
                        ambientOcclusionEnabled: false,
                        cameraTrackingEnabled: true
                    },
                    atmosphereEnabled: true,
                    atmosphere: {
                        quality: 'low'
                    },
                    starsEnabled: true
                },
                highlightOptions: {
                    color: [0, 255, 255],
                    fillOpacity: 0.25,
                    haloOpacity: 1
                }
            });
            view.on('click', function (e) {
                view.hitTest({
                    x: e.x,
                    y: e.y
                }).then(function (f) {
                    // Check if valid event data.
                    if (!f || !f.results || f.results.length === 0) {
                        return;
                    }

                    switch (page) {
                        case 1:
                            // Check clicked graphic.
                            var graphic = f.results[0].graphic;
                            if (!graphic || graphic.layer !== locations) {
                                return;
                            }

                            //
                            destination.source.removeAll();
                            destination.source.add(graphic.clone());

                            break;
                        case 2:
                            // We dont want overlapping pushpins.
                            var graphic = f.results[0].graphic;
                            if (graphic) {
                                return;
                            }

                            // Must have a terrain click.
                            var mapPoint = f.results[0].mapPoint;
                            if (!mapPoint) {
                                return;
                            }

                            // Add origin
                            origin.source.add(new Graphic({
                                geometry: mapPoint
                            }));

                            break;
                        case 3:
                            break;
                    }
                    
                    //
                    updateUI();
                });
            });

            // Add home button.
            view.ui.add(new Home({
                view: view
            }), 'top-left');

            // Add search button.
            view.ui.add(new Search({
                view: view
            }), {
                position: 'top-left',
                index: 0
            });

            // Next and Previous button behavior.
            $('#button-page-1-next').click(function () {
                page++;
                updatePage();
                updateUI();
            });
            $('#button-page-2-back').click(function () {
                page--;
                updatePage();
                updateUI();
            });
            $('#button-page-2-process').click(function () {
                page++;
                isProcessing = true;
                updatePage();
                updateUI();
                process();
            });
            $('#button-page-3-cancel').click(function () {
                isProcessing = false;
                $('.rc-page-3-error > p').html('Cancelled by user.');
                updateUI();
            });
            $('#button-page-3-back').click(function () {
                page--;
                updatePage();
                updateUI();
            });
            $('#button-page-4-back').click(function () {
                
            });
            $('#button-page-4-startover').click(function () {
                
            });

            function updatePage() {
                switch (page) {
                    case 1:
                        //
                        locations.visible = true;
                        destination.visible = true;
                        origin.visible = false;
                        route.visible = false;

                        //
                        destination.source.removeAll();

                        $('.rc-page[data-value=1]').removeClass('collapse');
                        $('.rc-page[data-value=2]').addClass('collapse');
                        $('.rc-page[data-value=3]').addClass('collapse');
                        $('.rc-page[data-value=4]').addClass('collapse');

                        break;
                    case 2:
                        //
                        locations.visible = false;
                        destination.visible = true;
                        origin.visible = true
                        route.visible = false;

                        //
                        origin.source.removeAll();

                        $('.rc-page[data-value=1]').addClass('collapse');
                        $('.rc-page[data-value=2]').removeClass('collapse');
                        $('.rc-page[data-value=3]').addClass('collapse');
                        $('.rc-page[data-value=4]').addClass('collapse');

                        break;
                    case 3:
                        //
                        locations.visible = false;
                        destination.visible = true;
                        origin.visible = true
                        route.visible = true;

                        //
                        route.removeAll();

                        $('.rc-page[data-value=1]').addClass('collapse');
                        $('.rc-page[data-value=2]').addClass('collapse');
                        $('.rc-page[data-value=3]').removeClass('collapse');
                        $('.rc-page[data-value=4]').addClass('collapse');

                        break;

                    case 4:
                        //
                        locations.visible = false;
                        destination.visible = true;
                        origin.visible = true
                        route.visible = true;

                        $('.rc-page[data-value=1]').addClass('collapse');
                        $('.rc-page[data-value=2]').addClass('collapse');
                        $('.rc-page[data-value=3]').addClass('collapse');
                        $('.rc-page[data-value=4]').removeClass('collapse');

                        break;
                }
            }

            // Update UI
            function updateUI() {
                switch (page) {
                    case 1:
                        // Page 1 - Welcome + Add Destination
                        if (destination.source.length === 0) {
                            $('#button-page-1-next').addClass('collapse');
                        } else {
                            $('#button-page-1-next').removeClass('collapse');
                        }

                        break;
                    case 2:
                        // Page 2 - Add Origin
                        if (origin.source.length === 0) {
                            $('#button-page-2-process').addClass('collapse');
                        } else {
                            $('#button-page-2-process').removeClass('collapse');
                        }

                        break;
                    case 3:
                        // Page 3 - Processing/Error
                        if (isProcessing) {
                            $('.rc-page-3-processing').removeClass('collapse');
                            $('.rc-page-3-error').addClass('collapse');
                            $('#button-page-3-back').addClass('collapse');
                        } else {
                            $('.rc-page-3-processing').addClass('collapse');
                            $('.rc-page-3-error').removeClass('collapse');
                            $('#button-page-3-back').removeClass('collapse');
                        }

                        break;
                    case 4:
                        // Page 4 - Results


                        break;
                }
            }

            function process() {
                // Add fake data
                destination.source.removeAll();
                destination.source.add(
                    new Graphic({
                        geometry: ({
                            type: 'point',
                            x: LOCATIONS[1].location.x,
                            y: LOCATIONS[1].location.y,
                            spatialReference: {
                                wkid: 4326
                            }
                        }),
                        attributes: {
                            name: LOCATIONS[1].name,
                            description: LOCATIONS[1].description,
                            thumbnail: LOCATIONS[1].thumbnail
                        }
                    })
                );
                origin.source.removeAll();
                origin.source.add(
                    new Graphic({
                        geometry: ({
                            type: 'point',
                            x: -90.700026,
                            y: 38.810708,
                            spatialReference: {
                                wkid: 4326
                            }
                        }),
                        attributes: {
                            StartLocation: 'O\'Fallon'
                        }
                    })
                );

                // Zoom to hardcoded start/end locations.
                view.goTo([
                    destination.source.getItemAt(0),
                    origin.source.getItemAt(0)
                ]);

                ['\'M1\'', '\'M151\'', '\'T62\''].forEach(function (tank) {

                    var parameters = {
                        City: '\'NewMelle\'',   // 'NewMelle', 'StPeters'
                        //Vehicle: '\'T62\'',    // 'M1', 'M151', 'T62' 
                        Vehicle: tank,
                        Origins: new FeatureSet({
                            geometryType: 'point',
                            fields: [
                                {
                                    name: 'OBJECTID',
                                    alias: 'OBJECTID',
                                    type: 'oid'
                                }, {
                                    name: 'StartLocation',
                                    alias: 'StartLocation',
                                    type: 'string'
                                }
                            ],
                            features: origin.source.toArray()
                        })
                    };

                    var gp = new Geoprocessor({
                        url: LEASTCOST,
                        outSpatialReference: {
                            wkid: 102100
                        },
                        updateDelay: 1000
                    });

                    gp.submitJob(parameters).then(function (result) {
                        gp.getResultData(result.jobId, 'LeastCostPaths').then(function (e) {
                            // Exit if processing already cancelled by user.
                            //if (!isProcessing) {
                            //    return;
                            //}

                            // Add route to map.
                            route.addMany(e.value.features.map(function (g) {
                                return new Graphic({
                                    geometry: g.geometry.clone(),
                                    symbol: {
                                        type: 'simple-line',
                                        color: 'red',
                                        width: 5
                                    }
                                })
                            }));

                            // Update UI
                            //isProcessing = false;
                            page++;
                            updatePage();
                            updateUI();
                        }).otherwise(function (error) {
                            // Update UI
                            isProcessing = false;
                            updateUI();
                            $('.rc-page-3-error > p').html(error.message);
                        });
                    }).otherwise(function (error) {
                        // Update UI
                        isProcessing = false;
                        updateUI();
                        $('.rc-page-3-error > p').html(error.message);
                    });
                });
            }
        });
    }
);