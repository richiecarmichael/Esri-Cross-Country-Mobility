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

            //
            //var LEASTCOST = 'https://maps.esri.com/apl3/rest/services/CCM/MosaicLCP/GPServer/MosaicLCP';
            var LEASTCOST = 'https://maps.esri.com/apl22/rest/services/CCM/MosaicLCP2dj/GPServer/MosaicLCP';
            var DESTINATIONS = [{
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

            var destinations = DESTINATIONS.map(function (v) {
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
                source: destinations,
                renderer: {
                    type: 'simple',
                    symbol: {
                        type: 'picture-marker',
                        url: './img/destination.png',
                        width: '40px',
                        height: '80px'
                    }
                },
                visible: false
            });

            var map = new Map({
                basemap: 'satellite',
                ground: 'world-elevation',
                layers: [
                    destination
                ]
            });

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

            //
            var view = new SceneView({
                camera: MISSOURI,
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

            var start = {
                graphic: null,
                highlight: null
            };

            view.on('pointer-down', function (e) {
                view.hitTest({
                    x: e.x,
                    y: e.y
                }).then(function (f) {
                    //
                    if (!f || !f.results ||
                        f.results.length === 0 ||
                        !f.results[0].graphic ||
                        f.results[0].graphic.layer !== destination) {
                        return;
                    }
                   
                    if (start.highlight) {
                        start.highlight.remove();
                    }

                    var graphic = f.results[0].graphic;
                    view.whenLayerView(destination).then(function (layerView) {
                        start = {
                            graphic: graphic,
                            highlight: layerView.highlight(graphic)
                        }
                    });
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
                openPage(2);
            });
            $('#button-page-2-back').click(function () {
                openPage(1);
            });
            $('#button-page-2-process').click(function () {
                openPage(3);
                process();
            });
            $('#button-page-3-cancel').click(function () {
                //
            });
            $('#button-page-3-back').click(function () {
                openPage(2);
            });
            $('#button-page-3-startover').click(function () {
                openPage(1);
            });

            function openPage(page) {
                switch (page) {
                    case 0:
                        destination.visible = false;
                        break;
                    case 1:
                        destination.visible = true;
                        break
                }
                //console.log(view.camera.toJSON());
                $('.rc-page[data-value=' + page + ']').removeClass('collapse');
                $('.rc-page[data-value!=' + page + ']').addClass('collapse');
            }

            function process() {
                // LEASTCOST
                var gp = new Geoprocessor({
                    url: LEASTCOST,
                    outSpatialReference: {
                        wkid: 102100
                    },
                    updateDelay: 1000
                });

                var parameters = {
                    City: '\'NewMelle\'',   // 'NewMelle', 'StPeters'
                    Vehicle: '\'M151\'',    // 'M1', 'M151', 'T62' 
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
                        features: [
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
                        ]
                    })
                };

                //
                gp.submitJob(parameters).then(function (result) {
                    var messages = result.messages;
                    var results = result.results;
                    messages.forEach(function (e) {
                        console.log(e.type + " " + e.description);
                    });
                    //var resultFeatures = result.results[0].value.features;
                    var x = '';
                    //// Assign each resulting graphic a symbol
                    //var viewshedGraphics = resultFeatures.map(function (feature) {
                    //    feature.symbol = fillSymbol;
                    //    return feature;
                    //});

                    //// Add the resulting graphics to the graphics layer
                    //graphicsLayer.addMany(viewshedGraphics);

                    ///********************************************************************
                    // * Animate to the result. This is a temporary workaround
                    // * for animating to an array of graphics in a SceneView. In a future
                    // * release, you will be able to replicate this behavior by passing
                    // * the graphics directly to the goTo function, like the following:
                    // *
                    // * view.goTo(viewshedGraphics);
                    // ********************************************************************/
                    //view.goTo({
                    //    target: viewshedGraphics,
                    //    tilt: 0
                    //});
                });
            }
        });
    }
);