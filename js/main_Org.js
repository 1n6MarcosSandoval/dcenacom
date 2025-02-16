﻿/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
var georssUrl = "http://www.incendiosmovil.gob.mx/dCENACOM/REPORTE.xml";
var georss;
var FeatureLay;
var banderaMapTip = false;
var Map2;
var infoTemplate;
define(["dojo/ready", "dojo/json", "dojo/_base/array", "dojo/_base/Color", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "dojo/dom-geometry", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/on", "dojo/Deferred", "dojo/promise/all", "dojo/query", "dijit/registry", "dijit/Menu", "dijit/CheckedMenuItem", "application/toolbar", "application/has-config", "esri/arcgis/utils", "esri/dijit/HomeButton", "esri/dijit/LocateButton", "esri/dijit/Legend", "esri/dijit/BasemapGallery", "esri/dijit/Measurement", "esri/dijit/OverviewMap", "esri/geometry/Extent", "esri/layers/FeatureLayer", "application/TableOfContents", "application/ShareDialog", "esri/layers/GeoRSSLayer"], function (
ready, JSON, array, Color, declare, lang, dom, domGeometry, domAttr, domClass, domConstruct, domStyle, on, Deferred, all, query, registry, Menu, CheckedMenuItem, Toolbar, has, arcgisUtils, HomeButton, LocateButton, Legend, BasemapGallery, Measurement, OverviewMap, Extent, FeatureLayer, TableOfContents, ShareDialog) {


    return declare(null, {
        config: {},
        color: null,
        theme: null,
        map: null,
        initExt: null,
        mapExt: null,
        editorDiv: null,
        editor: null,
        editableLayers: null,



        startup: function (config) {
            // config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id and any url parameters and any application specific configuration information.
            if (config) {
                this.config = config;
                this.color = this.setColor(this.config.color);
                this.theme = this.setColor(this.config.theme);
                // document ready   
                ready(lang.hitch(this, function () {
                    //supply either the webmap id or, if available, the item info
                    var itemInfo = this.config.itemInfo || this.config.webmap;
                    //If a custom extent is set as a url parameter handle that before creating the map 
                    if (this.config.extent) {
                        var extArray = decodeURIComponent(this.config.extent).split(",");
                        //-101.608429, 23.200961
                        if (extArray.length === 4) {
                            itemInfo.item.extent = [
                                [parseFloat(extArray[0]), parseFloat(extArray[1])],
                                [parseFloat(extArray[2]), parseFloat(extArray[3])]
                            ];
                        } else if (extArray.length === 5) {
                            this.initExt = new Extent(JSON.parse(this.config.extent));

                        }
                    }
                    
                    this._createWebMap(itemInfo);


                }));
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },

        reportError: function (error) {
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            domClass.add(document.body, "app-error");
            // an error occurred - notify the user. In this example we pull the string from the
            // resource.js file located in the nls folder because we've set the application up
            // for localization. If you don't need to support multiple languages you can hardcode the
            // strings here and comment out the call in index.html to get the localization strings.
            // set message
            var node = dom.byId("loading_message");
            if (node) {
                if (this.config && this.config.i18n) {
                    node.innerHTML = this.config.i18n.map.error + ": " + error.message;
                } else {
                    node.innerHTML = "Unable to create map: " + error.message;
                }
            }
        },

        setColor: function (color) {
            var rgb = Color.fromHex(color).toRgb();
            var outputColor = null;
            if (has("ie") < 9) {
                outputColor = color;
            } else {
                //rgba supported so add 
                rgb.push(0.9);
                outputColor = Color.fromArray(rgb);

            }

            return outputColor;

        },

        // Map is ready
        _mapLoaded: function () {
            query(".esriSimpleSlider").style("backgroundColor", this.theme.toString());
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            on(window, "orientationchange", lang.hitch(this, this._adjustPopupSize));
            this._adjustPopupSize();
        },

        // Create UI
        _createUI: function () {
            domStyle.set("panelPages", "visibility", "hidden");
            //Add tools to the toolbar. The tools are listed in the defaults.js file 
            var toolbar = new Toolbar(this.config);
            toolbar.startup().then(lang.hitch(this, function () {

                // set map so that it can be repositioned when page is scrolled
                toolbar.map = this.map;

                var toolList = [];
                for (var i = 0; i < this.config.tools.length; i++) {
                    switch (this.config.tools[i].name) {
                        case "legend":
                            toolList.push(this._addLegend(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "bookmarks":
                            toolList.push(this._addBookmarks(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "layers":
                            toolList.push(this._addLayers(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "basemap":
                            toolList.push(this._addBasemapGallery(this.config.tools[i], toolbar, "large"));
                            break;
                        case "overview":
                            toolList.push(this._addOverviewMap(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "measure":
                            toolList.push(this._addMeasure(this.config.tools[i], toolbar, "small"));
                            break;
                        case "edit":
                            toolList.push(this._addEditor(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "print":
                            toolList.push(this._addPrint(this.config.tools[i], toolbar, "small"));
                            break;
                        case "details":
                            toolList.push(this._addDetails(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "share":
                            toolList.push(this._addShare(this.config.tools[i], toolbar, "medium"));
                            break;
                         
                        default:
                            break;
                    }
                }

                all(toolList).then(lang.hitch(this, function (results) {


                    //If all the results are false and locate and home are also false we can hide the toolbar
                    var tools = array.some(results, function (r) {
                        return r;
                    });

                    var home = has("home");
                    var locate = has("locate");


                    //No tools are specified in the configuration so hide the panel and update the title area styles 
                    if (!tools && !home && !locate) {
                        domConstruct.destroy("panelTools");
                        domStyle.set("panelContent", "display", "none");
                        domStyle.set("panelTitle", "border-bottom", "none");
                        domStyle.set("panelTop", "height", "52px");
                        query(".esriSimpleSlider").addClass("notools");
                        this._updateTheme();
                        return;
                    }

                    //Now that all the tools have been added to the toolbar we can add page naviagation
                    //to the toolbar panel, update the color theme and set the active tool. 
                    this._updateTheme();
                    toolbar.activateTool(this.config.activeTool);
                    toolbar.updatePageNavigation();

                    on(toolbar, "updateTool", lang.hitch(this, function (name) {
                        if (name === "measure") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                        } else if (name === "edit") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                            this._createEditor();
                        } else {
                            //activate the popup and destroy editor if necessary
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(true);
                        }
                    }));

                    domStyle.set("panelPages", "visibility", "visible");

                }));
            }));
        },
        _addBasemapGallery: function (tool, toolbar, panelClass) {
            //Add the basemap gallery to the toolbar. 
            var deferred = new Deferred();
            if (has("basemap")) {
                var basemapDiv = toolbar.createTool(tool, panelClass);
                var basemap = new BasemapGallery({
                    id: "basemapGallery",
                    map: this.map,
                    showArcGISBasemaps: true,
                    portalUrl: this.config.sharinghost,
                    basemapGroup: this._getBasemapGroup()
                }, domConstruct.create("div", {}, basemapDiv));
                basemap.startup();
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _addBookmarks: function (tool, toolbar, panelClass) {
            //Add the bookmarks tool to the toolbar. Only activated if the webmap contains bookmarks. 
            var deferred = new Deferred();
            if (this.config.response.itemInfo.itemData.bookmarks) {
                //Conditionally load this module since most apps won't have bookmarks
                require(["application/has-config!bookmarks?esri/dijit/Bookmarks"], lang.hitch(this, function (Bookmarks) {
                    if (!Bookmarks) {
                        deferred.resolve(false);
                        return;
                    }
                    var bookmarkDiv = toolbar.createTool(tool, panelClass);
                    var bookmarks = new Bookmarks({
                        map: this.map,
                        bookmarks: this.config.response.itemInfo.itemData.bookmarks
                    }, bookmarkDiv);

                    deferred.resolve(true);

                }));

            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },
        _addDetails: function (tool, toolbar, panelClass) {
            //Add the default map description panel 
            var deferred = new Deferred();
            if (has("details")) {
                var description = this.config.description || this.config.response.itemInfo.item.description || this.config.response.itemInfo.item.snippet;
                if (description) {
                    var descLength = description.length;
                    //Change the panel class based on the string length
                    if (descLength < 200) {
                        panelClass = "small";
                    } else if (descLength < 400) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }

                    var detailDiv = toolbar.createTool(tool, panelClass);
                    detailDiv.innerHTML = description;
                }
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;

        },
        _addEditor: function (tool, toolbar, panelClass) {

            //Add the editor widget to the toolbar if the web map contains editable layers 
            var deferred = new Deferred();
            this.editableLayers = this._getEditableLayers(this.config.response.itemInfo.itemData.operationalLayers);
            if (has("edit") && this.editableLayers.length > 0) {
                if (this.editableLayers.length > 0) {
                    this.editorDiv = toolbar.createTool(tool, panelClass);
                    return this._createEditor();
                } else {
                    console.log("No Editable Layers");
                    deferred.resolve(false);
                }
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },
        _createEditor: function () {
            var deferred = new Deferred();
            //Dynamically load since many apps won't have editable layers 
            require(["application/has-config!edit?esri/dijit/editing/Editor"], lang.hitch(this, function (Editor) {
                if (!Editor) {
                    deferred.resolve(false);
                    return;
                }


                //add field infos if necessary. Field infos will contain hints if defined in the popup and hide fields where visible is set
                //to false. The popup logic takes care of this for the info window but not the edit window. 
                array.forEach(this.editableLayers, lang.hitch(this, function (layer) {
                    if (layer.featureLayer && layer.featureLayer.infoTemplate && layer.featureLayer.infoTemplate.info && layer.featureLayer.infoTemplate.info.fieldInfos) {
                        //only display visible fields 
                        var fields = layer.featureLayer.infoTemplate.info.fieldInfos;
                        var fieldInfos = [];
                        array.forEach(fields, function (field) {
                            if (field.visible) {
                                fieldInfos.push(field);
                            }
                        });
                        layer.fieldInfos = fieldInfos;
                    }
                }));
                var settings = {
                    map: this.map,
                    layerInfos: this.editableLayers,
                    toolbarVisible: has("edit-toolbar")
                };
                this.editor = new Editor({
                    settings: settings
                }, domConstruct.create("div", {}, this.editorDiv));


                this.editor.startup();
                deferred.resolve(true);

            }));
            return deferred.promise;

        },
        _destroyEditor: function () {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }

        },
        _addLayers: function (tool, toolbar, panelClass) {
            //Toggle layer visibility if web map has operational layers 
            var deferred = new Deferred();

            var layers = this.config.response.itemInfo.itemData.operationalLayers;
            layers[0].pointSymbol.url = "http://static.arcgis.com/images/Symbols/Shapes/RedCircleLargeB.png";
            layers[0].pointSymbol.imageData = "";

            var geo = new esri.layers.GeoRSSLayer("http://www.incendiosmovil.gob.mx/dCENACOM/REPORTE.xml");


            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("layers")) {


                    //Use small panel class if layer layer is less than 5
                    if (layers.length < 5) {
                        panelClass = "small";
                    } else if (layers.length < 15) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }
                    var layersDiv = toolbar.createTool(tool, panelClass);

                    var toc = new TableOfContents({
                        map: this.map,
                        layers: layers
                    }, domConstruct.create("div", {}, layersDiv));
                    toc.startup();


                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }
            return deferred.promise;
        },
        _addLegend: function (tool, toolbar, panelClass) {
            //Add the legend tool to the toolbar. Only activated if the web map has operational layers. 
            var deferred = new Deferred();
            var layers = arcgisUtils.getLegendLayers(this.config.response);


            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("legend")) {
                    var legendLength = 0;
                    array.forEach(layers, lang.hitch(this, function (layer) {
                        if (layer.infos && layer.infos.length) {
                            legendLength += layer.infos.length;
                        }
                    }));

                    if (legendLength.length < 5) {
                        panelClass = "small";
                    } else if (legendLength.length < 15) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }

                    var legendDiv = toolbar.createTool(tool, panelClass);
                    var legend = new Legend({
                        map: this.map,
                        layerInfos: layers
                    }, 
                    domConstruct.create("div", {
                        //id: "panelLogo",
                        innerHTML: "<img id='logo' src='images/Leyenda.jpg' width='50%'></>"
                    },legendDiv));

                    domClass.add(legend.domNode, "legend");
                    //legend.startup();
                    toolbar.activateTool(this.config.activeTool || "legend");
                    deferred.resolve(true);

                } else {
                    deferred.resolve(false);
                }


            }
            return deferred.promise;
        },

        _addMeasure: function (tool, toolbar, panelClass) {
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();
            if (has("measure")) {

                var measureDiv = toolbar.createTool(tool, panelClass);
                var areaUnit = (this.config.units === "metric") ? "esriSquareKilometers" : "esriSquareMiles";
                var lengthUnit = (this.config.units === "metric") ? "esriKilometers" : "esriMiles";

                var measure = new Measurement({
                    map: this.map,
                    defaultAreaUnit: areaUnit,
                    defaultLengthUnit: lengthUnit
                }, domConstruct.create("div", {}, measureDiv));

                measure.startup();
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }



            return deferred.promise;
        },
        _addOverviewMap: function (tool, toolbar, panelClass) {
            //Add the overview map to the toolbar 
            var deferred = new Deferred();

            if (has("overview")) {
                var ovMapDiv = toolbar.createTool(tool, panelClass);


                domStyle.set(ovMapDiv, {
                    "height": "100%",
                    "width": "100%"
                });

                var panelHeight = this.map.height;
                if (panelClass === "small") {
                    panelHeight = 250;
                } else if (panelClass === "medium") {
                    panelHeight = 350;
                }

                var ovMap = new OverviewMap({
                    id: "overviewMap",
                    map: this.map,
                    height: panelHeight
                }, domConstruct.create("div", {}, ovMapDiv));

                ovMap.startup();

                on(this.map, "layer-add", lang.hitch(this, function (args) {
                    //delete and re-create the overview map if the basemap gallery changes  
                    if (args.layer.hasOwnProperty("_basemapGalleryLayerType") && args.layer._basemapGalleryLayerType === "basemap") {
                        registry.byId("overviewMap").destroy();
                        var ovMap = new OverviewMap({
                            id: "overviewMap",
                            map: this.map,
                            height: panelHeight,
                            visible: false
                        }, domConstruct.create("div", {}, ovMapDiv));

                        ovMap.startup();
                    }
                }));
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }


            return deferred.promise;
        },
        _addPrint: function (tool, toolbar, panelClass) {
            //Add the print widget to the toolbar. TODO: test custom layouts. 
            var deferred = new Deferred(),
                legendNode = null,
                print = null;


            require(["application/has-config!print?esri/dijit/Print"], lang.hitch(this, function (Print) {
                var layoutOptions = {
                    "titleText": this.config.title,
                    "scalebarUnit": this.config.units,
                    "legendLayers": []
                };
                if (!Print) {
                    deferred.resolve(false);
                    return;
                }

                //var printDiv = toolbar.createTool(tool, panelClass);
                if (has("print-legend")) {
                    legendNode = domConstruct.create("input", {
                        id: "legend_ck",
                        className: "checkbox",
                        type: "checkbox",
                        checked: false
                    }, domConstruct.create("div", {
                        "class": "checkbox"
                    }));

                    var labelNode = domConstruct.create("label", {
                        "for": "legend_ck",
                        "className": "checkbox",
                        "innerHTML": "  " + this.config.i18n.tools.print.legend
                    }, domConstruct.create("div"));
                    //domConstruct.place(legendNode, printDiv);
                    //domConstruct.place(labelNode, printDiv);

                    on(legendNode, "change", lang.hitch(this, function (arg) {


                        if (legendNode.checked) {
                            var layers = arcgisUtils.getLegendLayers(this.config.response);
                            var legendLayers = array.map(layers, function (layer) {
                                return {
                                    "layerId": layer.layer.id
                                };
                            });
                            if (legendLayers.length > 0) {
                                layoutOptions.legendLayers = legendLayers;
                            }
                            array.forEach(print.templates, function (template) {
                                template.layoutOptions = layoutOptions;
                            });


                        } else {
                            array.forEach(print.templates, function (template) {
                                if (template.layoutOptions && template.layoutOptions.legendLayers) {
                                    template.layoutOptions.legendLayers = [];
                                }

                            });
                        }


                    }));
                }

                require(["application/has-config!print-layouts?esri/request", "application/has-config!print-layouts?esri/tasks/PrintTemplate"], lang.hitch(this, function (esriRequest, PrintTemplate) {
                    if (!esriRequest && !PrintTemplate) {
                        //Use the default print templates 
                        var templates = [{
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label1,
                            format: "PDF"
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label2,
                            format: "PDF"
                        },
                        {
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label3,
                            format: "PNG32"
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label4,
                            format: "PNG32"
                        }];



                        print = new Print({
                            map: this.map,
                            id: "printButton",
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div"));
                        //domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();



                        deferred.resolve(true);
                        return;
                    }

                    esriRequest({
                        url: this.config.helperServices.printTask.url,
                        content: {
                            "f": "json"
                        },
                        "callbackParamName": "callback"
                    }).then(lang.hitch(this, function (response) {
                        var layoutTemplate, templateNames, mapOnlyIndex, templates;

                        layoutTemplate = array.filter(response.parameters, function (param, idx) {
                            return param.name === "Layout_Template";
                        });

                        if (layoutTemplate.length === 0) {
                            console.log("print service parameters name for templates must be \"Layout_Template\"");
                            return;
                        }
                        templateNames = layoutTemplate[0].choiceList;

                        // remove the MAP_ONLY template then add it to the end of the list of templates 
                        mapOnlyIndex = array.indexOf(templateNames, "MAP_ONLY");
                        if (mapOnlyIndex > -1) {
                            var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
                            templateNames.push(mapOnly);
                        }

                        // create a print template for each choice
                        templates = array.map(templateNames, function (name) {
                            var plate = new PrintTemplate();
                            plate.layout = plate.label = name;
                            plate.format = "pdf";
                            plate.layoutOptions = layoutOptions;
                            return plate;
                        });


                        print = new Print({
                            map: this.map,
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div")); //domConstruct.create("div",{}),printDiv); 
                        domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();
                        deferred.resolve(true);

                    }));
                }));

            }));


            return deferred.promise;
        },
        _addShare: function (tool, toolbar, panelClass) {
            //Add share links for facebook, twitter and direct linking. 
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();

            if (has("share")) {

                var shareDiv = toolbar.createTool(tool, panelClass);

                var shareDialog = new ShareDialog({
                    bitlyLogin: this.config.bitlyLogin,
                    bitlyKey: this.config.bitlyKey,
                    map: this.map,
                    image: this.config.sharinghost + "/sharing/rest/content/items/" + this.config.response.itemInfo.item.id + "/info/" + this.config.response.itemInfo.thumbnail,
                    title: this.config.title,
                    summary: this.config.response.itemInfo.snippet
                }, shareDiv);
                domClass.add(shareDialog.domNode, "pageBody");
                shareDialog.startup();

                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }


            return deferred.promise;

        },
        
        _getEditableLayers: function (layers) {
            var layerInfos = [];
            array.forEach(layers, lang.hitch(this, function (layer) {

                if (layer && layer.layerObject) {
                    var eLayer = layer.layerObject;
                    if (eLayer instanceof FeatureLayer && eLayer.isEditable()) {
                        layerInfos.push({
                            "featureLayer": eLayer
                        });
                    }
                }
            }));
            return layerInfos;
        },


        _getBasemapGroup: function () {
            //Get the id or owner and title for an organizations custom basemap group. 
            var basemapGroup = null;
            if (this.config.basemapgroup && this.config.basemapgroup.title && this.config.basemapgroup.owner) {
                basemapGroup = {
                    "owner": this.config.basemapgroup.owner,
                    "title": this.config.basemapgroup.title
                };
            } else if (this.config.basemapgroup && this.config.basemapgroup.id) {
                basemapGroup = {
                    "id": this.config.basemapgroup.id
                };
            }
            return basemapGroup;
        },

        _createMapUI: function () {
            // Add map specific widgets like the Home  and locate buttons. Also add the geocoder. 
            if (has("home")) {
                domConstruct.create("div", {
                    id: "panelHome",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnHome'></div>"
                }, dom.byId("panelTools"), 0);
                var home = new HomeButton({
                    map: this.map
                }, dom.byId("btnHome"));

                if (!has("touch")) {
                    //add a tooltip 
                    domAttr.set("btnHome", "data-title", this.config.i18n.tooltips.home);
                } else {
                    //remove no-touch class from body 
                    domClass.remove(document.body, "no-touch");

                }

                home.startup();
            }

            if (has("locate")) {
                domConstruct.create("div", {
                    id: "panelLocate",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnLocate'></div>"
                }, dom.byId("panelTools"), 1);
                var geoLocate = new LocateButton({
                    map: this.map
                }, dom.byId("btnLocate"));
                if (!has("touch")) {
                    //add a tooltip 
                    domAttr.set("btnLocate", "data-title", this.config.i18n.tooltips.locate);
                }


                geoLocate.startup();

            }

            //Add the location search widget 
            require(["application/has-config!search?application/CreateGeocoder"], lang.hitch(this, function (CreateGeocoder) {
                if (!CreateGeocoder) {
                    return;
                }

                var geocoder = new CreateGeocoder({
                    map: this.map,
                    config: this.config
                });
                if (geocoder.geocoder && geocoder.geocoder.domNode) {
                    domConstruct.place(geocoder.geocoder.domNode, "panelGeocoder");
                }
            }));

            //create the tools 
            this._createUI();

        },
        _updateTheme: function () {

            //Set the background color using the configured theme value 
            query(".bg").style("backgroundColor", this.theme.toString());
            query(".esriPopup .pointer").style("backgroundColor", this.theme.toString());
            query(".esriPopup .titlePane").style("backgroundColor", this.theme.toString());


            //Set the font color using the configured color value   
            query(".fc").style("color", this.color.toString());
            query(".esriPopup .titlePane").style("color", this.color.toString());
            query(".esriPopup. .titleButton").style("color", this.color.toString());


            //Set the Slider +/- color to match the icon style. Valid values are white and black
            // White is default so we just need to update if using black. 
            //Also update the menu icon to match the tool color. Default is white. 
            if (this.config.icons === "black") {
                query(".esriSimpleSlider").style("color", "#000");
                query(".icon-color").style("color", "#000");
            }

        },
        _checkExtent: function () {
            //-101.608429, 23.200961
            var pt = this.map.extent.getCenter();
            if (!this.initExt.contains(pt)) {
                this.map.setExtent(this.mapExt);
            } else {
                this.mapExt = this.map.extent;
            }
        },
        _adjustPopupSize: function () {
            if (!this.map) {
                return;
            }
            var box = domGeometry.getContentBox(this.map.container);

            var width = 270,
                height = 300,
                newWidth = Math.round(box.w * 0.50),
                newHeight = Math.round(box.h * 0.35);
            if (newWidth < width) {
                width = newWidth;
            }
            if (newHeight < height) {
                height = newHeight;
            }
            this.map.infoWindow.resize(width, height);
        },
        _createWebMap: function (itemInfo) {
            // create a map based on the input web map id
            arcgisUtils.createMap(itemInfo, "mapDiv", {
                usePopupManager: true,
                bingMapsKey: this.config.bingKey
            }).then(lang.hitch(this, function (response) {

                this.map = response.map;
                Map2 = this.map;
                domClass.add(this.map.infoWindow.domNode, "light");
                this._updateTheme();

                //Add a logo if provided
                domConstruct.create("div", {
                    id: "panelLogo",
                    innerHTML: "<img id='logo' src='images/LogoBlanco.png'></>"
                }, dom.byId("panelTitle"), "first");


                //Set the application title
                this.map = response.map;
                //Set the title - use the config value if provided. 
                var title = "CENACOM";
                this.config.title = title;
                document.title = title;
                dom.byId("panelText").innerHTML = title;
                this.config.response = response;
                window.config = this.config;

                if (this.initExt !== null) {
                    this.map.setExtent(this.initExt);
                }
                this.initExt = this.map.extent;
                on.once(this.map, "extent-change", lang.hitch(this, this._checkExtent));

                this._createMapUI();
                georssLayer();
                //FeatureLayer()
                // make sure map is loaded
                if (this.map.loaded) {
                    // do something with the map
                    this._mapLoaded();
                } else {
                    on.once(this.map, "load", lang.hitch(this, function () {
                        // do something with the map
                        this._mapLoaded();
                    }));
                }
            }), this.reportError);
        },
    });

});
/////////////////
require([

    "esri/layers/GeoRSSLayer",
       "esri/symbols/PictureMarkerSymbol"
        

], function (GeoRSSLayer, PictureMarkerSymbol) {
    georss = new GeoRSSLayer(georssUrl, { pointSymbol: new PictureMarkerSymbol("images/Rojo.png", 25, 25) });
    featureLay = new esri.layers.FeatureLayer("http://www.saver.gob.mx/ArcGIS/rest/services/Informacion_base/MapServer/17", {
    });
    featureLay.id = "FL";

    
});
function georssLayer() {
    Clasificacion(georss, featureLay);
   
}

// Lo que se ve leyenda
function Clasificacion(georss, featureLay) {
    var symbol_rojo = new esri.symbol.PictureMarkerSymbol("images/Rojo.png", 75, 75);
    var symbol_naranja = new esri.symbol.PictureMarkerSymbol("images/Naranja.png", 75, 75);
    var symbol_amarillo = new esri.symbol.PictureMarkerSymbol("images/Amarillo.png", 75, 75);

        require(["dojo/_base/array"], function (arrayUtils) {
            arrayUtils.forEach(georss.items, function (l) {

                if (l.attributes.nivel == 0 || l.attributes.nivel == 4)
                    l.symbol = symbol_rojo;
                if (l.attributes.nivel == 1)
                    l.symbol = symbol_amarillo;
                if (l.attributes.nivel == 2)
                    l.symbol = symbol_naranja;

            });
        });
        
        
        //procesar();
        Map2.addLayers([georss, featureLay]);
}

//function procesar() {
//    $.ajax({
//        url: 'php/mapap.php',                   /* URL a invocar asíncronamente */
//        type: 'post',                           /* Método utilizado para el requerimiento */
//        data: { "codigo": "09003" },
//        dataType: "json",
//        success: function (data) {     /* Información local a enviarse con el requerimiento */
//            alert("success");

//        },
//        error: function (data) {
//            alert(data['nombre']);
//        }
    
//    });



function procesar() {
    
    require([
                    "esri/InfoTemplate"
    ], function (
                    InfoTemplate
                 ) {
        infoTemplate = new esri.InfoTemplate();
        infoTemplate.setTitle("<b>${municipio},${estado}</b>");
        infoTemplate.setContent("<b>${efectoAdverso}</b><br>"
         + "${fecha}<br>"
         + "<b>Dependencias:</b><br>${dependencias}<br>"
         + "<b>Recomendaciones:</b><br>${recomendaciones}<br>"
         + "<b>Tel:088<br>"
         + "<b>Tel:018000041300<br>");
    });
    $.ajax({
        type: "POST",
        url: "Funciones2.php",
        dataType: "json",
        data: { "codigo": "codigo" },
        success: function (data) {
            // create layout dijits
            //parser.parse();
            //initialize query task
            var graphicsLayer = new esri.layers.GraphicsLayer();
            var queryTask = new esri.tasks.QueryTask("http://anr.gob.mx:6081/adaptor/rest/services/ANR/Datos_Basicos/MapServer/5");
            //initialize query
            //SplitLista=data.ListaMun.split(",");	
            var cadenaMun = "";
            DatosPintar = data;
            var contadorMun = 0;
            for (z = 0; z < data.DatosPol.length; z++) {
                for (y = 0; y < data.DatosPol[z]['UbicacionPoligonos'].length; y++) {
                    if (contadorMun == 0) {
                        cadenaMun = "(CVE_MUN=" + data.DatosPol[z]['UbicacionPoligonos'][y]['clavemun'] + " and CVE_ENT=" + data.DatosPol[z]['UbicacionPoligonos'][y]['claveestado'] + ") or";
                    }
                    else {
                        cadenaMun = cadenaMun + "(CVE_MUN=" + data.DatosPol[z]['UbicacionPoligonos'][y]['clavemun'] + " and CVE_ENT=" + data.DatosPol[z]['UbicacionPoligonos'][y]['claveestado'] + ") or";;
                    }
                }
                contadorMun++;
            }
            cadenaMun = cadenaMun.substr(0, cadenaMun.length - 3);
            var query = new esri.tasks.Query();
            query.returnGeometry = true;
            query.outFields = ["CVE_MUN", "NOM_MUN", "CVE_ENT", "NOM_ENT_"];
            query.outSpatialReference = { "wkid": 102100 };
            query.where = cadenaMun;
            query.maxAllowableOffset = 5000;
            queryTask.execute(query, showResults);
            Map2.addLayer(graphicsLayer);
            for (x = 0; x < DatosPintar.Eventos.length; x++) {
                var defaultSymbol;
                switch (DatosPintar.Eventos[x]['nivel']) {
                    case "1":
                        defaultSymbol = new esri.symbol.PictureMarkerSymbol('img/Simbolos/Alertas_rojo.gif', 30, 30);
                        break;
                    case "2":
                        defaultSymbol = new esri.symbol.PictureMarkerSymbol('img/Simbolos/Alertas_amarillo.gif', 30, 30);
                        break;
                    case "3":
                        defaultSymbol = new esri.symbol.PictureMarkerSymbol('img/Simbolos/Alertas_verde.gif', 30, 30);
                        break;
                    default:
                        defaultSymbol = new esri.symbol.PictureMarkerSymbol('img/Simbolos/Alertas_rojo.gif', 30, 30);
                        break;
                }
                if (DatosPintar.Eventos[x]['longitud'] === " " || DatosPintar.Eventos[x]['latitud'] === " ")
                { }
                else {
                    CrearPoint(DatosPintar.Eventos[x]['longitud'], DatosPintar.Eventos[x]['latitud'], defaultSymbol, DatosPintar.Eventos[x]);
                }
                //break;
            }
            
            //dojo.connect(Map2.graphics, "onClick", identifyFeatures);
            function identifyFeatures(evt) {
                var dialog;
                require([
                    "esri/lang", "dojo/dom-style",
                    "dijit/TooltipDialog", "dijit/popup", "dojo/domReady!", "esri/InfoTemplate"
                ], function (
                    esriLang, domStyle,
                    TooltipDialog, dijitPopup, InfoTemplate
                ) {
                    dialog = new TooltipDialog({
                        //id: "tooltipDialog",
                        style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
                    });
                    dialog.startup();
                    if (banderaMapTip == false) {
                        var t = "<b>${municipio},${estado}</b><a id='myLink' href='http://google.com'>Reporte</a><br><hr>"
                        + "<b>${efectoAdverso}</b><br>"
                        + "${fecha}<br>"
                        + "<b>Dependencias:</b><br>${dependencias}<br>"
                        + "<b>Recomendaciones:</b><br>${recomendaciones}<br>"
                        + "<b>Tel:088<br>"
                        + "<b>Tel:018000041300<br>";



                        


                        var content = esriLang.substitute(evt.graphic.attributes, t);
                        dialog.setContent(content);
                        domStyle.set(dialog.domNode, "opacity", 0.75);
                        banderaMapTip = true;
                        dijitPopup.open({
                            popup: dialog,
                            x: evt.pageX,
                            y: evt.pageY
                        });
                    }
                    else {
                        dijitPopup.close(dialog);
                        banderaMapTip = false;
                    }
                    
                });
            }
        },
        error: function (data) {
            alert(data['nombre']);
        }
    });
    function CrearPoint(x, y, defaultSymbol, DatosPintar) {
        
            var graphicsLayer = new esri.layers.GraphicsLayer();
            var pt = new esri.geometry.Point({ "x": x, "y": y, "spatialReference": { "wkid": 4326} });
            var graphic = new esri.Graphic(pt, defaultSymbol);
            var cadenaDependencias="";
            for (n=0;n<DatosPintar['dependencias'].length;n++) {
                cadenaDependencias=cadenaDependencias+DatosPintar['dependencias'][n]+"<br>";
            }	
            graphic.setAttributes( {"municipio":DatosPintar['municipio'],
                "estado":DatosPintar['estado'],
                "efectoAdverso":DatosPintar['efectoAdverso'],
                "fecha":DatosPintar['fecha'],
                "dependencias":cadenaDependencias,
                "recomendaciones":DatosPintar['Observaciones']
            });
            graphic.setInfoTemplate(infoTemplate);
            Map2.graphics.add(graphic);
            
        //graphicsLayer.add(graphic);
            
    }
    dojo.connect(Map2.graphics, "onClick", function (evt) {
        var g = evt.graphic;
        Map2.infoWindow.setContent(g.getContent());
        Map2.infoWindow.setTitle(g.getTitle());
        Map2.infoWindow.show(evt.screenPoint, Map2.getInfoWindowAnchor(evt.screenPoint));
    });
    
        function showResults(featureSet) {
            //remove all graphics on the maps graphics layer
            //map.graphics.clear();
            var symbolAmarillo =new  esri.symbol.SimpleFillSymbol;					
            symbolAmarillo.setColor(new dojo.Color([238, 210, 0, 0.60]));
            var symbolVerde =new  esri.symbol.SimpleFillSymbol;					
            symbolVerde.setColor(new dojo.Color([0, 100, 0, 0.60]));
            var symbolRojo =new  esri.symbol.SimpleFillSymbol;					
            symbolRojo.setColor(new dojo.Color([102, 0, 0, 0.60]));
            //Performance enhancer - assign featureSet array to a single variable.
            var resultFeatures = featureSet.features;
            //Loop through each feature returned
            for (var i=0, il=resultFeatures.length; i<il; i++) {
                //Get the current feature from the featureSet.
                //Feature is a graphic
                var graphic = resultFeatures[i];
                //graphic.setSymbol(symbolRojo);					  
                for (var n in DatosPintar.DatosPol) {
                    for(var m=0, u=DatosPintar.DatosPol[n]['UbicacionPoligonos'].length; m<u; m++){
                        if((DatosPintar.DatosPol[n]['UbicacionPoligonos'][m]['clavemun']==graphic.attributes["CVE_MUN"]) && (DatosPintar.DatosPol[n]['UbicacionPoligonos'][m]['claveestado']==graphic.attributes["CVE_ENT"])  ){
                            var cadenaDependencias="";
                            for (t=0;t<DatosPintar.DatosPol[n]['DatosGeneralesPol']['dependencias'].length;t++) {
                                cadenaDependencias=cadenaDependencias+DatosPintar.DatosPol[n]['DatosGeneralesPol']['dependencias'][t]+"<br>";
                            }	
                            graphic.setAttributes({"municipio":graphic.attributes["NOM_MUN"],
                                "estado":graphic.attributes["NOM_ENT_"],
                                "efectoAdverso":DatosPintar.DatosPol[n]['DatosGeneralesPol']['efectoAdverso'],
                                "fecha":DatosPintar.DatosPol[n]['DatosGeneralesPol']['fecha'],
                                "dependencias":cadenaDependencias,
                                "recomendaciones":DatosPintar.DatosPol[n]['DatosGeneralesPol']['recomendaciones']});
                            if(DatosPintar.DatosPol[i]['DatosGeneralesPol']['nivel']==1){
                                graphic.setSymbol(symbolRojo);
                                //break;
                            }
                            else if(DatosPintar.DatosPol[i]['DatosGeneralesPol']['nivel']==3){
                                graphic.setSymbol(symbolVerde);
                                //break;
                            }
                            else if(DatosPintar.DatosPol[i]['DatosGeneralesPol']['nivel']==2){
                                graphic.setSymbol(symbolAmarillo);
                                //break;
                            }
                            graphic.setInfoTemplate(infoTemplate);
                            Map2.graphics.add(graphic);
                        }
                    }
                }
                //Add graphic to the map graphics layer.					 
            }
        }
}

    
    
    function createMapTip(paramlayer) {
        var dialog;
        require([
            "esri/lang", "dojo/dom-style",
            "dijit/TooltipDialog", "dijit/popup", "dojo/domReady!"
        ], function (
            esriLang, domStyle,
            TooltipDialog, dijitPopup
        ) {
            dialog = new TooltipDialog({
                //id: "tooltipDialog",
                style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
            });

            
            dialog.startup();
            paramlayer.on("click", function (evt) {
                if (banderaMapTip == false) {
                    var myRand = Math.floor(Math.random() * 2) + 1;
                    if (myRand == 1) {
                        var t = "<b>${name}</b><hr><b></b>${description} <br>";
                    }
                    else {
                        var t = "<b>${name}</b><hr><b></b>${description} <br>";
                    }
                    var content = esriLang.substitute(evt.graphic.attributes, t);
                    dialog.setContent(content);
                    //transparencia
                    domStyle.set(dialog.domNode, "opacity", 0.75);
                    dijitPopup.open({
                        popup: dialog,
                        x: evt.pageX,
                        y: evt.pageY
                    });
                    banderaMapTip = true;
                }
                else {
                    dijitPopup.close(dialog);
                    banderaMapTip = false;
                }
            });
        });
    
    }
    dojo.ready(procesar);
//dojo.addOnLoad(procesar);


//require([
//  "esri/layers/FeatureLayer"
//], function FeatureLayer() {
//    //var featureLay = new esri.layers.FeatureLayer("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Earthquakes/Since_1970/MapServer/0");

//    var featureLay = new FeatureLayer("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Petroleum/KGS_OilGasFields_Kansas/MapServer/0", {
//        mode: FeatureLayer.MODE_ONDEMAND,
//        outFields: ["*"]
//    });
//    this.map.addLayer(featureLay);
//});
////dojo.ready(Layer);