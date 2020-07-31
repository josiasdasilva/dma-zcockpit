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

			this.sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9066004" : sap.ushell.Container
				.getUser().getId();

			this.getRouter().getRoute("home").attachPatternMatched(this._onMasterMatched, this);
			/* busca imagem */
			var sRootPath = jQuery.sap.getModulePath("dma.zcockpit");
			var sImagePath = sRootPath + "/img/background_cockpit.png";
			this.byId("img_epa").setSrc(sImagePath); /* popula dados da Agenda */
			//this.populateAppointments();
		},
		_onMasterMatched: function (oEvent) {
			this._buscaLogadoSync();
			this.populateAppointments();
		},
		handleNavDate: function (oEvt) {
			console.log(oEvt.getSource().getStartDate());
		},
		_buscaLogado: function () {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9066004" : sap.ushell.Container
				.getUser().getId();
			var sObjectPath = localModel.createKey("/Usuario", {
				Uname: sUname
			});
			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					globalModel.setProperty("/Ekgrp", oData2.Ekgrp);
					globalModel.setProperty("/Uname", oData2.Uname);
				},
				error: function (oError) {}
			});
		},
		_buscaLogadoSync: function () {
			sap.ui.core.BusyIndicator.show(0);
			return new Promise((resolve, reject) => {
				var globalModel = this.getModel("globalModel");
				var localModel = this.getModel();
				var sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9066004" : sap.ushell.Container
					.getUser().getId();
				var sObjectPath = localModel.createKey("/Usuario", {
					Uname: sUname
				});
				localModel.read(sObjectPath, {
					method: "GET",
					success: function (oData2, oResponse) {
						globalModel.setProperty("/Ekgrp", oData2.Ekgrp);
						globalModel.setProperty("/Uname", oData2.Uname);
						sap.ui.core.BusyIndicator.hide();
						resolve([oData2.Ekgrp, oData2.Uname]);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						reject(oError);
					}
				});
			});
		},
		onBtnHistoricoPress: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sUname = globalModel.getProperty("/Uname");
			if (sEkgrp === undefined || sUname === undefined) {
				this._buscaLogadoSync().then((res) => {
					this.getRouter().navTo("historico", {
						Ekgrp: res[0]
					}, true);
				})
			} else {
				this.getRouter().navTo("historico", {
					Ekgrp: sEkgrp
				}, true);
			}
		},
		goToPedidos: function (oEvt) {

			var oAppnt = this.byId("MyCalendar").getModel().oData.people[0].appointments.find((appont) => {
				return appont.start.toGMTString() === this._oDetailsPopover.oAppointment.mProperties.startDate.toGMTString() && appont.end.toGMTString() ===
					this._oDetailsPopover
					.oAppointment.mProperties.endDate.toGMTString()
			});

			var globalModel = this.getModel("globalModel");
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sUname = globalModel.getProperty("/Uname");
			globalModel.setProperty("/Lifnr", oAppnt.lifnr);
			if (sEkgrp === undefined || sUname === undefined) {
				this._buscaLogadoSync().then((res) => {
					this.getRouter().navTo("busca", {
						Ekgrp: res[0],
						Uname: res[1],
						Lifnr: oAppnt.lifnr
					}, true);
				})
			} else {
				this.getRouter().navTo("busca", {
					Ekgrp: sEkgrp,
					Uname: sUname,
					Lifnr: oAppnt.lifnr
				}, true);
			}
		},
		onBtnPedidoPress: function (oEvent) {
			var globalModel = this.getModel("globalModel");
			var sEkgrp = globalModel.getProperty("/Ekgrp");
			var sUname = globalModel.getProperty("/Uname");
			if (sEkgrp === undefined || sUname === undefined) {
				this._buscaLogadoSync().then((res) => {
					this.getRouter().navTo("busca", {
						Ekgrp: res[0],
						Uname: res[1]
					}, true);
				})
			} else {
				this.getRouter().navTo("busca", {
					Ekgrp: sEkgrp,
					Uname: sUname
				}, true);
			}

			// var oView = this.getView();
			// var localModel = this.getModel();
			// var sObjectPath = localModel.createKey("/Usuario", {
			// 	Uname: sUname
			// });

			// localModel.read(sObjectPath, {
			// 	method: "GET",
			// 	success: function (oData2, oResponse) {
			// 		sEkgrp = oData2.Ekgrp;
			// 		sUname = oData2.Uname;
			// 		globalModel.setProperty("/Ekgrp", sEkgrp);
			// 		globalModel.setProperty("/Uname", sUname);
			// 		oView.setBusy(false);
			// 		that.getRouter().navTo("busca", {
			// 			Ekgrp: sEkgrp,
			// 			Uname: sUname
			// 		}, true);
			// 	},
			// 	error: function (oError) {
			// 		oView.setBusy(false);
			// 		sap.m.MessageBox.error("Comprador " + sUname + " n\xE3o foi encontrado.", {
			// 			title: "Comprador Inexistente"
			// 		});
			// 		/*
			// 		var sInputValue = oEvent.getSource().getDescription();
			// 		this.inputId = oEvent.getSource().getId();
			// 		if (!this._F4compradorDialog) {
			// 			this._F4compradorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.comprador", this);
			// 			this.getView().addDependent(this._F4compradorDialog);
			// 		}
			// 		// open value help dialog filtered by the input value
			// 		this._F4compradorDialog.open(sInputValue);
			// 		*/
			// 	}
			// });
		},
		// action: function (oEvent) {
		// 	var that = this;
		// 	var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
		// 	var eventType = oEvent.getId();
		// 	var aTargets = actionParameters[eventType].targets || [];
		// 	aTargets.forEach(function (oTarget) {
		// 		var oControl = that.byId(oTarget.id);
		// 		if (oControl) {
		// 			var oParams = {};
		// 			for (var prop in oTarget.parameters) {
		// 				oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
		// 			}
		// 			oControl[oTarget.action](oParams);
		// 		}
		// 	});
		// 	var oNavigation = actionParameters[eventType].navigation;
		// 	if (oNavigation) {
		// 		var oParams = {};
		// 		(oNavigation.keys || []).forEach(function (prop) {
		// 			oParams[prop.name] = encodeURIComponent(JSON.stringify({
		// 				value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
		// 				type: prop.type
		// 			}));
		// 		});
		// 		if (Object.getOwnPropertyNames(oParams).length !== 0) {
		// 			this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
		// 		} else {
		// 			this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
		// 		}
		// 	}
		// },
		onExit: function () {
			if (this._oNewAppointmentDialog) {
				this._oNewAppointmentDialog.destroy();
			}
			if (this._oDetailsPopover) {
				this._oDetailsPopover.destroy();
			}
		},
		_aDialogTypes: [{
			title: "Create Appointment",
			type: "create_appointment"
		}, {
			title: "Create Appointment",
			type: "create_appointment_with_context"
		}, {
			title: "Edit Appointment",
			type: "edit_appointment"
		}],
		getMonday: function () {
			let d = new Date();
			var day = d.getDay(),
				diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
			return new Date(d.setDate(diff));
		},
		saveAppointment: function (oDataJson) {
			return new Promise((resolve, reject) => {
				this.getOwnerComponent().getModel().createEntry("/AgendaItem", {
					properties: oDataJson,
					success: (oData, oResponse) => {
						resolve([oData, oResponse])
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		},
		deleteAppointment: function (sId) {
			return new Promise((resolve, reject) => {
				this.getOwnerComponent().getModel().remove(`/AgendaItem(${sId})`, {
					success: (res) => {
						resolve(res);
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		},
		updateAppointment: function () {
			return new Promise((resolve, reject) => {
				oModel.update(`/AgendaItem(${sId})`, oEntry, {
					success: (res) => {
						resolve(res);
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		},
		populateAppointments: function () {
			var oModel = new JSONModel();
			var sRootPath = jQuery.sap.getModulePath("zcockpit");

			let aFilters = [];
			aFilters.push(new sap.ui.model.Filter({
				path: "Uname",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.sUname
			}));

			this.getOwnerComponent().getModel().read("/AgendaItem", {
				filters: aFilters,
				success: (res) => {
					if (res.results.length === 0) {
						return;
					}

					let plannData = {
						startDate: new Date(new Date().setHours(7, 0, 0)),
						people: []
					}

					plannData.people.push({
						appointments: []
					});
					//plannData.people[0].pic = sRootPath + "xxx.png";
					plannData.people[0].name = res.results[0].Nome;

					for (let item of res.results) {

						plannData.people[0].appointments.push({
							start: item.Dthrinicio,
							end: item.Dthrfim,
							title: item.Name1,
							info: item.Comentario,
							type: "Type02",
							lifnr: item.Lifnr,
							ekgrp: item.Ekgrp,
							tentative: false
						});
					}
					oModel.setData(plannData);
					console.log(plannData);
					this.byId("MyCalendar").setModel(oModel);
				},
				error: (err) => {
					sap.m.MessageBox.error(err, {
						title: "Erro"
					});
				}
			});

		},
		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (oAppointment) {
				this._handleSingleAppointment(oAppointment);
			} else {
				this._handleGroupAppointments(oEvent);
			}
		},
		_addNewAppointment: function (oAppointment) {
			var oModel = this.getView().getModel(),
				sPath = "/people/" + Fragment.byId("dialogFrag", "selectPerson").getSelectedIndex().toString(),
				oPersonAppointments;
			if (Fragment.byId("dialogFrag", "isIntervalAppointment").getSelected()) {
				sPath += "/headers";
			} else {
				sPath += "/appointments";
			}
			oPersonAppointments = oModel.getProperty(sPath);
			oPersonAppointments.push(oAppointment);
			oModel.setProperty(sPath, oPersonAppointments);
		},
		handleCancelButton: function () {
			this._oDetailsPopover.close();
		},
		handleAppointmentCreate: function () {
			this._arrangeDialogFragment(this._aDialogTypes[0].type);
		},
		handleAppointmentAddWithContext: function (oEvent) {
			this.oClickEventParameters = oEvent.getParameters();
			this._arrangeDialogFragment(this._aDialogTypes[1].type);
		},
		_validateDateTimePicker: function (oDateTimePickerStart, oDateTimePickerEnd) {
			var oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				sValueStateText = "Start date should be before End date";
			if (oStartDate && oEndDate && oEndDate.getTime() <= oStartDate.getTime()) {
				oDateTimePickerStart.setValueState("Error");
				oDateTimePickerEnd.setValueState("Error");
				oDateTimePickerStart.setValueStateText(sValueStateText);
				oDateTimePickerEnd.setValueStateText(sValueStateText);
			} else {
				oDateTimePickerStart.setValueState("None");
				oDateTimePickerEnd.setValueState("None");
			}
		},
		updateButtonEnabledState: function () {
			var oStartDate = Fragment.byId("dialogFrag", "startDate"),
				oEndDate = Fragment.byId("dialogFrag", "endDate"),
				bEnabled = oStartDate.getValueState() !== "Error" && oStartDate.getValue() !== "" && oEndDate.getValue() !== "" && oEndDate.getValueState() !==
				"Error";
			this._oNewAppointmentDialog.getBeginButton().setEnabled(bEnabled);
		},
		handleCreateChange: function (oEvent) {
			var oDateTimePickerStart = Fragment.byId("idCalendCreate", "startDate"),
				oDateTimePickerEnd = Fragment.byId("idCalendCreate", "endDate");
			if (oEvent.getParameter("valid")) {
				this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd);
			} else {
				oEvent.getSource().setValueState("Error");
			}
			this.updateButtonEnabledState();
		},
		_removeAppointment: function (oAppointment, sPersonId) {
			var oModel = this.getView().getModel(),
				sTempPath, aPersonAppointments, iIndexForRemoval;
			if (!sPersonId) {
				sTempPath = this.sPath.slice(0, this.sPath.indexOf("appointments/") + "appointments/".length);
			} else {
				sTempPath = "/people/" + sPersonId + "/appointments";
			}
			aPersonAppointments = oModel.getProperty(sTempPath);
			iIndexForRemoval = aPersonAppointments.indexOf(oAppointment);
			if (iIndexForRemoval !== -1) {
				aPersonAppointments.splice(iIndexForRemoval, 1);
			}
			oModel.setProperty(sTempPath, aPersonAppointments);
		},
		handleDeleteAppointment: function () {
			var oBindingContext = this._oDetailsPopover.getBindingContext(),
				oAppointment = oBindingContext.getObject(),
				iPersonIdStartIndex = oBindingContext.getPath().indexOf("/people/") + "/people/".length,
				iPersonId = oBindingContext.getPath()[iPersonIdStartIndex];
			this._removeAppointment(oAppointment, iPersonId);
			this._oDetailsPopover.close();
		},
		handleCloseAppointment: function () {
			this._oDetailsPopover.close();
		},
		handleEditButton: function () {
			this._oDetailsPopover.close();
			this.sPath = this._oDetailsPopover.getBindingContext().getPath();
			this._arrangeDialogFragment(this._aDialogTypes[2].type);
		},
		_arrangeDialogFragment: function (iDialogType) {
			if (!this._oNewAppointmentDialog) {
				this._oNewAppointmentDialog = sap.ui.xmlfragment("idCalendCreate", "dma.zcockpit.view.fragment.calendar_create", this);
				//this._oNewAppointmentDialog = oDialog;
				this.getView().addDependent(this._oNewAppointmentDialog);
				this._arrangeDialog(iDialogType);
			} else {
				this._arrangeDialog(iDialogType);
			}
		},
		_arrangeDialog: function (sDialogType) {
			var sTempTitle = "";
			this._oNewAppointmentDialog._sDialogType = sDialogType;
			if (sDialogType === "edit_appointment") {
				this._setEditAppointmentDialogContent();
				sTempTitle = this._aDialogTypes[2].title;
			} else if (sDialogType === "create_appointment_with_context") {
				this._setCreateWithContextAppointmentDialogContent();
				sTempTitle = this._aDialogTypes[1].title;
			} else if (sDialogType === "create_appointment") {
				this._setCreateAppointmentDialogContent();
				sTempTitle = this._aDialogTypes[0].title;
			} else {
				//Log.error("Wrong dialog type.");
			}
			this._oNewAppointmentDialog.setTitle(sTempTitle);
			this._oNewAppointmentDialog.open();
		},
		handleAppointmentTypeChange: function (oEvent) {
			var sFragName = "dialogFrag",
				oAppointmentType = Fragment.byId(sFragName, "isIntervalAppointment");
			oAppointmentType.setSelected(oEvent.getSource().getSelected());
		},
		handleDialogCancelButton: function () {
			this._oNewAppointmentDialog.close();
		},
		_editAppointment: function (oAppointment, bIsIntervalAppointment, iPersonId) {
			var sAppointmentPath = this._appointmentOwnerChange(),
				oModel = this.getView().getModel();
			if (bIsIntervalAppointment) {
				this._convertToHeader(oAppointment, iPersonId);
			} else {
				if (this.sPath !== sAppointmentPath) {
					this._addNewAppointment(this._oNewAppointmentDialog.getModel().getProperty(this.sPath));
					this._removeAppointment(this._oNewAppointmentDialog.getModel().getProperty(this.sPath));
				}
				oModel.setProperty(sAppointmentPath + "/title", oAppointment.title);
				oModel.setProperty(sAppointmentPath + "/info", oAppointment.info);
				oModel.setProperty(sAppointmentPath + "/type", oAppointment.type);
				oModel.setProperty(sAppointmentPath + "/start", oAppointment.start);
				oModel.setProperty(sAppointmentPath + "/end", oAppointment.end);
			}
		},
		_convertToHeader: function (oAppointment) {
			var sPersonId = Fragment.byId("dialogFrag", "selectPerson").getSelectedIndex().toString();
			this._removeAppointment(this._oNewAppointmentDialog.getModel().getProperty(this.sPath), sPersonId);
			this._addNewAppointment({
				start: oAppointment.start,
				end: oAppointment.end,
				title: oAppointment.title,
				type: oAppointment.type
			});
		},
		handleDialogSaveButton: function () {
			var oStartDate = Fragment.byId("dialogFrag", "startDate"),
				oEndDate = Fragment.byId("dialogFrag", "endDate"),
				sInfoValue = Fragment.byId("dialogFrag", "moreInfo").getValue(),
				sInputTitle = Fragment.byId("dialogFrag", "inputTitle").getValue(),
				iPersonId = Fragment.byId("dialogFrag", "selectPerson").getSelectedIndex(),
				oModel = this.getView().getModel(),
				bIsIntervalAppointment = Fragment.byId("dialogFrag", "isIntervalAppointment").getSelected(),
				oNewAppointment;
			if (oStartDate.getValueState() !== "Error" && oEndDate.getValueState() !== "Error") {
				if (this.sPath && this._oNewAppointmentDialog._sDialogType === "edit_appointment") {
					this._editAppointment({
						title: sInputTitle,
						info: sInfoValue,
						type: this._oDetailsPopover.getBindingContext().getObject().type,
						start: oStartDate.getDateValue(),
						end: oEndDate.getDateValue()
					}, bIsIntervalAppointment, iPersonId);
				} else {
					if (bIsIntervalAppointment) {
						oNewAppointment = {
							title: sInputTitle,
							start: oStartDate.getDateValue(),
							end: oEndDate.getDateValue()
						};
					} else {
						oNewAppointment = {
							title: sInputTitle,
							info: sInfoValue,
							start: oStartDate.getDateValue(),
							end: oEndDate.getDateValue()
						};
					}
					this._addNewAppointment(oNewAppointment);
				}
				oModel.updateBindings();
				this._oNewAppointmentDialog.close();
			}
		},
		_appointmentOwnerChange: function () {
			var iSpathPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
				iSelectedPerson = Fragment.byId("dialogFrag", "selectPerson").getSelectedIndex(),
				sTempPath = this.sPath,
				iLastElementIndex = this._oNewAppointmentDialog.getModel().getProperty("/people/" + iSelectedPerson.toString() + "/appointments/")
				.length.toString();
			if (iSpathPersonId !== iSelectedPerson.toString()) {
				sTempPath = "".concat("/people/", iSelectedPerson.toString(), "/appointments/", iLastElementIndex.toString());
			}
			return sTempPath;
		},
		_setCreateAppointmentDialogContent: function () {
			var oAppointmentType = Fragment.byId("idCalendCreate", "isIntervalAppointment"),
				oDateTimePickerStart = Fragment.byId("idCalendCreate", "startDate"),
				oDateTimePickerEnd = Fragment.byId("idCalendCreate", "endDate"),
				oTitleInput = Fragment.byId("idCalendCreate", "inputTitle"),
				oMoreInfoInput = Fragment.byId("idCalendCreate", "moreInfo"),
				oPersonSelected = Fragment.byId("idCalendCreate", "selectPerson");
			//Set the person in the first row as selected.
			oPersonSelected.setSelectedItem(Fragment.byId("idCalendCreate", "selectPerson").getItems()[0]);
			oDateTimePickerStart.setValue("");
			oDateTimePickerEnd.setValue("");
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");
			oTitleInput.setValue("");
			oMoreInfoInput.setValue("");
			oAppointmentType.setSelected(false);
			this.updateButtonEnabledState();
		},
		_setCreateWithContextAppointmentDialogContent: function () {
			//this.getView().getModel().getProperty("/people/"),
			var aPeople = this.byId("MyCalendar").getModel().oData.people,
				oSelectedIntervalStart = this.oClickEventParameters.startDate,
				oStartDate = Fragment.byId("idCalendCreate", "startDate"),
				oSelectedIntervalEnd = this.oClickEventParameters.endDate,
				oEndDate = Fragment.byId("idCalendCreate", "endDate"),
				oDateTimePickerStart = Fragment.byId("idCalendCreate", "startDate"),
				oDateTimePickerEnd = Fragment.byId("idCalendCreate", "endDate"),
				oAppointmentType = Fragment.byId("idCalendCreate", "isIntervalAppointment"),
				oTitleInput = Fragment.byId("idCalendCreate", "inputTitle"),
				oMoreInfoInput = Fragment.byId("idCalendCreate", "moreInfo"),
				sPersonName, oPersonSelected;
			if (this.oClickEventParameters.row) {
				sPersonName = this.oClickEventParameters.row.getTitle();
				oPersonSelected = Fragment.byId("idCalendCreate", "selectPerson");
				oPersonSelected.setSelectedIndex(aPeople.indexOf(aPeople.filter(function (oPerson) {
					return oPerson.name === sPersonName;
				})[0]));
			}
			oStartDate.setDateValue(oSelectedIntervalStart);
			oEndDate.setDateValue(oSelectedIntervalEnd);
			oTitleInput.setValue("");
			oMoreInfoInput.setValue("");
			oAppointmentType.setSelected(false);
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");
			this.updateButtonEnabledState();
			delete this.oClickEventParameters;
		},
		_setEditAppointmentDialogContent: function () {
			var oAppointment = this._oNewAppointmentDialog.getModel().getProperty(this.sPath),
				oSelectedIntervalStart = oAppointment.start,
				oSelectedIntervalEnd = oAppointment.end,
				oDateTimePickerStart = Fragment.byId("idCalendDetails", "startDate"),
				oDateTimePickerEnd = Fragment.byId("idCalendDetails", "endDate"),
				sSelectedInfo = oAppointment.info,
				sSelectedTitle = oAppointment.title,
				iSelectedPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
				oPersonSelected = Fragment.byId("idCalendDetails", "selectPerson"),
				oStartDate = Fragment.byId("idCalendDetails", "startDate"),
				oEndDate = Fragment.byId("idCalendDetails", "endDate"),
				oMoreInfoInput = Fragment.byId("idCalendDetails", "moreInfo"),
				oTitleInput = Fragment.byId("idCalendDetails", "inputTitle"),
				oAppointmentType = Fragment.byId("idCalendDetails", "isIntervalAppointment");
			oPersonSelected.setSelectedIndex(iSelectedPersonId);
			oStartDate.setDateValue(oSelectedIntervalStart);
			oEndDate.setDateValue(oSelectedIntervalEnd);
			oMoreInfoInput.setValue(sSelectedInfo);
			oTitleInput.setValue(sSelectedTitle);
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");
			oAppointmentType.setSelected(false);
		},
		_handleSingleAppointment: function (oAppointment) {

			if (oAppointment === undefined) {
				return;
			}
			if (!oAppointment.getSelected()) {
				this._oDetailsPopover.close();
				return;
			}
			if (!this._oDetailsPopover) {

				this._oDetailsPopover = sap.ui.xmlfragment("idCalendDetails", "dma.zcockpit.view.fragment.calendar_details", this);
				this.getView().addDependent(this._oDetailsPopover);
				this._setDetailsDialogContent(oAppointment);
			} else {
				this._setDetailsDialogContent(oAppointment);
			}
		},
		_setDetailsDialogContent: function (oAppointment) {
			var oTextStart = Fragment.byId("idCalendDetails", "startDate"),
				oTextEnd = Fragment.byId("idCalendDetails", "endDate"),
				oAppBindingContext = oAppointment.getBindingContext(),
				oMoreInfo = Fragment.byId("idCalendDetails", "moreInfo"),
				oDetailsPopover = Fragment.byId("idCalendDetails", "detailsPopover");
			this._oDetailsPopover.setBindingContext(oAppBindingContext);
			this._oDetailsPopover.openBy(oAppointment);
			oTextStart.setText(this.formatDate(oAppointment.getStartDate()));
			oTextEnd.setText(this.formatDate(oAppointment.getEndDate()));
			oMoreInfo.setText(oAppointment.getText());
			oDetailsPopover.setTitle(oAppointment.getTitle());
			this._oDetailsPopover.oAppointment = oAppointment;
		},
		formatDate: function (oDate) {
			if (oDate) {
				var iHours = oDate.getHours(),
					iMinutes = oDate.getMinutes(),
					iSeconds = oDate.getSeconds();
				if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
					return DateFormat.getDateTimeInstance({
						style: "medium"
					}).format(oDate);
				} else {
					return DateFormat.getDateInstance({
						style: "medium"
					}).format(oDate);
				}
			}
		},
		_handleGroupAppointments: function (oEvent) {
			var aAppointments, sGroupAppointmentType, sGroupPopoverValue, sGroupAppDomRefId, bTypeDiffer;
			aAppointments = oEvent.getParameter("appointments");
			sGroupAppointmentType = aAppointments[0].getType();
			sGroupAppDomRefId = oEvent.getParameter("domRefId");
			bTypeDiffer = aAppointments.some(function (oAppointment) {
				return sGroupAppointmentType !== oAppointment.getType();
			});
			if (bTypeDiffer) {
				sGroupPopoverValue = aAppointments.length + " Appointments of different types selected";
			} else {
				sGroupPopoverValue = aAppointments.length + " Appointments of the same " + sGroupAppointmentType + " selected";
			}
			if (!this._oGroupPopover) {
				this._oGroupPopover = new Popover({
					title: "Group Appointments",
					content: new Label({
						text: sGroupPopoverValue
					})
				});
			} else {
				this._oGroupPopover.getContent()[0].setText(sGroupPopoverValue);
			}
			this._oGroupPopover.addStyleClass("sapUiPopupWithPadding");
			this._oGroupPopover.openBy(document.getElementById(sGroupAppDomRefId));
		}
	});
});