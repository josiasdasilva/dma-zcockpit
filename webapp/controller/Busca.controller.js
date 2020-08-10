sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/ui/Device",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	'sap/m/Token',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Device, History, Fragment, Token, JSONModel, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.Busca", {
		onInit: function () {
			this.getRouter().getRoute("busca").attachPatternMatched(this._onMasterMatched, this);
			//this.habilitaBotaoPedido();
		},
		habilitaBotaoPedido: function (bCleanFields) {
			this.filtraProdutos();

			var globalModel = this.getModel("globalModel");
			var btnPedido = this.byId("botaoPedido");
			// Filtros
			// var sWerks = this.byId("cdInput").getValue() !== "";
			var sEkgrp = this.byId("compradorInput").getValue() !== "";
			var sLifnr = this.byId("fornecedorInput").getValue() !== "";
			var sEbeln = this.byId("contratoInput").getValue() !== "";
			// Configurações
			var sDtRemessa = globalModel.getProperty("/DtRemessa") !== "";
			var sComboPedido = globalModel.getProperty("/TpPedido") !== "";
			var sTpEntrada = globalModel.getProperty("/TpEntrada") !== "";

			btnPedido.setEnabled(sDtRemessa &&
				sComboPedido &&
				sTpEntrada &&
				//sWerks && 
				sEkgrp &&
				(sLifnr || sEbeln));
		},
		onPedidoPressed: function (oEvent) {
			var localModel = this.getModel();
			var globalModel = this.getModel("globalModel");

			globalModel.setProperty("/DtRemessa", this.byId("idDtRemessa").getValue());
			globalModel.setProperty("/TpPedido", this.byId("idComboPedido").getValue());
			globalModel.setProperty("/TpEntrada", this.byId("idTpEntrada").getValue());

			var aFilters = [];
			// Filtro UF
			var sUF = this.byId("UFInput");
			if (sUF.getTokens().length > 0) {
				var orArrayUF = [];
				for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
					orArrayUF.push(new sap.ui.model.Filter(
						"UF",
						sap.ui.model.FilterOperator.EQ,
						sUF.getTokens()[iUF].getText()
					));
				}
				var orFilterUF = new sap.ui.model.Filter({
					filters: orArrayUF,
					and: false
				});
				aFilters.push(orFilterUF);
			}
			// Filtro Bandeira
			var sBandeira = this.byId("grupoLojasInput");
			var orArrayBand = [];
			if (sBandeira.getTokens().length > 0) {
				for (var iBand = 0; iBand < sBandeira.getTokens().length; iBand++) {
					orArrayBand.push(new sap.ui.model.Filter(
						"Bandeira",
						sap.ui.model.FilterOperator.EQ,
						sBandeira.getTokens()[iBand].getText()
					));
				}
				var orFilterBand = new sap.ui.model.Filter({
					filters: orArrayBand,
					and: false
				});
				aFilters.push(orFilterBand);
			}
			// Filtro Loja
			var sLojas = this.byId("cdInput");
			var orArrayLoja = [];
			if (sLojas.getTokens().length > 0) {
				for (var iLojas = 0; iLojas < sLojas.getTokens().length; iLojas++) {
					orArrayLoja.push(new sap.ui.model.Filter(
						"Werks",
						sap.ui.model.FilterOperator.EQ,
						//						`'${sLojas.getTokens()[iLojas].getText()}'`
						sLojas.getTokens()[iLojas].getKey()
					));
				}
				var orFilterLoja = new sap.ui.model.Filter({
					filters: orArrayLoja,
					and: false
				});
				aFilters.push(orFilterLoja);
			}
			// Filtro Comprador
			var sEkgrp = this.byId("compradorInput").getValue();
			if (sEkgrp !== "") {
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
				aFilters.push(fEkgrp);
			}
			// Filtro Comprador
			var sLifnr = this.byId("fornecedorInput").getValue();
			if (sLifnr !== "") {
				var fLifnr = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr);
				globalModel.setProperty("/Lifnr", fLifnr);
				aFilters.push(fLifnr);
			}
			// Filtro Contrato
			var sEbeln = this.byId("contratoInput").getValue();
			if (sEbeln !== "") {
				globalModel.setProperty("/Ebeln", sEbeln);
				var fEbeln = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, sEbeln);
				aFilters.push(fEbeln);
			}
			//  produtos
			var sMatnr = this.byId("idProdutos").getSelectedContexts(true);
			if (sMatnr && sMatnr.length > 0) {
				globalModel.setProperty("/Matnr", sMatnr);
				var orArray = [];
				for (var i = 0; i < sMatnr.length; i++) {
					orArray.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, sMatnr[i].getProperty('Matnr')));
				}
				var orFilter = new sap.ui.model.Filter({
					filters: orArray,
					and: false
				});
				aFilters.push(orFilter);
			}
			// executa busca dos produtos na ficha técnica
			var that = this;
			sap.ui.core.BusyIndicator.show();
			localModel.read("/POBusca", {
				method: "GET",
				filters: aFilters,
				success: function (oData2, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					that.getRouter().navTo("pedido", {
						Ekgrp: sEkgrp,
						Lifnr: sLifnr
					}, true);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					// mensagem de erro !!!!!!!!!!!!!!!!!!!!!!!
				}
			});
		},
		_onMasterMatched: function (oEvent) {
			// var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			// var sUname = oEvent.getParameter("arguments").Uname;
			// var sObjectPath = this.getModel().createKey("/Comprador", {
			// 	Ekgrp: sEkgrp,
			// 	Uname: sUname
			// });
			//this.byId("compradorInput").bindElement(sObjectPath);

			var globalModel = this.getModel("globalModel");
			this.byId("idDtRemessa").setValue(globalModel.getProperty("/DtRemessa"));
			this.byId("idComboPedido").setValue(globalModel.getProperty("/TpPedido"));
			this.byId("idTpEntrada").setValue(globalModel.getProperty("/TpEntrada"));

			this.clearSelectedProduto();

			//globalModel.setProperty("/Uname", sLifnr);

			this.habilitaBotaoPedido();

			//FAFN Receb as informaçoes vindas do appointment se o mesmo foi clicado
			this.setDataFromAppointment(oEvent);
			//FAFN End

		},
		setDataFromAppointment: async function (oEvent) {
			debugger;
			var sLifnr = oEvent.getParameter("arguments").Lifnr;
			var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
			var sUname = oEvent.getParameter("arguments").Uname;
			if (!sLifnr || sLifnr.length === 0) {
				this.clearComprador();
				this.clearSelectedProduto();
				return;
			}
			if (sEkgrp && sEkgrp.length > 0) {
				this.getOwnerComponent().getModel().read(`/Comprador(Ekgrp='${sEkgrp}',Uname='${sUname}')`, {
					success: (res) => {
						this.byId("compradorInput").setDescription(res.Nome);
						this.byId("compradorInput").setValue(res.Ekgrp);
						if (sLifnr && sLifnr.length > 0) {
							debugger;
							this.getOwnerComponent().getModel().read(`/Fornecedor(Ekgrp='${sEkgrp}',Lifnr='${sLifnr}')`, {
								success: (res) => {
									this.byId("fornecedorInput").setDescription(res.Mcod1);
									this.byId("fornecedorInput").setValue(res.Lifnr);
									this.filtraProdutos(true);
								},
								error: (err) => {
									sap.m.MessageBox.error(err.responseText, {
										title: "Erro",
									});
								}
							});
						}
					},
					error: (err) => {
						sap.m.MessageBox.error(err.responseText, {
							title: "Erro",
						});
					}
				});
			}

		},
		/* Configurações */
		onExpand: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sValue = oEvent.getParameter("expand");
			if (sValue) {
				this.byId("idDtRemessa").setValue(globalModel.getProperty("/DtRemessa"));
				this.byId("idComboPedido").setValue(globalModel.getProperty("/TpPedido"));
				this.byId("idTpEntrada").setValue(globalModel.getProperty("/TpEntrada"));
			} else {
				globalModel.setProperty("/DtRemessa", this.byId("idDtRemessa").getValue());
				globalModel.setProperty("/TpPedido", this.byId("idComboPedido").getValue());
				globalModel.setProperty("/TpEntrada", this.byId("idTpEntrada").getValue());
			}
		},
		onNavBack: function (oEvent) {
			this.getRouter().navTo("home", true); //}
		},
		deletePressCD: function (oEvent) {
			this.clearUF(oEvent);
		},
		/* Value Help CD */
		onF4UF: function (oEvent) {
			if (!this._F4UFDialog) {
				this._F4UFDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.uf", this);
				this.getView().addDependent(this._F4UFDialog);
			}

			var aInput = this.byId("UFInput").getTokens();
			var aUFItems = this._F4UFDialog._oList.getItems();
			for (var iTk = 0; iTk < aInput.length; iTk++) {
				for (var type = 0; type < aUFItems.length; type++) {
					if (aUFItems[type].getTitle() === aInput[iTk].getKey()) {
						aUFItems[type].setSelected(true);
					}
				}
			}
			this._F4UFDialog.open();
		},
		_openF4UFDialog: function (oEvent) {
			var sInputValue = oEvent.getSource().getDescription();
			// create a filter for the binding
			this._F4UFDialog.getBinding("items").filter([new sap.ui.model.Filter(
				"Bland",
				sap.ui.model.FilterOperator.Contains,
				sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._F4UFDialog.open(sInputValue);
		},
		_handleF4UFSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"Bland",
				sap.ui.model.FilterOperator.Contains,
				sValue.toUpperCase()
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleF4UFClose: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("UFInput");

			//FAFN - Begin
			oMultiInput.removeAllTokens();
			//FAFN - End

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						key: oItem.getTitle(),
						text: oItem.getDescription()
					}));
				});
			}
			this.cleargrupoLojas(oEvent);
			this.clearCD(oEvent);
			this.habilitaBotaoPedido();
		},
		_handleF4UFCancel: function (oEvent) {
			//console.log('ação cancelada');
		},
		onF4UFTokenUpdate: function (oEvent) {
			this.habilitaBotaoPedido();
		},
		clearUF: function (oEvent) {
			var UFInput = this.byId("UFInput");
			UFInput.removeAllTokens();
			this.cleargrupoLojas(oEvent);
			this.clearCD(oEvent);
			this.habilitaBotaoPedido();
		},
		/* Value Help Grupo Lojas - Bandeira */
		onF4grupoLojas: function (oEvent) {
			// create value help dialog
			if (!this._F4grupoLojasDialog) {
				this._F4grupoLojasDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.grupoLojas", this);
				this.getView().addDependent(this._F4grupoLojasDialog);
			}

			var aInput = this.byId("grupoLojasInput").getTokens();
			var aglItems = this._F4grupoLojasDialog._oList.getItems();
			for (var iTk = 0; iTk < aInput.length; iTk++) {
				for (var type = 0; type < aglItems.length; type++) {
					if (aglItems[type].getTitle() === aInput[iTk].getKey()) {
						aglItems[type].setSelected(true);
					}
				}
			}
			this._openF4grupoLojasDialog(oEvent);
		},
		_openF4grupoLojasDialog: function (oEvent) {
			var sInputValue = oEvent.getSource().getDescription();
			var aFilters = [];
			this._filtroF4grupoLojas(aFilters);

			if (sInputValue !== "") {
				aFilters.push(new sap.ui.model.Filter(
					"Bandeira",
					sap.ui.model.FilterOperator.Contains,
					sInputValue.toUpperCase()
				));
			}
			// open value help dialog filtered by the input value
			this._F4grupoLojasDialog.getBinding("items").filter(aFilters);
			this._F4grupoLojasDialog.open(sInputValue);
		},
		_filtroF4grupoLojas: function (aFilters) {
			// Filtro UF
			var sUF = this.byId("UFInput");
			if (sUF.getTokens().length > 0) {
				var orArrayUF = [];
				for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
					orArrayUF.push(new sap.ui.model.Filter(
						"UF",
						sap.ui.model.FilterOperator.EQ,
						sUF.getTokens()[iUF].getText()
					));
				}
				var orFilterUF = new sap.ui.model.Filter({
					filters: orArrayUF,
					and: false
				});
				aFilters.push(orFilterUF);
			}
			return aFilters;
		},
		_handleF4grupoLojasSearch: function (oEvent) {
			var aFilters = [];
			this._filtroF4grupoLojas(aFilters);
			// filtro Bandeira
			var sBandeira = oEvent.getParameter("value");
			if (sBandeira !== "") {
				aFilters.push(new sap.ui.model.Filter(
					"Bandeira",
					sap.ui.model.FilterOperator.Contains,
					sBandeira.toUpperCase()
				));
			}
			// Grava todos filtros
			oEvent.getSource().getBinding("items").filter(aFilters);
		},
		_handleF4grupoLojasClose: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("grupoLojasInput");
			//FAFN - Begin
			oMultiInput.removeAllTokens();
			//FAFN - End
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						key: oItem.getDescription(),
						text: oItem.getTitle()
					}));
				});
				this.clearCD(oEvent);
			}
			this.habilitaBotaoPedido();
		},
		_handleF4grupoLojasCancel: function (oEvent) {
			//console.log('Ação cancelada');
		},
		onF4grupoLojasTokenUpdate: function (oEvent) {
			this.habilitaBotaoPedido();
		},
		cleargrupoLojas: function (oEvent) {
			var grupoLojasInput = this.byId("grupoLojasInput");
			grupoLojasInput.removeAllTokens();
			this.clearCD(oEvent);
			this.habilitaBotaoPedido();
		},
		/* Value Help CD */
		onF4CD: function (oEvent) {
			// create value help dialog
			if (!this._F4CDDialog) {
				this._F4CDDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.cd", this);
				this.getView().addDependent(this._F4CDDialog);
			}

			var aInput = this.byId("cdInput").getTokens();
			var aCdItems = this._F4CDDialog._oList.getItems();
			for (var iTk = 0; iTk < aInput.length; iTk++) {
				for (var type = 0; type < aCdItems.length; type++) {
					if (aCdItems[type].getTitle() === aInput[iTk].getKey()) {
						aCdItems[type].setSelected(true);
					}
				}
			}
			this._openF4CDDialog(oEvent);
		},
		_openF4CDDialog: function (oEvent) {
			var aFilters = [];
			var sInputValue = oEvent.getSource().getDescription();
			this._filtroF4CD(aFilters);
			// create a filter for the binding
			aFilters.push(new sap.ui.model.Filter(
				"Nome",
				sap.ui.model.FilterOperator.Contains,
				sInputValue
			));
			// open value help dialog filtered by the input value
			this._F4CDDialog.getBinding("items").filter(aFilters);
			this._F4CDDialog.open(sInputValue);
		},
		_filtroF4CD: function (aFilters) {
			// Filtro UF
			var sUF = this.byId("UFInput");
			if (sUF.getTokens().length > 0) {
				var orArrayUF = [];
				for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
					orArrayUF.push(new sap.ui.model.Filter(
						"UF",
						sap.ui.model.FilterOperator.EQ,
						sUF.getTokens()[iUF].getText()
					));
				}
				var orFilterUF = new sap.ui.model.Filter({
					filters: orArrayUF,
					and: false
				});
				aFilters.push(orFilterUF);
			}
			// Filtro Bandeira
			var sBandeira = this.byId("grupoLojasInput");
			var orArrayBand = [];
			if (sBandeira.getTokens().length > 0) {
				for (var iBand = 0; iBand < sBandeira.getTokens().length; iBand++) {
					orArrayBand.push(new sap.ui.model.Filter(
						"Bandeira",
						sap.ui.model.FilterOperator.EQ,
						sBandeira.getTokens()[iBand].getText()
					));
				}
				var orFilterBand = new sap.ui.model.Filter({
					filters: orArrayBand,
					and: false
				});
				aFilters.push(orFilterBand);
			}
			return aFilters;
		},
		_handleF4cdSearch: function (oEvent) {
			var aFilters = [];
			this._filtroF4CD(aFilters);

			//Filtro Nome
			var sNomeLoja = oEvent.getParameter("value");
			aFilters.push(new sap.ui.model.Filter(
				"Nome",
				sap.ui.model.FilterOperator.Contains,
				sNomeLoja.toUpperCase()
			));
			// Grava todos filtros
			oEvent.getSource().getBinding("items").filter(aFilters);

		},
		_handleF4cdClose: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("cdInput");

			//FAFN - Begin
			oMultiInput.removeAllTokens();
			//FAFN - End

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						key: oItem.getDescription(),
						text: oItem.getTitle()
					}));
				});
			}
			this.habilitaBotaoPedido();
		},
		_handleF4cdCancel: function (oEvent) {
			//console.log('Ação cancelada');
		},
		onF4CDTokenUpdate: function (oEvent) {
			this.habilitaBotaoPedido();
		},
		clearCD: function (oEvent) {
			var cdInput = this.byId("cdInput");
			cdInput.removeAllTokens();
			this.habilitaBotaoPedido();
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

			var sBusca = this.byId("buscaProduto").getValue();
			if (sBusca !== "") {
				var numbers = /^[0-9]+$/;
				if (numbers.test(sBusca)) {
					var fMatnr = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, sBusca.toUpperCase());
					aFilters.push(fMatnr);
				} else {
					var fMaktx = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, sBusca.toUpperCase());
					aFilters.push(fMaktx);
				}
			}
			var orFilterLoja = new sap.ui.model.Filter({
				filters: orArrayLoja,
				and: false
			});
			aFilters.push(orFilterLoja);

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
		/* Value Help Contrato */
		onF4Contrato: function (oEvent) {
			var aFilters = [];
			var sInputValue = oEvent.getSource().getDescription();
			var sEkgrp = this.byId("compradorInput").getValue();
			var sLifnr = this.byId("fornecedorInput").getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._F4contratoDialog) {
				this._F4contratoDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.contrato", this);
				this.getView().addDependent(this._F4contratoDialog);
			}
			// Filtro Comprador - Codigo
			var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
			aFilters.push(fEkgrp);
			// Filtro Fornecedor - Codigo
			var fLifnr = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr.toUpperCase());
			aFilters.push(fLifnr);
			// open value help dialog filtered by the input value
			this._F4contratoDialog.getBinding("items").filter(aFilters);
			this._F4contratoDialog.open(sInputValue);
		},
		clearContrato: function (oEvent) {
			var contratoInput = this.byId("contratoInput");
			contratoInput.setValue("");
			contratoInput.setDescription("");
			this.habilitaBotaoPedido();
		},
		_handleF4contratoSearch: function (oEvent) {
			var aFilters = [];
			// Filtro Contrato
			var sEbeln = oEvent.getParameter("value");
			var oContr = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sEbeln.toUpperCase());
			aFilters.push(oContr);
			// Filtro Comprador - Codigo
			var sEkgrp = this.byId("compradorInput").getValue();
			var oCompr = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
			aFilters.push(oCompr);
			// Filtro Fornecedor - Codigo
			var sLifnr = this.byId("fornecedorInput").getValue();
			var oFornec = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr.toUpperCase());
			aFilters.push(oFornec);
			// Grava Filtros
			this._F4contratoDialog.getBinding("items").filter(aFilters);
		},
		_handleF4contratoClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var contratoInput = this.getView().byId(this.inputId);
				contratoInput.setValue(oSelectedItem.getTitle());
				contratoInput.setDescription(oSelectedItem.getDescription());
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.habilitaBotaoPedido();
		},
		/* Busca de Produtos */
		filtraProdutos: function (bNoRefresh) {
			// add filter for search
			var aFilters = [];
			// Filtro Comprador
			var sEkgrp = this.byId("compradorInput").getValue();
			var sLifnr = this.byId("fornecedorInput").getValue();

			var oList = this.byId("idProdutos");
			var oBinding = oList.getBinding("items");

			if ((sEkgrp === "") || (sLifnr === "")) {
				// update list binding
				oBinding.aFilters = null;
				oList.getModel().refresh(true);
			} else {
				// Filtro Comprador
				var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
				aFilters.push(fEkgrp);
				// Filtro Fornecedor
				var fLifnr = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr.toUpperCase());
				aFilters.push(fLifnr);
				// Filtro UF
				var sUF = this.byId("UFInput");
				if (sUF.getTokens().length > 0) {
					var orArrayUF = [];
					for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
						orArrayUF.push(new sap.ui.model.Filter(
							"UF",
							sap.ui.model.FilterOperator.EQ,
							sUF.getTokens()[iUF].getText()
						));
					}
					var orFilterUF = new sap.ui.model.Filter({
						filters: orArrayUF,
						and: false
					});
					aFilters.push(orFilterUF);
				}

				// Filtro Bandeira
				var sBandeira = this.byId("grupoLojasInput");
				var orArrayGL = [];
				if (sBandeira.getTokens().length > 0) {
					for (var iBand = 0; iBand < sBandeira.getTokens().length; iBand++) {
						orArrayGL.push(new sap.ui.model.Filter(
							"Bandeira",
							sap.ui.model.FilterOperator.EQ,
							sBandeira.getTokens()[iBand].getText()
						));
					}
					var orFilterBand = new sap.ui.model.Filter({
						filters: orArrayGL,
						and: false
					});
					aFilters.push(orFilterBand);
				}
				// // Filtro Loja
				var sLojas = this.byId("cdInput");
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
				// Filtro Contrato
				var sEbeln = this.byId("contratoInput").getValue();
				if (sEbeln !== "") {
					var fEbeln = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, sEbeln.toUpperCase());
					aFilters.push(fEbeln);
				}
				// Filtro Texto 
				var sBusca = this.byId("buscaProduto").getValue();
				if (sBusca !== "") {
					var numbers = /^[0-9]+$/;
					if (numbers.test(sBusca)) {
						var fMatnr = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, sBusca.toUpperCase());
						aFilters.push(fMatnr);
					} else {
						var fMaktx = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, sBusca.toUpperCase());
						aFilters.push(fMaktx);
					}
				}
				// update list binding
				oBinding.filter(aFilters);
			}
			if (!bNoRefresh) {
				oList.getModel().updateBindings(true);
			}
		},
		clearSelectedProduto: function (oEvent) {
			var oList = this.byId("idProdutos");
			oList.removeSelections(true);
			this.byId("idCountSelected").setText('');
			this.byId("idInfoToolbar").setVisible(false);
			this.filtraProdutos();
		},
		onSearchProduto: function (oEvent) {
			this.filtraProdutos();
		},
		onSelectionChangeProduto: function (oEvent) {
			var oList = oEvent.getSource();
			var oLabel = this.byId("idCountSelected");
			var oInfoToolbar = this.byId("idInfoToolbar");
			// With the 'getSelectedContexts' function you can access the context paths
			// of all list items that have been selected, regardless of any current
			// filter on the aggregation binding.
			var aContexts = oList.getSelectedContexts(true);
			// update UI
			var bSelected = aContexts && aContexts.length > 0;
			var sText = bSelected ? aContexts.length + " produtos selecionados" : null;
			oInfoToolbar.setVisible(bSelected);
			oLabel.setText(sText);
		}
	});
});