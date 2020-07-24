sap.ui.define([
	"dma/zcockpit/controller/BaseController",
], function (BaseController) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.PedidoPrint", {
		onInit: function () {
			this.getRouter().getRoute("pedidoprint").attachPatternMatched(this._onMasterMatched, this);
		},
		_onMasterMatched: function (oEvent) {
			var sEbeln = oEvent.getParameter("arguments").Ebeln;
			var oHtml = this.getView().byId("idFrame");
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/PedidoPrint", {
				Ebeln: sEbeln
			});
			localModel.read(sObjectPath, {
				method: "GET",
				success: (oData2, oResponse) => {
					var pdfURL = oResponse.requestUri;
					oHtml.setContent("<iframe src=" + pdfURL + " width='700' height='700'></iframe>");
					// this.byId("headerDetail").setNumber(oData2.Qtde);
				},
				error: function (oError) {}
			});

			// oHtml.setContent("<iframe src='https://www.trainning.com.br/download/sap4_basic.pdf' height='700' width='1300'></iframe>");

		}
	});
});