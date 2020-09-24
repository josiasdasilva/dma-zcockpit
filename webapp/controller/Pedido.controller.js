sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"dma/zcockpit/model/formatter",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/ButtonType",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, MessageToast, Dialog, DialogType, ButtonType, MessageBox, History, Sorter, Filter,
	FilterOperator) {
	"use strict";
	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
	return BaseController.extend("dma.zcockpit.controller.Pedido", {
		_oTablePedidoHeader: null,
		_segVenda: null,
		_segPedido: null,
		_oTablePedido: null,
		formatter: formatter,
		onInit: function () {
			this.getRouter().getRoute("pedido").attachPatternMatched(this.onObjectMatched, this);

			this._oTablePedidoHeader = this.getView().byId("tablePedidoHeader");
			this._oTablePedido = this.getView().byId("tablePedido");
			this._segVenda = this.getView().byId("_segVenda");
			this._segPedido = this.getView().byId("_segPedido");

			//FAFN - Begin
			if (!this._oColumnFilterPopover) {
				this._oColumnFilterPopover = sap.ui.xmlfragment("dma.zcockpit.view.fragment.FilterColumn", this);
				this._oColumnFilterPopover.setModel(this.getView().getModel());
			}
			this._oTablePedidoHeader.addEventDelegate({
				onAfterRendering: () => {
					var oHeader = this._oTablePedidoHeader.$().find('.sapMListTblHeaderCell');
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						this.onClickColumnHeader(oID);
					}
				}
			}, this._oTablePedidoHeader);
			//FAFN - End
			this.getView().byId("_i_pedido_0").setColor("#f00000");
		},
		//FAFN - Begin
		onClickColumnHeader: function (oID) {
			let sID = oID;
			$('#' + oID).click((oEvent) => { //Attach Table Header Element Event
				let sBinding = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[0].id).data('binding');
				// let bfilter = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].id).data('filter') === "true";
				// sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({showFilter: bfilter }),"columnFilter");
				// this._oColumnFilterPopover.bindingValue = sBinding; //Save the key value to property
				// this._oColumnFilterPopover.showFilter = bfilter; //Save the key value to property
				// this._oColumnFilterPopover.openBy(oEvent.currentTarget);
				this.onClickOrder(oEvent, this._oTablePedido, sBinding);
			});
		},
		_getDialogLojaSum: function () {
			if (!this._oDialogLojaSum) {

				this._oDialogLojaSum = sap.ui.xmlfragment("idLojasSum", "dma.zcockpit.view.fragment.lojasSum", this);
				this.getView().addDependent(this._oDialogLojaSum);
			}
			return this._oDialogLojaSum;
		},
		closeLojaSumDialog: function () {
			this._oDialogLojaSum.close();
		},
		onOpenDialogLojaSum: function () {
			let aFilters = [];
			this._getDialogLojaSum().open();
			var globalModel = this.getModel("globalModel");
			let sEkgrp = globalModel.getProperty("/Ekgrp");
			let sLifnr = globalModel.getProperty("/Lifnr");
			aFilters.push(new sap.ui.model.Filter(
				"Ekgrp",
				sap.ui.model.FilterOperator.EQ,
				sEkgrp
			));
			aFilters.push(new sap.ui.model.Filter(
				"Lifnr",
				sap.ui.model.FilterOperator.EQ,
				sLifnr
			));
			var oTable = sap.ui.getCore().byId('idLojasSum--idLojaSumTabela');
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters);
		},
		onDeleteLojaSum: function (oEvent) {
			debugger;
			let sPath = oEvent.getParameter("listItem").getBindingContextPath();
			let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getView().getModel().remove(sPath, {
				success: (res) => {
					MessageToast.show(oBundle.getText("msg_loja_removida_success"), {});
				},
				error: (err) => {
					MessageToast.show(oBundle.getText("msg_loja_removida_error"), {});
				}
			});

		},
		recoverSortConfig: function () {
			let oConfigSort = localStorage.getItem('sortConfig') ? JSON.parse(localStorage.getItem('sortConfig')) : null;
			let oItems = this._oTablePedido.getBinding("items");

			if (oConfigSort) {
				let oIcon = sap.ui.getCore().byId(oConfigSort.sId);
				if (oIcon) {
					oIcon.setColor("#f00000");
					oIcon.setSrc(oConfigSort.isAsc ? "sap-icon://sort-ascending" : "sap-icon://sort-descending");
					let oSorter = new Sorter(oConfigSort.field);
					oSorter.bDescending = !oConfigSort.isAsc;
					oItems.sort(oSorter, !oConfigSort.isAsc);
				}
			}

		},
		setSortConfig: function (sField, bIsAsc, sId) {
			let oConfigSort = localStorage.getItem('sortConfig') ? JSON.parse(localStorage.getItem('sortConfig')) : null;
			/*			let oConfigSort = aConfigSort.find((item) => {
							return item.field === sField;
						})*/
			/*			if (oConfigSort) {
							oConfigSort.isAsc = bIsAsc;
						} else {*/
			oConfigSort = {
				field: sField,
				isAsc: bIsAsc,
				sId: sId
			};
			localStorage.setItem('sortConfig', JSON.stringify(oConfigSort));
			//}

		},
		onClickOrder: function (oEvent, oTable, oBinding) {
			let oIcon = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id);
			let sId = oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id;
			let oItems = oTable.getBinding("items");
			let oSorter = new Sorter(oBinding);
			let oColor = oIcon.getColor();
			let oSrc = oIcon.getSrc();

			this.reiniciaIconesSort(false);
			if (oColor === "#808080") {
				oIcon.setColor("#f00000");
				oIcon.setSrc("sap-icon://sort-ascending");
				oItems.sort(oSorter);
				this.setSortConfig(oBinding, true, sId);
			} else {
				if (oSrc === "sap-icon://sort-ascending") {
					oIcon.setColor("#f00000");
					oIcon.setSrc("sap-icon://sort-descending");
					oSorter.bDescending = true;
					oItems.sort(oSorter, true);
					this.setSortConfig(oBinding, false, sId);
				} else {
					this.reiniciaIconesSort(true);
					let oSortInitial = new Sorter("Matnr");
					oItems.sort(oSortInitial);
					this.setSortConfig("Matnr", true, sId);
				}
			}
		},
		onFilterPress: function (oEvent) {
			var aFilters = [];
			var iMatnr = this.byId("_input_filter_matnr");
			var iMaktx = this.byId("_input_filter_maktx");
			if (oEvent.getParameters("pressed").pressed) {
				if (iMatnr.getValue() !== "") {
					var fMatnr = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, iMatnr.getValue().toUpperCase());
					aFilters.push(fMatnr);
				}

				if (iMaktx.getValue() !== "") {
					var fMaktx = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, iMaktx.getValue().toUpperCase());
					aFilters.push(fMaktx);
				}
			} else {
				iMatnr.setValue("");
				iMaktx.setValue("");
			}
			var oItems = this._oTablePedido.getBinding("items");
			oItems.filter(aFilters);
		},
		reiniciaIconesSort: function (oFirst) {
			var oQtde = 19; //this._oTablePedido.getAggregation("columns").length;
			for (var i = 0; i < oQtde; i++) {
				let zIcon = this.byId("_i_pedido_" + i.toString());
				zIcon.setColor("#808080");
				zIcon.setSrc("sap-icon://sort-ascending");
			}
			if (oFirst) {
				let zIcon = this.byId("_i_pedido_0");
				zIcon.setColor("#f00000");
				zIcon.setSrc("sap-icon://sort-ascending");
			}
		},
		// onChangeFilterColumn: function (oEvent) {
		// 	var oValue = oEvent.getParameter("value");
		// 	var oMultipleValues = oValue.split(",");
		// 	var aFilters = [];
		// 	for (var i = 0; i < oMultipleValues.length; i++) {
		// 		var oFilter = new Filter(this._oColumnFilterPopover.bindingValue, "Contains", oMultipleValues[i]);
		// 		aFilters.push(oFilter)
		// 	}
		// 	var oItems = this._oTablePedido.getBinding("items");
		// 	oItems.filter(aFilters, "Application");
		// 	this._oColumnFilterPopover.close();
		// },

		// onAscending: function () {
		// 	var oItems = this._oTablePedido.getBinding("items");
		// 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);
		// 	oItems.sort(oSorter);
		// 	this._oColumnFilterPopover.close();
		// },
		// onDescending: function () {
		// 	var oItems = this._oTablePedido.getBinding("items");
		// 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);
		// 	oSorter.bDescending = true;
		// 	oItems.sort(oSorter, true);
		// 	this._oColumnFilterPopover.close();
		// }, //FAFN - End 	
		//		handleSwipe: function(e) {
		//			// register swipe event
		//			var
		//			//oSwipeListItem = e.getParameter("listItem"),    // get swiped list item from event
		//				oSwipeContent = e.getParameter("swipeContent");
		//			// get swiped content from event
		//			oSwipeContent.setText("Delete").setType("Reject");
		//		},
		onObjectMatched: function (oEvent) {
			var localModel = this.getModel();
			var globalModel = this.getModel("globalModel");

			globalModel.setProperty("/colVlrPedido", this._segPedido.getProperty("selectedKey") === "real");

			var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			globalModel.setProperty("/Ekgrp", sEkgrp);
			var sLifnr = oEvent.getParameter("arguments").Lifnr;
			globalModel.setProperty("/Lifnr", sLifnr);

			var sObjectPath = localModel.createKey("/Fornecedor", {
				Ekgrp: sEkgrp,
				Lifnr: sLifnr
			});
			this.updateTotal();
			var tablePedido = this.byId("tablePedido");
			tablePedido.bindItems({
				path: sObjectPath + "/PO",
				template: tablePedido.getBindingInfo("items").template
			});
			tablePedido.getBinding("items").refresh();
			// this.reiniciaIconesSort();
			this.recoverSortConfig();
		},
		_getDialog: function () {
			// create a fragment with dialog, and pass the selected data
			if (!this.dialog) {
				// This fragment can be instantiated from a controller as follows:
				this.dialog = sap.ui.xmlfragment("idPedCriado", "dma.zcockpit.view.fragment.ped_criado", this);
			}
			return this.dialog;
		},
		closeDialog: function () {
			this._getDialog().close();
			this.getRouter().navTo("home", true);
		},
		updateTotal: function () {
			var page = this.byId("fullPage");
			var cabec = this.byId("headerCabecalho");
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
				},
				error: function (oError) {}
			});
		},
		onNavBack: function (oEvent) {
			var globalModel = this.getModel("globalModel");

			MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("sairPedido"), {
				title: this.getView().getModel("i18n").getResourceBundle().getText("sairPedidoTitulo"),
				actions: [
					MessageBox.Action.YES,
					MessageBox.Action.NO
				],
				emphasizedAction: MessageBox.Action.YES,
				initialFocus: MessageBox.Action.YES,
				onClose: (oAction) => {
					if (oAction === MessageBox.Action.YES) {
						this.getRouter().navTo("busca", {
							Ekgrp: globalModel.getProperty("/Ekgrp"),
							Uname: globalModel.getProperty("/Uname"),
							Lifnr: ""
						}, true);
					}
				}
			});
		},
		onTitleSelectorPress: function (oEvent) {
			var cabec = this.byId("headerCabecalho");
			cabec.setCondensed(!cabec.getCondensed());
		},
		toDetail: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sMatnr = oEvent.getSource().getAggregation("cells")[0].getTitle();
			globalModel.setProperty("/Matnr", sMatnr);
			var sMaabc = oEvent.getSource().getAggregation("cells")[19].getText();
			globalModel.setProperty("/codABC", sMaabc);
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
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sObjectPath = localModel.createKey("/Fornecedor", {
				Ekgrp: oItem.getBindingContext().getProperty("Ekgrp"),
				Lifnr: oItem.getBindingContext().getProperty("Lifnr")
			});
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
		onSelValorPedido: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			globalModel.setProperty("/colVlrPedido", this._segPedido.getProperty("selectedKey") === "real");
			//this._VendaMM
		},
		onCriaPedido: function (oEvent) {
			var oView = this.getView();
			sap.ui.core.BusyIndicator.show();
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var dt_remessa = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYYMMdd"
			}).format(globalModel.getProperty("/DtRemessa"));

			var sObjectPath = localModel.createKey("/POCria", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Lifnr: globalModel.getProperty("/Lifnr"),
				TpPedido: globalModel.getProperty("/TpPedido"),
				DtRemessa: dt_remessa
			});
			var that = this;
			localModel.read(sObjectPath, {
				method: "GET",
				success: (oData2, oResponse) => {
					sap.ui.core.BusyIndicator.hide();
					if (oData2.Nroseq > 0) {
						this.dialogoCriaPedido(oData2, oData2.Nroseq);
						// sap.m.MessageBox.success("Número de pedidos criados: " + oData2.Ebeln.toString() + "\n" +
						// 	oData2.Mensagem, {
						// 		title: "Pedido Criado com sucesso",
						// 		onClose: that.getRouter().navTo("busca", {
						// 			Ekgrp: globalModel.getProperty("/Ekgrp"),
						// 			Uname: globalModel.getProperty("/Uname"),
						// 			Lifnr: ""
						// 		}, true),
						// 		//details: oData2.Mensagem,
						// 		actions: [MessageBox.Action.OK],
						// 		initialFocus: MessageBox.Action.OK,
						// 		styleClass: sResponsivePaddingClasses
						// 	});
					} else {
						sap.m.MessageBox.error("Erro na criação do Pedido.\n" +
							oData2.Mensagem, {
								title: "Pedido não Criado. ",
								actions: [MessageBox.Action.OK],
								initialFocus: MessageBox.Action.OK,
								//details: oData2.Mensagem,
								styleClass: sResponsivePaddingClasses
							});
					}
				},
				error: (oError) => {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.error("Erro", {
						title: "Pedido não Criado",
						initialFocus: null,
						styleClass: sResponsivePaddingClasses
					});
				}
			});
		},
		/* Diálogo Pedidos Criados */
		dialogoCriaPedido: function (oData2, pNroSeq) {
			var aFilters = [];
			if (!this._PedCriadoDialog) {
				this._PedCriadoDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.ped_criado", this);
				this.getView().addDependent(this._PedCriadoDialog);
			}
			aFilters.push(new sap.ui.model.Filter(
				"Nroseq",
				sap.ui.model.FilterOperator.EQ,
				pNroSeq
			));
			this._PedCriadoDialog.getContent()[0].getBinding("items").filter(aFilters);
			this._PedCriadoDialog.open();
		},
		_handlePedCriadoPrint: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();

			var tbl_items = this._PedCriadoDialog.getContent()[0].getItems();
			var sEbeln = "";
			for (var i = 0; i < tbl_items.length; i++) {
				if (i !== 0) {
					sEbeln = sEbeln + ",";
				}
				sEbeln = sEbeln + tbl_items[i].getAggregation('cells')[0].getProperty('text');
			}
			var sObjectPath = localModel.createKey("/PrnPedido", {
				Ebeln: sEbeln
			});
			var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
			window.open(sURL, '_blank');
		},
		_handlePedCriadoEmail: function (oEvent) {},
		_handlePedCriadoClose: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			this.getRouter().navTo("busca", {
				Ekgrp: globalModel.getProperty("/Ekgrp"),
				Uname: globalModel.getProperty("/Uname"),
				Lifnr: ""
			})
		},
		toPrint: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sLifnr = globalModel.getProperty("/Lifnr");

			MessageBox.confirm("Deseja imprimir o espelho do pedido?", {
				title: "Espelho do Pedido",
				actions: [
					"Analítico",
					"Sintético",
					MessageBox.Action.CANCEL
				],
				emphasizedAction: "Analítico",
				initialFocus: "Analítico",
				onClose: (oAction) => {
					if (oAction === "Analítico") {
						var sObjectPath = localModel.createKey("/PrnMateriaisLojas", {
							Ekgrp: sEkgrp,
							Lifnr: sLifnr
						});
						var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
						window.open(sURL, '_blank');
					}
					if (oAction === "Sintético") {
						var sObjectPath = localModel.createKey("/PrnMaterial", {
							Ekgrp: sEkgrp,
							Lifnr: sLifnr
						});
						var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
						window.open(sURL, '_blank');
					}
				}
			});
		}
	});
});