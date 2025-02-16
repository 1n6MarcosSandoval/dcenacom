﻿<!DOCTYPE html>
<html>
	<head>
		<title></title>	<!-- Define the versions of IE that will be used to render the page. See Microsoft documentation for details. Optional. -->
    	<link rel="shortcut icon" style="width:20px;height:20px" href="images/LogoCH.png" />	
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta charset="utf-8">
		<!-- Responsive -->
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="default">
		<!-- End Responsive -->
		<!-- Use protocol relative urls that way if the browser is viewing the page via HTTPS the js/css file will be requested using the HTTPS protocol -->
		<link rel="stylesheet" href="//js.arcgis.com/3.10/js/esri/css/calcite/calcite.css">

		<link rel="stylesheet"  href="//js.arcgis.com/3.10/js/esri/css/esri.css">
		<!-- Load any application specific styles -->
		<link rel="stylesheet" href="css/styles.css">
		<!--[if IE 8]>
			<link rel="stylesheet" href="css/ie.css">
		<![endif]-->
		<!--Actualizar cada n tiempo 10000 = 10 segundos-->
		<script>setTimeout('document.location.reload()',900000); </script>
	</head>
	<body class="calcite app-loading no-touch">
		<!-- Loading Indicator -->
		<div class="loading-indicator">
			<div class="loading-message" id="loading_message"></div>
		</div>

		<!-- Map -->
		<!-- The ArcGIS API for JavaScript provides bidirectional support.  When viewing the application in an right to left (rtl) language like Hebrew and Arabic the map needs to remain in left-to-right (ltr) mode. Specify this by setting the dir attribute on the div to ltr. -->
		<div id="mapDiv" dir="ltr"></div>

		<!-- Panel Content -->
		<div id="panelContent">
			<div id="panelPages"></div>
		</div>

		<!-- Panel Top -->
		<div id="panelTop" class="bg rounded shadow">
			<!-- Panel Title -->
			<div id="panelTitle">
				<div class="fc" id="panelText">
					
				</div>
				<div id="panelSearch">
					<div id="panelGeocoder"></div>
				</div>
				<div id="panelMenu" class="icon-menu icon-color"></div>
			</div>

			<!-- Panel Tools -->
			<div id="panelTools" >
				<!--Tools are created programatically-->
			</div>

		</div>

		<script type="text/javascript">
		    var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
		    var dojoConfig = {
		        // The locationPath logic below may look confusing but all its doing is
		        // enabling us to load the api from a CDN and load local modules from the correct location.
		        packages: [{
		            name: "application",
		            location: package_path + '/js'
		        }, {
		            name: "config",
		            location: package_path + '/config'
		        }]
		    };
		</script>
		
		<script type="text/javascript" src="http://js.arcgis.com/3.11/"></script>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
		<script type="text/javascript">
		    require(["application/template", "application/main"], function (Template, Main) {
		        // create the template. This will take care of all the logic required for template applications
		        var myTemplate = new Template();
		        var myApp = new Main();
		        myTemplate.startup().then(function (config) {
		            myApp.startup(config);
		        }, function (error) {
		            // something went wrong. Let's report it.
		            myApp.reportError(error);
		        });
		    });
		</script>
	</body>
</html>
