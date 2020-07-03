sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"dma/zcockpit/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (BaseController, JSONModel, formatter, MessageToast, MessageBox, History) {
	"use strict";
	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
	return BaseController.extend("dma.zcockpit.controller.Pedido2", {
		formatter: formatter,
		onInit: function () {
			this.getRouter().getRoute("pedido").attachPatternMatched(this.onObjectMatched, this);
		},
		//		handleSwipe: function(e) {
		//			// register swipe event
		//			var
		//			//oSwipeListItem = e.getParameter("listItem"),    // get swiped list item from event
		//				oSwipeContent = e.getParameter("swipeContent");
		//			// get swiped content from event
		//			oSwipeContent.setText("Delete").setType("Reject");
		//		},
		onObjectMatched: function (oEvent) {
			// var localModel = this.getModel();
			var globalModel = this.getModel("globalModel");

			var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			globalModel.setProperty("/Ekgrp", sEkgrp);
			var sLifnr = oEvent.getParameter("arguments").Lifnr;
			globalModel.setProperty("/Lifnr", sLifnr);

			//var sObjectPath = localModel.createKey("/Fornecedor", {
			//	Ekgrp: sEkgrp,
			//	Lifnr: sLifnr
			//});
			this.updateTotal();
			var tablePedido = this.byId("tablePedido");
			tablePedido.setFixedColumnCount(8);
			//tablePedido.bindItems({
			//	path: sObjectPath + "/PO"
			//	template: tablePedido.getBindingInfo("items").template
			//});
			//tablePedido.getBinding("items").refresh();
		},
		_getDialog: function () {
			// create a fragment with dialog, and pass the selected data
			if (!this.dialog) {
				// This fragment can be instantiated from a controller as follows:
				this.dialog = sap.ui.xmlfragment("idPedCriado", "dma.zcockpit.view.fragment.ped_criado", this);
				//debugger;
			}
			//debugger;
			return this.dialog;
		},
		closeDialog: function () {
			this._getDialog().close();
			this.getRouter().navTo("home", true);
		},
		updateTotal: function () {
			var page = this.byId("fullPage");
			// var cabec = this.byId("headerCabecalho");
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sObjectPath = localModel.createKey("/POSum", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr")
			});

			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					//cabec.setNumber({ path: oData2.Total, formatter: '.format.currencyValue' });
					globalModel.setProperty("/Total", oData2.Total);
					globalModel.setProperty("/Fornecedor", oData2.Mcod1);
					page.setTitle(oData2.Mcod1);
				},
				error: function (oError) {}
			});
		},
		onNavBack: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			//var oHistory = History.getInstance();
			//var sPreviousHash = oHistory.getPreviousHash();
			//if (sPreviousHash !== undefined) {
			//	window.history.go(-1);
			//} else {
			//var sLifnr = oViewModel.getProperty("/lifnr");
			this.getRouter().navTo("busca", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Uname: globalModel.getProperty("/Uname")
			}, true); //}
		},
		onTitleSelectorPress: function (oEvent) {
			var cabec = this.byId("headerCabecalho");
			cabec.setCondensed(!cabec.getCondensed());
		},
		toDetail: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sRow = oEvent.getSource().getAggregation("rows")[oEvent.getParameters().rowIndex];
			var sMatnr = sRow.getAggregation("cells")[0].getTitle();
			globalModel.setProperty("/Matnr", sMatnr);
			this.getRouter().navTo("detail", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr"),
				Matnr: sMatnr,
				Werks: globalModel.getProperty("/Werks")
			}, true);
		},
		onDeletePress: function (oEvent) {
			var oTable = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext().getPath();
			//oTable.attachEventOnce("updateFinished", oTable.focus, oTable);
			var oModel = oTable.getModel();
			oModel.remove(sPath);
			/* update tela */
			// var globalModel = this.getModel("globalModel");
			// var localModel = this.getModel();
			// var sObjectPath = localModel.createKey("/Fornecedor", {
			// 	Ekgrp: oItem.getBindingContext().getProperty("Ekgrp"),
			// 	Lifnr: oItem.getBindingContext().getProperty("Lifnr")
			// });
			this.updateTotal();
		},
		onResetPedido: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var tablePedido = this.byId("tablePedido");
			var sObjectPath = localModel.createKey("/Fornecedor", {
				Werks: globalModel.getProperty("/Werks"),
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr")
			});
			localModel.read(sObjectPath + "/POReset", {
				method: "GET",
				success: function (oData2, oResponse) {
					this.updateTotal();
					localModel.setRefreshAfterChange(true);
					tablePedido.getBinding("items").refresh();
				},
				error: function (oError) {}
			});
		},
		onCriaPedido: function (oEvent) {
			var oView = this.getView();
			oView.setBusy(true);
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/POCria", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr"),
				TpPedido: globalModel.getProperty("/TpPedido"),
				DtRemessa: globalModel.getProperty("/DtRemessa")
			});
			var that = this;
			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					oView.setBusy(false);
					var pEbeln = oData2.Ebeln;
					if (pEbeln !== "0") {
						sap.m.MessageBox.success("Número de pedidos criados: " + oData2.Ebeln.toString() + "\n" +
							"Os números de pedido nos detalhes", {
								title: "Pedido Criado com sucesso",
								onClose: that.getRouter().navTo("busca", {
									Ekgrp: globalModel.getProperty("/Ekgrp"),
									Uname: globalModel.getProperty("/Uname")
								}, true),
								details: oData2.Mensagem,
								actions: [MessageBox.Action.OK],
								initialFocus: MessageBox.Action.OK,
								styleClass: sResponsivePaddingClasses
							});
					} else {
						sap.m.MessageBox.error("Erro na criação do Pedido.\n" +
							"Erros nos detalhes.", {
								title: "Pedido não Criado. ",
								actions: [MessageBox.Action.OK],
								initialFocus: MessageBox.Action.OK,
								details: oData2.Mensagem,
								styleClass: sResponsivePaddingClasses
							});
					}
				},
				error: function (oError) {
					oView.setBusy(false);
					sap.m.MessageBox.error("Erro", {
						title: "Pedido não Criado",
						initialFocus: null,
						styleClass: sResponsivePaddingClasses
					});
				}
			});
		}
	});
});