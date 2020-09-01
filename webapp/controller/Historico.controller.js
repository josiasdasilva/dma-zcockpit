sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"dma/zcockpit/model/formatter",
	'sap/m/Token',
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, formatter, Fragment, Sorter, Token, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.Historico", {
		formatter: formatter,
		_histPedidoTable: null,
		onInit: function () {
			this._histPedidoTable = this.getView().byId("tableHistPedido");
			this.getRouter().getRoute("historico").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);

			this._histPedidoTable.addEventDelegate({
				onAfterRendering: () => {
					var oHeader = this._histPedidoTable.$().find('.sapMListTblHeaderCell');
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						this.onClickColumnHeader(oID, this._histPedidoTable);
					}
				}
			}, this._histPedidoTable);
		},
		_onMasterMatched: function (oEvent) {
			var aFilters = [];
			var globalModel = this.getModel("globalModel");
			var oHistPedido = this._histPedidoTable.getBinding("items");

			var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			var sNome = oEvent.getParameter("arguments").Nome;
			if (sEkgrp !== "") {
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp);
				aFilters.push(fEkgrp);
				oHistPedido.filter(aFilters);
				// grava valor default
				this.byId("compradorInput").setDescription(sNome);
				this.byId("compradorInput").setValue(sEkgrp);
			}
			this.resetSortIcons(this._histPedidoTable, true);
		},
		onClickColumnHeader: function (oID, oTable) {
			let sID = oID;
			let oTabela = oTable;
			$('#' + oID).click((oEvent) => { //Attach Table Header Element Event
				let sBinding = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[0].id).data('binding');
				this.onClickSort(oEvent, oTable, sBinding);
			});
		},
		onClickSort: function (oEvent, oTable, oBinding) {
			let oIcon = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id);
			let oItems = oTable.getBinding("items");
			let oSorter = new Sorter(oBinding);
			let oColor = oIcon.getColor();
			let oSrc = oIcon.getSrc();

			this.resetSortIcons(oTable, false);
			if (oColor === "#808080") {
				oIcon.setColor("#f00000");
				oIcon.setSrc("sap-icon://sort-ascending");
				oItems.sort(oSorter);
			} else {
				if (oSrc === "sap-icon://sort-ascending") {
					oIcon.setColor("#f00000");
					oIcon.setSrc("sap-icon://sort-descending");
					oSorter.bDescending = true;
					oItems.sort(oSorter, true);
				} else {
					this.resetSortIcons(oTable, true);
					let oSortInitial = new Sorter("Ped_Ebeln");
					oItems.sort(oSortInitial);
				}
			}
		},
		resetSortIcons: function (oTable, oFirst) {
			var prefIcone = "";
			var oQtde = oTable.getAggregation("columns").length - 1;
			if (oTable === this._histPedidoTable) {
				prefIcone = "_i_histped_"
			}
			for (var i = 0; i < oQtde; i++) {
				let zIcon = this.byId(prefIcone + i.toString());
				zIcon.setColor("#808080");
				zIcon.setSrc("sap-icon://sort-ascending");
			}
			if (oFirst) {
				let zIcon = this.byId(prefIcone + "0");
				zIcon.setColor("#f00000");
				zIcon.setSrc("sap-icon://sort-ascending");
			}
		},
		/* Value Help Ekgrp */
		onF4Comprador: function (oEvent) {
			var sInputValue = oEvent.getSource().getDescription();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._F4compradorDialog) {
				this._F4compradorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.comprador", this);
				this.getView().addDependent(this._F4compradorDialog);
			}
			// open value help dialog filtered by the input value
			this._F4compradorDialog.open(sInputValue);
		},
		_handleF4compradorSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
			oEvent.getSource().getBinding("items").filter(oFilter);
		},
		_handleF4compradorClose: function (oEvent) {
			var aFilters = [];
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var compradorInput = this.getView().byId(this.inputId);
				var sEkgrp = oSelectedItem.getTitle();
				var sObjectPath = this.getModel().createKey("/Comprador", {
					Ekgrp: sEkgrp
				});

				compradorInput.bindElement(sObjectPath);
				this.clearFornecedor(oEvent);
				this.filtraHistorico(oEvent);
			}
		},
		/* Value Help Fornecedor */
		onF4Fornecedor: function (oEvent) {
			var aFilters = [];
			var sInputValue = oEvent.getSource().getDescription();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._F4fornecHistoricoDialog) {
				this._F4fornecHistoricoDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.fornecHistorico", this);
				this.getView().addDependent(this._F4fornecHistoricoDialog);
			}
			var sEkgrp = this.byId("compradorInput").getValue();
			if (sEkgrp !== "") {
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
				aFilters.push(fEkgrp);
			}
			// open value help dialog filtered by the input value
			this._F4fornecHistoricoDialog.getBinding("items").filter(aFilters);
			this._F4fornecHistoricoDialog.open(sInputValue);
		},
		clearFornecedor: function (oEvent) {
			var fornecedorInput = this.byId("fornecedorInput");
			fornecedorInput.setValue("");
			fornecedorInput.setDescription("");
			this.filtraHistorico();
		},
		_handleF4fornecedorSearch: function (oEvent) {
			var aFilters = [];
			var sValue = oEvent.getParameter("value");
			// Filtro Fornecedor - Nome
			var oForn = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
			aFilters.push(oForn);
			// Filtro Comprador
			var sEkgrp = this.byId("compradorInput").getValue();
			var oCompr = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
			aFilters.push(oCompr);
			oEvent.getSource().getBinding("items").filter(aFilters);
		},
		_handleF4fornecedorClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var fornecedorInput = this.getView().byId(this.inputId);
				fornecedorInput.setValue(oSelectedItem.getTitle());
				fornecedorInput.setDescription(oSelectedItem.getDescription());
				this.filtraHistorico(oEvent);
			}
			// oEvent.getSource().getBinding("items").filter();
		},
		/* Value Help Loja */
		onF4Loja: function (oEvent) {
			// create value help dialog
			if (!this._F4lojaHistoricoDialog) {
				this._F4lojaHistoricoDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.lojaHistorico", this);
				this.getView().addDependent(this._F4lojaHistoricoDialog);
			}

			var aInput = this.byId("lojaInput").getTokens();
			var aLojaItems = this._F4lojaHistoricoDialog._oList.getItems();
			for (var iTk = 0; iTk < aInput.length; iTk++) {
				for (var type = 0; type < aLojaItems.length; type++) {
					if (aLojaItems[type].getTitle() === aInput[iTk].getKey()) {
						aLojaItems[type].setSelected(true);
					}
				}
			}
			this._openF4LojaDialog(oEvent);
		},
		_openF4LojaDialog: function (oEvent) {
			var aFilters = [];
			var sInputValue = oEvent.getSource().getDescription();
			this.inputId = oEvent.getSource().getId();
			this._filtroF4Lojas(aFilters);
			// open value help dialog filtered by the input value
			this._F4lojaHistoricoDialog.getBinding("items").filter(aFilters);
			this._F4lojaHistoricoDialog.open(sInputValue);
		},
		_filtroF4Lojas: function (aFilters) {
			// Filtro Ekgrp
			var sEkgrp = this.byId("compradorInput").getValue();
			if (sEkgrp !== "") {
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
				aFilters.push(fEkgrp);
			}
		},
		clearLoja: function (oEvent) {
			var lojaInput = this.byId("lojaInput");
			lojaInput.removeAllTokens();
			this.filtraHistorico();
		},
		_handleF4lojaSearch: function (oEvent) {
			var aFilters = [];
			this._filtroF4Lojas(aFilters);
			// Filtro Loja - Nome
			var sValue = oEvent.getParameter("value");
			var oLoja = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
			aFilters.push(oLoja);
			// Grava todos os filtros
			oEvent.getSource().getBinding("items").filter(aFilters);
		},
		_handleF4lojaClose: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("lojaInput");
			oMultiInput.removeAllTokens();
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					var nToken = new sap.m.Token({
						key: oItem.getDescription(),
						text: oItem.getTitle()
					})
					oMultiInput.addToken(nToken);
				});
			}
			this.filtraHistorico(oEvent);
		},
		_handleF4lojaCancel: function (oEvent) {
			//console.log('Ação cancelada');
		},
		onF4lojaTokenUpdate: function (oEvent) {
			this.filtraHistorico(oEvent);
		},
		onChangeDatas: function (oEvent) {
			this.filtraHistorico(oEvent);
		},
		/* Filtra tabela */
		filtraHistorico: function (oEvent) {
			var aFilters = [];
			var sEkgrp = this.byId("compradorInput").getValue();
			if (sEkgrp !== "") {
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
				aFilters.push(fEkgrp);
			}
			// Filtro Fornecedor
			var sLifnr = this.byId("fornecedorInput").getValue();
			if (sLifnr !== "") {
				var fLifnr = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr);
				aFilters.push(fLifnr);
			}
			// Filtro Loja
			var sLojas = this.byId("lojaInput");
			var orArrayLoja = [];
			if (sLojas.getTokens().length > 0) {
				for (var iLojas = 0; iLojas < sLojas.getTokens().length; iLojas++) {
					orArrayLoja.push(new sap.ui.model.Filter(
						"Werks",
						sap.ui.model.FilterOperator.EQ,
						sLojas.getTokens()[iLojas].getText()
					));
				}
				var orFilterLoja = new sap.ui.model.Filter({
					filters: orArrayLoja,
					and: false
				});
				aFilters.push(orFilterLoja);
			}
			// Filtro Data Pedido
			var drPedido = this.byId("drPedido");
			if (drPedido.getDateValue() !== null) {
				var fPedido = new sap.ui.model.Filter("Ped_Bedat", sap.ui.model.FilterOperator.BT, drPedido.getDateValue(), drPedido.getSecondDateValue());
				aFilters.push(fPedido);
			}
			// Filtro Data Remessa
			var drRemessa = this.byId("drRemessa");
			if (drRemessa.getDateValue() !== null) {
				var fRemessa = new sap.ui.model.Filter("Ped_Eindt", sap.ui.model.FilterOperator.BT, drRemessa.getDateValue(), drRemessa.getSecondDateValue());
				aFilters.push(fRemessa);
			}

			this._histPedidoTable.getBinding("items").filter(aFilters);
			this.habilitaImpressao();
		},
		onSelectionChange: function (oEvent) {
			this.habilitaImpressao();
		},
		habilitaImpressao: function () {
			var btnImprimir = this.byId("botaoImprimir");
			btnImprimir.setEnabled(this._histPedidoTable.getSelectedItems().length > 0);
		},
		onNavBack: function (oEvent) {
			this.getRouter().navTo("home", true);
		},
		onBtnClear: function (oEvent) {
			this.clearFornecedor();
			this.clearLoja();
			var drPedido = this.byId("drPedido");
			drPedido.setValue(null);
			var drRemessa = this.byId("drRemessa");
			drRemessa.setValue(null);
			this.filtraHistorico();
			this.habilitaImpressao();
		},
		toPrint: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();

			var tbl_items = [];
			var sEbeln = "";
			tbl_items = this._histPedidoTable.getSelectedItems();
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
			window.open(sURL);
			this._histPedidoTable.removeSelections();
			this.habilitaImpressao();
		}

	});
});