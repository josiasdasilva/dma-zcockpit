sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/m/Label",
	"sap/m/Popover",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Label, Popover, DateFormat, Fragment, JSONModel) {
	"use strict";
	//var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
	return BaseController.extend("dma.zcockpit.controller.Home", {
		onInit: function () {
			this.getRouter().getRoute("home").attachPatternMatched(this._onMasterMatched, this);
			/* busca imagem */
			var sRootPath = jQuery.sap.getModulePath("dma.zcockpit");
			var sImagePath = sRootPath + "/img/background_cockpit.png";
			this.byId("img_epa").setSrc(sImagePath);
			/* popula dados da Agenda */
			//this.populateAppointments();
		},
		_onMasterMatched: function (oEvent) {},
		onBtnPedidoPress: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var oView = this.getView();
			oView.setBusy(true);
			var sEkgrp = "";
			var sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9066004" : sap.ushell.Container
				.getUser().getId();
			var localModel = this.getModel();

			var sObjectPath = localModel.createKey("/Usuario", {
				Uname: sUname
			});
			var that = this;
			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					sEkgrp = oData2.Ekgrp;
					sUname = oData2.Uname;
					globalModel.setProperty("/Ekgrp", sEkgrp);
					globalModel.setProperty("/Uname", sUname);
					oView.setBusy(false);
					that.getRouter().navTo("busca", {
						Ekgrp: sEkgrp,
						Uname: sUname
					}, true);
				},
				error: function (oError) {
					oView.setBusy(false);
					sap.m.MessageBox.error("Comprador " + sUname + " n\xE3o foi encontrado.", {
						title: "Comprador Inexistente"
					});
					/*
									var sInputValue = oEvent.getSource().getDescription();
									this.inputId = oEvent.getSource().getId();
									if (!this._F4compradorDialog) {
										this._F4compradorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.comprador", this);
										this.getView().addDependent(this._F4compradorDialog);
									}
									// open value help dialog filtered by the input value
									this._F4compradorDialog.open(sInputValue);
									*/
				}
			});
		}
	});
});