/*global history */
sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"dma/zcockpit/model/formatter",
	"dma/zcockpit/model/grouper",
	"dma/zcockpit/model/GroupSortState",
	"sap/ui/core/routing/History"
], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, grouper, GroupSortState, History) {
	"use strict";

	return BaseController.extend("dma.zcockpit.controller.Master", {

		formatter: formatter,
		onInit: function () {
			// Control state model
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();

			this._oGroupSortState = new GroupSortState(oViewModel, grouper.groupUnitNumber(this.getResourceBundle()));

			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			this.setModel(oViewModel, "masterView");
			oList.attachEventOnce("updateFinished", function () {
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			// this.getView().addEventDelegate({
			// 	onBeforeFirstShow: function () {
			// 		this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
			// 	}.bind(this)
			// });

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
		},
		onUpdateFinished: function (oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
			// hide pull to refresh if necessary
			this.byId("pullToRefresh").hide();

			var oList = oEvent.getSource(),
				oFirstItem = oList.getItems()[0];
			oList.setSelectedItem(oFirstItem, true, true);
			//this._showDetail(oList);
		},
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new Filter("Maktx", FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();

		},
		onRefresh: function () {
			this._oList.getBinding("items").refresh();
		},

		onSort: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey(),
				aSorters = this._oGroupSortState.sort(sKey);

			this._applyGroupSort(aSorters);
		},

		/**
		 * Event handler for the grouper selection.
		 * @param {sap.ui.base.Event} oEvent the search field event
		 * @public
		 */
		onGroup: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey(),
				aSorters = this._oGroupSortState.group(sKey);

			this._applyGroupSort(aSorters);
		},
		onOpenViewSettings: function () {
			// if (!this._oViewSettingsDialog) {
			// 	this._oViewSettingsDialog = sap.ui.xmlfragment("dma.zcockpit.view.ViewSettingsDialog", this);
			// 	this.getView().addDependent(this._oViewSettingsDialog);
			// 	// forward compact/cozy style into Dialog
			// 	this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			// }
			// this._oViewSettingsDialog.open();
		},

		onConfirmViewSettingsDialog: function (oEvent) {
			var aFilterItems = oEvent.getParameters().filterItems,
				aFilters = [],
				aCaptions = [];

			// update filter state:
			// combine the filter array and the filter string
			aFilterItems.forEach(function (oItem) {
				switch (oItem.getKey()) {
				case "Filter1":
					aFilters.push(new Filter("Sugestao", FilterOperator.LE, 100));
					break;
				case "Filter2":
					aFilters.push(new Filter("Sugestao", FilterOperator.GT, 100));
					break;
				default:
					break;
				}
				aCaptions.push(oItem.getText());
			});

			this._oListFilterState.aFilter = aFilters;
			this._updateFilterBar(aCaptions.join(", "));
			this._applyFilterSearch();
		},
		onSelectionChange: function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		onBypassed: function () {
			this._oList.removeSelections(true);
		},

		createGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		onNavBack: function (oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				//					var sLifnr = oEvent.getSource().getBindingContext().getProperty("Lifnr");
				//					var sComprador = oEvent.getSource().getBindingContext().getProperty("Comprador");
				this.getRouter().navTo("fornecedor", {
					//					      	Lifnr : sLifnr,
					//					      	Comprador : sComprador
				}, true);
			}
		},

		_createViewModel: function () {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "Maktx",
				groupBy: "None"
			});
		},

		_onMasterMatched: function (oEvent) {

			var oArgs;
			oArgs = oEvent.getParameter("arguments");
			var sPath = "/Fornecedor(Comprador='" + oArgs.Comprador + "',Lifnr='" + oArgs.Lifnr + "')/PO";
			this._oList.bindItems({
				path: sPath,
				template: this._oList.getBindingInfo("items").template,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						//this._oList.setBusy(true);
					},
					dataReceived: function () {
						// this._oList.setBusy(false);
					}
				}
			});
			this._oList.getBinding("items").refresh();

			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				//				this._oList.oWhenListLoadingIsDone.then(
				function (mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}
					var sComprador = mParams.firstListitem.getBindingContext().getProperty("Comprador");
					var sLifnr = mParams.firstListitem.getBindingContext().getProperty("Lifnr");
					var sMatnr = mParams.firstListitem.getBindingContext().getProperty("Matnr");
					var bReplace = !Device.system.phone;
					this.getRouter().navTo("detail", {
						Comprador: sComprador,
						Lifnr: sLifnr,
						Matnr: sMatnr
					}, bReplace);
					// this.getRouter().navTo("lojas", 
					//       {
					//       	Comprador : sComprador,
					//       	Lifnr : sLifnr,
					//       	Matnr : sMatnr
					//       }, true);
				}.bind(this),
				function (mParams) {
					if (mParams.error) {
						return;
					}
					this.getRouter().getTargets().display("detailNoObjectsAvailable");
				}.bind(this)
			);
		},
		_onBindingChange: function (oEvent) {
			// No data for the binding
			// if (!this.getView().getBindingContext()) {
			// this.getRouter().getTargets().display("notFound");
			// }
		},
		_showDetail: function (oItem) {
			var bReplace = !Device.system.phone;
			this.getRouter().navTo("detail", {
				Comprador: oItem.getBindingContext().getProperty("Comprador"),
				Lifnr: oItem.getBindingContext().getProperty("Lifnr"),
				Matnr: oItem.getBindingContext().getProperty("Matnr")
			}, bReplace);
			// this.getRouter().navTo("lojas", {
			// 	Comprador : oItem.getBindingContext().getProperty("Comprador"),
			// 	Lifnr : oItem.getBindingContext().getProperty("Lifnr"),
			// 	Matnr : oItem.getBindingContext().getProperty("Matnr")
			// }, bReplace);
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},
		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function () {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
		 * @private
		 */
		_applyGroupSort: function (aSorters) {
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function (sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		}

	});

});