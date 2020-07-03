sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/util/MockServer'
], function(Controller, ODataModel, MockServer) {
	"use strict";

	return Controller.extend("dma.zcockpit.view.controller.TesteTable", {

		onInit: function () {
			// var oModel, oView;
			// var oMockServer = new MockServer({
			// 	rootUri: "sapuicompsmarttable3/"
			// });
			// this._oMockServer = oMockServer;
			// oMockServer.simulate("test-resources/sap/ui/comp/demokit/sample/smarttable/mockserver/metadata.xml", "test-resources/sap/ui/comp/demokit/sample/smarttable/mockserver/");
			// oMockServer.start();
			// oModel = new ODataModel("sapuicompsmarttable3", {
			// 	defaultCountMode: "Inline"
			// });
			// oView = this.getView();
			// oView.setModel(oModel);
		},
		onBeforeExport: function (oEvt) {
			// var mExcelSettings = oEvt.getParameter("exportSettings");

			// // Disable Worker as Mockserver is used in Demokit sample
			// mExcelSettings.worker = false;
		},
		onExit: function () {
			//this._oMockServer.stop();
		}
	});

});