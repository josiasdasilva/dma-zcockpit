/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"dma/zcockpit/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"dma/zcockpit/test/integration/pages/View1",
	"dma/zcockpit/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "dma.zcockpit.view.",
		autoWait: true
	});
});