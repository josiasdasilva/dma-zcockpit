sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"dma/zcockpit/model/formatter",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function (BaseController, formatter, Sorter, Filter) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.Historico", {
		formatter: formatter,
		_histpedidoTable: null,
		onInit: function () {
			this.getRouter().getRoute("historico").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this); //this.habilitaBotaoPedido();

			this._histpedidoTable = this.getView().byId("tableHistPedido");
			this._histpedidoTable.addEventDelegate({
				onAfterRendering: () => {
					var oHeader = this._histpedidoTable.$().find('.sapMListTblHeaderCell');
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						this.onClickColumnHeader(oID, this._histpedidoTable);
					}
				}
			}, this._histpedidoTable);
		},
		_onMasterMatched: function (oEvent) {

			// var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			// var sUname = oEvent.getParameter("arguments").Uname;
			// var sObjectPath = this.getModel().createKey("/Comprador", {
			// 	Ekgrp: sEkgrp,
			// 	Uname: sUname
			// });
			// this.byId("compradorInput").bindElement(sObjectPath);
			var globalModel = this.getModel("globalModel");
			// globalModel.
			// this.byId("idDtRemessa").setValue(globalModel.getProperty("/DtRemessa"));
			// this.byId("idComboPedido").setValue(globalModel.getProperty("/TpPedido"));
			// this.byId("idTpEntrada").setValue(globalModel.getProperty("/TpEntrada"));
			// this.clearSelectedProduto();
			// this.habilitaBotaoPedido();
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
			// var oQtde = oTable.getAggregation("columns").length;
			var prefIcone = "";
			var oQtde = oTable.getColCount() - 1;
			if (oTable === this._histpedidoTable) {
				prefIcone = "_i_histped_"
			}
			for (var i = 0; i < oQtde; i++) {
				let zIcon = this.byId(prefIcone + i.toString());
				zIcon.setColor("#808080");
				zIcon.setSrc("sap-icon://sort-ascending");
			}
			if (oFirst) {
				let zIcon = this.byId(prefIcone + "1");
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
		clearComprador: function (oEvent) {
			var compradorInput = this.byId("compradorInput");
			compradorInput.setValue("");
			compradorInput.setDescription("");
			this.clearFornecedor(oEvent);
			this.clearContrato(oEvent);
			this.habilitaBotaoPedido();
		},
		_handleF4compradorSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleF4compradorClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var compradorInput = this.getView().byId(this.inputId);
				var sEkgrp = oSelectedItem.getTitle();
				var sUname = oSelectedItem.getInfo();
				var sObjectPath = this.getModel().createKey("/Comprador", {
					Ekgrp: sEkgrp,
					Uname: sUname
				});
				compradorInput.bindElement(sObjectPath);
				this.clearFornecedor(oEvent);
				this.clearContrato(oEvent);
				this.filtraProdutos();
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.habilitaBotaoPedido();
		},
		/* Value Help Fornecedor */
		onF4Fornecedor: function (oEvent) {
			var sInputValue = oEvent.getSource().getDescription();
			var sEkgrp = this.byId("compradorInput").getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._F4fornecedorDialog) {
				this._F4fornecedorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.fornecedor", this);
				this.getView().addDependent(this._F4fornecedorDialog);
			}
			// set previous filter - if comprador is filled
			var oFilter = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
			// open value help dialog filtered by the input value
			this._F4fornecedorDialog.getBinding("items").filter([oFilter]);
			this._F4fornecedorDialog.open(sInputValue);
		},
		clearFornecedor: function (oEvent) {
			var fornecedorInput = this.byId("fornecedorInput");
			fornecedorInput.setValue("");
			fornecedorInput.setDescription("");
			this.clearContrato(oEvent);
			this.habilitaBotaoPedido();
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
				this.clearContrato(oEvent);
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.habilitaBotaoPedido();
		},
		onNavBack: function (oEvent) {
			this.getRouter().navTo("home", true); //}
		},
		toPrint: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sEbeln = oEvent.getSource().getAggregation("cells")[1].getText();
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/PrnPedido", {
				Ebeln: sEbeln
			});
			debugger;
			var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
			window.open(sURL);

			// globalModel.setProperty("/Ebeln", sEbeln);
			// this.getRouter().navTo("pedidoprint", {
			// 	Ebeln: sEbeln
			// }, true);
		}

	});
});