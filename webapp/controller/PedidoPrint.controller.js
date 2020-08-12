sap.ui.define([
	"dma/zcockpit/controller/BaseController",
], function (BaseController) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.PedidoPrint", {
		onInit: function () {
			this.getRouter().getRoute("pedidoprint").attachPatternMatched(this._onMasterMatched, this);
			// $(window).on("resize.DocDisplay", this._setIFrame.bind(this));
		},
		_setIFrame: function () {
			var sEbeln = oEvent.getParameter("arguments").Ebeln;
			var oHtml = this.getView().byId("idFrame");
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/PrnPedido", {
				Ebeln: sEbeln
			});
			localModel.read(sObjectPath + "/$value", {
				method: "GET",
				success: (oData2, oResponse) => {
					var pdfURL = oResponse.requestUri;
					oHtml.setContent("<iframe src=" + pdfURL + "height='" + this._getAvailableHeight() +
						"' width='100%' style='border: none;'></iframe>");
					// this.byId("headerDetail").setNumber(oData2.Qtde);
				},
				error: function (oError) {}
			});

			// oHtml.setContent("<iframe src='https://www.trainning.com.br/download/sap4_basic.pdf' height='700' width='1300'></iframe>");
		},
		_getAvailableHeight: function () {
			// get height from window or dialog whatever the iframe is put in
			var nDialogHeight = $(this._oDialog.getDomRef()).height();
			var iFrameHeight = nDialogHeight - 46;
			return iFrameHeight + "px";
		},
		_onMasterMatched: function (oEvent) {
			var sEbeln = oEvent.getParameter("arguments").Ebeln;
			var oHtml = this.getView().byId("idFrame");
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/PrnPedido", {
				Ebeln: sEbeln
			});
			debugger;
			var sURL = sObjectPath + "/$value";
			window.open(sURL);
			// localModel.read(sObjectPath + "/$value", {
			// 	method: "GET",
			// 	success: (oData2, oResponse) => {
			// 		var pdfURL = oResponse.requestUri;
			// 		oHtml.setContent("<iframe src=" + pdfURL + "height='" + this._getAvailableHeight() +
			// 			"' width='100%' style='border: none;'></iframe>");
			// 		// this.byId("headerDetail").setNumber(oData2.Qtde);
			// 	},
			// 	error: function (oError) {}
			// });

			// oHtml.setContent("<iframe src='https://www.trainning.com.br/download/sap4_basic.pdf' height='700' width='1300'></iframe>");

		}
	});
});