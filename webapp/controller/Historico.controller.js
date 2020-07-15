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
			// var globalModel = this.getModel("globalModel");
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
		// onNavBack: function (oEvent) {
		// 	this.getRouter().navTo("home", true); //}
		// },
		/**
		 *@memberOf dma.zcockpit.controller.Historico
		 */
		action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		}
	});
});