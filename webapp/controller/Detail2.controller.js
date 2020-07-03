sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"dma/zcockpit/model/formatter",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, History, MessageBox) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.Detail2", {
		formatter: formatter,
		onInit: function () {
			//var oViewModel = new JSONModel({ busy: false, delay: 0 });
			//var globalModel = this.getModel("globalModel");
			//this.setModel(oViewModel, "detailView");
			this.getRouter().getRoute("detail2").attachPatternMatched(this.onObjectMatched, this); //this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoaded.bind(this));
		},
		onObjectMatched: function (oEvent) {
			//var oViewModel = this.getModel("detailView");
			var globalModel = this.getModel("globalModel");
			var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			globalModel.setProperty("/Ekgrp", sEkgrp);
			var sLifnr = oEvent.getParameter("arguments").Lifnr;
			globalModel.setProperty("/Lifnr", sLifnr);
			var sMatnr = oEvent.getParameter("arguments").Matnr;
			globalModel.setProperty("/Matnr", sMatnr);
			var sObjectPath = this.getModel().createKey("/PO", {
				Ekgrp: sEkgrp,
				Lifnr: sLifnr,
				Matnr: sMatnr
			});
			var sHeader = this.byId("headerDetail");
			sHeader.bindElement(sObjectPath);
			var tableCompras = this.byId("compraTable");
			tableCompras.bindItems({
				path: sObjectPath + "/POCompra",
				template: tableCompras.getBindingInfo("items").template
			});
			var tableVendas = this.byId("vendaTable");
			tableVendas.bindItems({
				path: sObjectPath + "/POVenda",
				template: tableVendas.getBindingInfo("items").template
			});
			var tableHistorico = this.byId("historicoTable");
			tableHistorico.bindItems({
				path: sObjectPath + "/POHistorico",
				template: tableHistorico.getBindingInfo("items").template
			});
			var tableFaceamento = this.byId("faceamentoTable");
			tableFaceamento.bindItems({
				path: sObjectPath + "/POFaceamento",
				template: tableFaceamento.getBindingInfo("items").template
			});
			globalModel.setProperty("/Alterado", false);
			this.byId("botaoGravarSugestao").setEnabled(false);
			this.updateTotalTelaLocal();
		},
		//bindView: function(sObjectPath) {
		// Set busy indicator during view binding
		// var oViewModel = this.getModel("detailView");
		// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
		//oViewModel.setProperty("/busy", true);
		// this.getView().bindElement({
		// 	path: sObjectPath,
		// 	events: {
		// 		change: this.onBindingChange.bind(this),
		// 		dataRequested: function() {
		// 			oViewModel.setProperty("/busy", true);
		// 		},
		// 		dataReceived: function() {
		// 			oViewModel.setProperty("/busy", false);
		// 		}
		// 	}
		// });
		//},
		//onBindingChange: function() {
		//var oView = this.getView(),
		//	oElementBinding = oView.getElementBinding();
		// No data for the binding
		//if (!oElementBinding.getBoundContext()) {
		//	this.getRouter().getTargets().display("detailObjectNotFound");
		//	// if object could not be found, the selection in the master list
		//	// does not make sense anymore.
		//	this.getOwnerComponent().oListSelector.clearMasterListSelection();
		//	return;
		//}
		//var sPath = oElementBinding.getPath(),
		//oResourceBundle = this.getResourceBundle(),
		//oObject = oView.getModel().getObject(sPath),
		//sMatnr = oObject.Matnr,
		//sObjectName = oObject.Maktx,
		//oViewModel = this.getModel("detailView");
		//this.getOwnerComponent().oListSelector.selectAListItem(sPath);
		// oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sMatnr]));
		// oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
		// 	sObjectName,
		// 	sMatnr,
		// 	location.href
		// ]));
		//},
		//onMetadataLoaded: function() {
		// Store original busy indicator delay for the detail view
		//var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
		//var	oViewModel = this.getModel("detailView");
		//var globalModel = this.getModel("globalModel");
		//oLineItemTable = this.byId("lineItemsList"),
		//iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
		// Make sure busy indicator is displayed immediately when
		// detail view is displayed for the first time
		//globalModel.setProperty("/delay", 0);
		//globalModel.setProperty("/lineItemTableDelay", 0);
		/* oLineItemTable.attachEventOnce("updateFinished", function() {
										// Restore original busy indicator delay for line item table
										oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
									}); */
		// Binding the view will set it to not busy - so the view is always busy if it is not bound
		//oViewModel.setProperty("/busy", true);
		// Restore original busy indicator delay for the detail view
		//oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		//},
		_onLiveChangeInput: function (oEvent) {
			var actualValue = oEvent.getParameter("value");
			var lastValue = oEvent.getSource()._lastValue;
			if (actualValue < 0) {
				actualValue = "0";
				oEvent.getSource().setValue(0);
			}
			if (actualValue !== lastValue) {
				var globalModel = this.getModel("globalModel");
				this.byId("botaoGravarSugestao").setEnabled(true);
				globalModel.setProperty("/Alterado", true);
			}
			this.updateTotalTelaLocal();
		},
		_onSavePress: function (oEvent) {
			var scompraTable = this.byId("compraTable");
			var oModel = scompraTable.getModel();
			var that = this;
			// faz o update na tabela via oData-PUT
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var payLoad = {};
			payLoad.Ekgrp = oEvent.getSource().getBindingContext().getProperty("Ekgrp");
			payLoad.Lifnr = oEvent.getSource().getBindingContext().getProperty("Lifnr");
			payLoad.Matnr = oEvent.getSource().getBindingContext().getProperty("Matnr");
			payLoad.Werks = oEvent.getSource().getBindingContext().getProperty("Werks");
			payLoad.Requisicao = oEvent.getSource().getParent().getAggregation("cells")[18].getProperty("value");
			oModel.update(sPath, payLoad, {
				success: function (oData, oResponse) {
					//sap.m.MessageToast.show(" updated Successfully");
					that.updateTotalTela();
				},
				error: function (oError) {
					//sap.m.MessageToast.show("  failure");
				}
			}); // apaga o refresh desse item
			//oEvent.getSource().getParent().getAggregation("cells")[19].setVisible(false);
		},
		_onGoToPedido: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sLifnr = globalModel.getProperty("/Lifnr");
			this.getRouter().navTo("pedido", {
				Ekgrp: sEkgrp,
				Lifnr: sLifnr
			}, true);
		},
		onNavBack: function (oEvent) {
			//var oViewModel = this.getModel("detailView");
			var globalModel = this.getModel("globalModel");
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sLifnr = globalModel.getProperty("/Lifnr");
			var that = this;
			var sAlterado = globalModel.getProperty("/Alterado");
			if (sAlterado) {
				MessageBox.confirm("A sugest\xE3o de compras foi alterada. \n " + "Deseja gravar as altera\xE7\xF5es?", {
					title: "Altera\xE7\xF5es",
					actions: [
						MessageBox.Action.OK,
						MessageBox.Action.CANCEL
					],
					emphasizedAction: MessageBox.Action.OK,
					initialFocus: MessageBox.Action.OK,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							// Pergunta se deseja gravar
							that.gravaValores(oEvent);
						}
						that.getRouter().navTo("pedido", {
							Ekgrp: sEkgrp,
							Lifnr: sLifnr
						}, true);
					}
				});
			} else {
				this.getRouter().navTo("pedido", {
					Ekgrp: sEkgrp,
					Lifnr: sLifnr
				}, true);
			}
		},
		gravaValores: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sAlterado = globalModel.getProperty("/Alterado");
			if (sAlterado) {
				var qtdeTotal = 0,
					qtdeItem = 0;
				var scompraTable = this.byId("compraTable");
				var oModel = scompraTable.getModel();
				var mParameters = {
					groupId: "dma1",
					success: function (odata, resp) {
						oModel.updateBindings(true);
					},
					error: function (odata, resp) {
						sap.m.MessageToast.show("error function");
					}
				};
				oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				oModel.setUseBatch(true);
				for (var i = 0; i < scompraTable.getItems().length; i++) {
					qtdeItem = scompraTable.getItems()[i].getAggregation("cells")[18].getProperty("value");
					if (qtdeItem > 0) {
						qtdeTotal += parseInt(qtdeItem, 10);
						var sPath = scompraTable.getItems()[i].getBindingContext().sPath;
						var payLoad = {};
						payLoad.Ekgrp = scompraTable.getItems()[i].getBindingContext().getProperty("Ekgrp");
						payLoad.Lifnr = scompraTable.getItems()[i].getBindingContext().getProperty("Lifnr");
						payLoad.Matnr = scompraTable.getItems()[i].getBindingContext().getProperty("Matnr");
						payLoad.Werks = scompraTable.getItems()[i].getBindingContext().getProperty("Werks");
						payLoad.Requisicao = scompraTable.getItems()[i].getAggregation("cells")[18].getProperty("value");
						oModel.update(sPath, payLoad, mParameters);
					}
				}
				oModel.submitChanges(mParameters);
				this.byId("headerDetail").setNumber(qtdeTotal);
				globalModel.setProperty("/Alterado", false);
				this.byId("botaoGravarSugestao").setEnabled(false);
			}
		},
		reiniciaValores: function () {
			var scompraTable = this.byId("compraTable");
			var sObjectPath = scompraTable.getBindingInfo("items").path;
			scompraTable.bindItems({
				path: sObjectPath,
				template: scompraTable.getBindingInfo("items").template
			});
		},
		updateTotalTela: function () {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sObjectPath = localModel.createKey("/POItemsSum", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr"),
				Matnr: globalModel.getProperty("/Matnr")
			});
			var that = this;
			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					that.byId("headerDetail").setNumber(oData2.Qtde);
				},
				error: function (oError) {}
			});
		},
		updateTotalTelaLocal: function () {
			var qtdeTotal = 0;
			var valorItem = 0;
			var scompraTable = this.byId("compraTable");
			for (var i = 0; i < scompraTable.getItems().length; i++) {
				valorItem = scompraTable.getItems()[i].getAggregation("cells")[18].getProperty("value");
				if (valorItem > 0) {
					qtdeTotal += parseInt(valorItem, 10);
				}
			}
			this.byId("headerDetail").setNumber(qtdeTotal);
		},
		onTitleSelectorPress: function (oEvent) {
			var cabec = this.byId("headerDetail");
			cabec.setCondensed(!cabec.getCondensed());
		},
		onFilterPress: function (oEvent) {
			var aFilters = [];
			var orArray = [];
			var pushAC = this.byId("_filterBtn_AC");
			if (pushAC.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "AC"));
			}
			var pushBA = this.byId("_filterBtn_BA");
			if (pushBA.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "BA"));
			}
			var pushES = this.byId("_filterBtn_ES");
			if (pushES.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "ES"));
			}
			var pushMA = this.byId("_filterBtn_MA");
			if (pushMA.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "MA"));
			}
			var pushMG = this.byId("_filterBtn_MG");
			if (pushMG.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "MG"));
			}
			var pushPE = this.byId("_filterBtn_PE");
			if (pushPE.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "PE"));
			}
			var pushRN = this.byId("_filterBtn_RN");
			if (pushRN.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "RN"));
			}
			var pushRO = this.byId("_filterBtn_RO");
			if (pushRO.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "RO"));
			}
			var pushSP = this.byId("_filterBtn_SP");
			if (pushSP.getPressed()) {
				orArray.push(new sap.ui.model.Filter("UF", sap.ui.model.FilterOperator.EQ, "SP"));
			}
			var orFilter = new sap.ui.model.Filter({
				filters: orArray,
				and: false
			});
			aFilters.push(orFilter);
			var tableCompras = this.byId("compraTable");
			tableCompras.getBinding("items").filter(aFilters);
		},
		compraUpdateFinished: function (oEvent) {
			this.updateTotalTela();
		}
	});
});