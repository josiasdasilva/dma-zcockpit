sap.ui.define([
	"dma/zcockpit/controller/BaseController",
	"sap/m/Label",
	"sap/m/Popover",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, Label, Popover, DateFormat, Fragment, JSONModel, MessageToast) {
	"use strict";
	//var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
	return BaseController.extend("dma.zcockpit.controller.Home", {
		_planningCalendar: null,
		_aDialogTypes: null,
		sUname: '',
		sEkgrp: '',
		_idAppntOverSeven: null,
		onInit: function () {
			this._idAppntOverSeven = this.byId("idAppntOverSeven");
			this._planningCalendar = this.byId("MyCalendar");
			this._aDialogTypes = [{
				title: this.getText('create_appointment'),
				type: "create_appointment"
			}, {
				title: this.getText('create_appointment'),
				type: "create_appointment_with_context"
			}, {
				title: this.getText('edit_appointment'),
				type: "edit_appointment"
			}];
			this.getOwnerComponent().getModel().setSizeLimit(9999);

			this.sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9067001" : sap.ushell.Container //9066004
				.getUser().getId();

			this.getRouter().getRoute("home").attachPatternMatched(this._onMasterMatched, this);
			/* busca imagem */
			var sRootPath = jQuery.sap.getModulePath("dma.zcockpit");
			var sImagePath = sRootPath + "/img/background_cockpit.png";
			this.byId("img_epa").setSrc(sImagePath); /* popula dados da Agenda */
			//this.loadAppointments();
			this.loadUserData();
		},
		loadUserData: function () {
			var globalModel = this.getModel("globalModel");
			this.getOwnerComponent().getModel().read(`/Usuario`, {
				//this.getOwnerComponent().getModel().read(`/Usuario('${this.sUname }')`, {
				success: (res) => {
					this.aEkgrp = [];
					for (let usrGrp of res.results) {
						this.sEkgrp = usrGrp.Ekgrp;
						this.aEkgrp.push(usrGrp.Ekgrp);
						this.sUname = usrGrp.Uname;
						this.sUserName = usrGrp.Nome
					}

				},
				error: (err) => {
					MessageToast.show(this.getText('msg_error_loadUser_data'));
				}
			});
		},
		_onMasterMatched: function (oEvent) {
			//this._buscaLogadoSync();
			this.loadAppointments();
			localStorage.removeItem('sortConfig');
			localStorage.removeItem('sortConfigcompraTableHeader');
			localStorage.removeItem('sortConfigvendaTableHeader');
			localStorage.removeItem('sortConfigfaceamentoTableHeader');
		},
		handleNavDate: function (oEvt) {
			this._validateAppointmentOver18(oEvt.getSource().mProperties.startDate);
		},
		_validateAppointmentOver18: function (dDateRef) {
			let dtStrRef = dDateRef.toDateString();

			let bHasValueOver18 = this._planningCalendar.getModel().oData.people[0].appointments.some((item) => {
				return dtStrRef === item.start.toDateString() && item.start.getHours() > 18
			})
			this._idAppntOverSeven.setVisible(bHasValueOver18);
		},
		_buscaLogado: function () {
			var globalModel = this.getModel("globalModel");
			var localModel = this.getModel();
			var sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9066004" : sap.ushell.Container //9066004
				.getUser().getId();
			var sObjectPath = localModel.createKey("/Usuario", {
				Uname: sUname
			});
			localModel.read(sObjectPath, {
				method: "GET",
				success: function (oData2, oResponse) {
					globalModel.setProperty("/Ekgrp", oData2.Ekgrp);
					globalModel.setProperty("/Uname", oData2.Uname);
					globalModel.setProperty("/Nome", oData2.Nome);
				}.bind(this),
				error: function (oError) {}
			});
		},
		_buscaLogadoSync: function () {
			sap.ui.core.BusyIndicator.show(0);
			return new Promise((resolve, reject) => {
				var globalModel = this.getModel("globalModel");
				var localModel = this.getModel();
				var sUname = window.location.href.includes("localhost") || window.location.href.includes("webide") ? "9067001" : sap.ushell.Container //9066004
					.getUser().getId();
				var sObjectPath = localModel.createKey("/Usuario", {
					Uname: sUname
				});
				localModel.read(sObjectPath, {
					method: "GET",
					success: function (oData2, oResponse) {
						globalModel.setProperty("/Ekgrp", oData2.Ekgrp);
						globalModel.setProperty("/Uname", oData2.Uname);
						globalModel.setProperty("/Nome", oData2.Nome);
						sap.ui.core.BusyIndicator.hide();
						resolve([oData2.Ekgrp, oData2.Uname, oData2.Nome]);
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
			var sNome = globalModel.getProperty("/Nome");
			if (sEkgrp === undefined || sNome === undefined) {
				this._buscaLogadoSync().then((res) => {
					this.getRouter().navTo("historico", {
						Ekgrp: res[0],
						Nome: res[2]
					}, true);
				})
			} else {
				this.getRouter().navTo("historico", {
					Ekgrp: sEkgrp,
					Nome: sNome
				}, true);
			}
		},
		onPressDisplayContract: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZZContract",
					action: "display"
				},
				params: {
					"contract": ''
				}
			})) || ""; // generate the Hash to display a Supplier
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application
		},
		onPressChangeContract: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZZContract",
					action: "change"
				},
				params: {
					"contract": ''
				}
			})) || ""; // generate the Hash to display a Supplier
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application
		},
		goToPedidos: function (oEvt) {

			var oAppnt = this._planningCalendar.getModel().getProperty(this._oDetailsPopover.oAppointment.getBindingContext().sPath);

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
		// onBtnCommodPress: function (oEvent) {
		// 	var globalModel = this.getModel("globalModel");
		// 	var sEkgrp = globalModel.getProperty("/Ekgrp");
		// 	var sUname = globalModel.getProperty("/Uname");
		// 	if (sEkgrp === undefined || sUname === undefined) {
		// 		this._buscaLogadoSync().then((res) => {
		// 			this.getRouter().navTo("commod_busca", {
		// 				Ekgrp: res[0],
		// 				Uname: res[1]
		// 			}, true);
		// 		})
		// 	} else {
		// 		this.getRouter().navTo("commod_busca", {
		// 			Ekgrp: sEkgrp,
		// 			Uname: sUname
		// 		}, true);
		// 	}
		// },
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
		getMonday: function () {
			let d = new Date();
			var day = d.getDay(),
				diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
			return new Date(d.setDate(diff));
		},
		saveAppointment: function (oDataJson) {
			return new Promise((resolve, reject) => {
				this.getOwnerComponent().getModel().createEntry("/AgendaItem", {
					groupId: "createGroup",
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
				this.getOwnerComponent().getModel().remove(`/AgendaItem('${sId}')`, {
					success: (res) => {
						resolve(res);
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		},
		updateAppointment: function (sId, oDataJson) {
			return new Promise((resolve, reject) => {
				this.getOwnerComponent().getModel().update(`/AgendaItem('${sId}')`, oDataJson, {
					success: (res) => {
						resolve(res);
					},
					error: (err) => {
						reject(err);
					}
				});
			});
		},
		loadAppointments: function (dStartDate) {
			var oModel = new JSONModel();
			var sRootPath = jQuery.sap.getModulePath("zcockpit");

			let aFilters = [];
			aFilters.push(new sap.ui.model.Filter({
				path: "Usuario",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.sUname
			}));
			this._planningCalendar.setBusy(true);
			this.getOwnerComponent().getModel().read("/AgendaItem", {
				filters: aFilters,
				success: (res) => {

					let plannData = {
						startDate: dStartDate ? dStartDate : new Date(new Date().setHours(7, 0, 0)),
						people: []
					}

					plannData.people.push({
						appointments: []
					});

					if (res.results.length === 0) {
						this._planningCalendar.setBusy(false);
						//Creates dummy line
						plannData.people[0].name = this.sUserName;
						oModel.setData(plannData);
						console.log(plannData);
						this._planningCalendar.setModel(oModel);
						this._planningCalendar.setBusy(false);
						this._validateAppointmentOver18(plannData.startDate);
						return;
					}

					//plannData.people[0].pic = sRootPath + "xxx.png";
					plannData.people[0].name = res.results[0].Nomecomprador;
					plannData.people[0].ekgrp = res.results[0].Grpcompradores;

					for (let item of res.results) {

						plannData.people[0].appointments.push({
							Zuuid: item.Zuuid,
							start: item.Dthrinicio,
							end: item.Dthrfim,
							title: item.Nomefornecedor,
							info: item.Comentario,
							type: "Type02",
							lifnr: item.Fornecedor,
							ekgrp: item.Grpcompradores,
							Usuario: item.Usuario,
							tentative: false
						});
					}
					oModel.setData(plannData);
					console.log(plannData);
					this._planningCalendar.setModel(oModel);
					this._planningCalendar.setBusy(false);
					this._validateAppointmentOver18(plannData.startDate);
				},
				error: (err) => {
					this._planningCalendar.setBusy(false);
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
				sPath = "/people/" + Fragment.byId("idCalendCreate", "selectPerson").getSelectedIndex().toString(),
				oPersonAppointments;
			if (Fragment.byId("idCalendCreate", "isIntervalAppointment").getSelected()) {
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
			this._arrangeidCalendCreatement(this._aDialogTypes[0].type);
		},
		handleAppointmentAddWithContext: function (oEvent) {

			this.currentPeople = this._planningCalendar.getModel().getProperty(oEvent.mParameters.row.getBindingContext().sPath);

			this.oClickEventParameters = oEvent.getParameters();
			this._arrangeidCalendCreatement(this._aDialogTypes[1].type);
		},
		_validateDateTimePicker: function (oDateTimePickerStart, oDateTimePickerEnd) {
			var oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				sValueStateText = this.getText('begin_bigger_end'); //"Start date should be before End date";
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
			/*			var oStartDate = Fragment.byId("idCalendCreate", "startDate"),
							oEndDate = Fragment.byId("idCalendCreate", "endDate"),
							bEnabled = oStartDate.getValueState() !== "Error" && oStartDate.getValue() !== "" && oEndDate.getValue() !== "" && oEndDate.getValueState() !==
							"Error";
						this._oNewAppointmentDialog.getBeginButton().setEnabled(bEnabled);*/
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
		handleRemoveAppointment: function () {

			let sZuuid = this._planningCalendar.getModel().getProperty(this._oDetailsPopover.oAppointment.getBindingContext().sPath).Zuuid
			sap.m.MessageBox.confirm(
				this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("mgrview_delete"), {
					onClose: (sAction) => {
						if ("OK" === sAction) {
							this.deleteAppointment(sZuuid)
								.then((res) => {
									MessageToast.show(this.getText("msg_success_delete_appointment"));
									this.loadAppointments(this._planningCalendar.getStartDate());
								})
								.catch((err) => {
									MessageToast.show(this.getText("msg_error_delete_appointment"));
								})
						}
					}
				}
			);
		},
		handleEditButton: function () {
			this._oDetailsPopover.close();
			this.sPath = this._oDetailsPopover.getBindingContext().getPath();
			this._arrangeidCalendCreatement(this._aDialogTypes[2].type);
		},
		_arrangeidCalendCreatement: function (iDialogType) {
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
			var sFragName = "idCalendCreate",
				oAppointmentType = Fragment.byId(sFragName, "isIntervalAppointment");
			oAppointmentType.setSelected(oEvent.getSource().getSelected());
		},
		handleDialogCancelButton: function () {
			this.clearEditCreateAppointmentDialog();
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
			var sPersonId = Fragment.byId("idCalendCreate", "selectPerson").getSelectedIndex().toString();
			this._removeAppointment(this._oNewAppointmentDialog.getModel().getProperty(this.sPath), sPersonId);
			this._addNewAppointment({
				start: oAppointment.start,
				end: oAppointment.end,
				title: oAppointment.title,
				type: oAppointment.type
			});
		},
		getEditCreateFields: function () {
			return {
				startDate: Fragment.byId("idCalendCreate", "startDate"),
				endDate: Fragment.byId("idCalendCreate", "endDate"),
				moreInfo: Fragment.byId("idCalendCreate", "moreInfo"),
				fornecedorInput: Fragment.byId("idCalendCreate", "fornecedorInput")
			};
		},
		clearEditCreateAppointmentDialog: function () {
			this.getEditCreateFields().startDate.setDateValue(null);
			this.getEditCreateFields().endDate.setDateValue(null);
			this.getEditCreateFields().moreInfo.setValue('');
			this.getEditCreateFields().fornecedorInput.setValue('');
			this.getEditCreateFields().fornecedorInput.setDescription('');
			this.getEditCreateFields().startDate.setValueState(sap.ui.core.ValueState.None);
			this.getEditCreateFields().endDate.setValueState(sap.ui.core.ValueState.None);
			this.getEditCreateFields().moreInfo.setValueState(sap.ui.core.ValueState.None);
			this.getEditCreateFields().fornecedorInput.setValueState(sap.ui.core.ValueState.None);
		},
		validateEditCreateAppointmentDialog: function () {
			if (!this.getEditCreateFields().startDate.getDateValue()) {
				this.getEditCreateFields().startDate.setValueState(sap.ui.core.ValueState.Error);
				this.getEditCreateFields().startDate.setValueStateText(this.getText('required'));
				return false;
			} else {
				this.getEditCreateFields().startDate.setValueState(sap.ui.core.ValueState.None);
			}
			if (!this.getEditCreateFields().endDate.getDateValue()) {
				this.getEditCreateFields().endDate.setValueState(sap.ui.core.ValueState.Error);
				this.getEditCreateFields().endDate.setValueStateText(this.getText('required'));
				return false;
			} else {
				this.getEditCreateFields().endDate.setValueState(sap.ui.core.ValueState.None);
			}

			if (this.getEditCreateFields().endDate.getDateValue() < this.getEditCreateFields().startDate.getDateValue()) {
				this.getEditCreateFields().startDate.setValueState(sap.ui.core.ValueState.Error);
				this.getEditCreateFields().startDate.setValueStateText(this.getText('begin_bigger_end'));
				this.getEditCreateFields().endDate.setValueState(sap.ui.core.ValueState.Error);
				this.getEditCreateFields().endDate.setValueStateText(this.getText('begin_bigger_end'));
				return false;
			} else {
				this.getEditCreateFields().startDate.setValueState(sap.ui.core.ValueState.None);
				this.getEditCreateFields().endDate.setValueState(sap.ui.core.ValueState.None);
			}
			if (!this.getEditCreateFields().fornecedorInput.getValue() || this.getEditCreateFields().fornecedorInput.getValue().lenght === 0) {
				this.getEditCreateFields().fornecedorInput.setValueState(sap.ui.core.ValueState.Error);
				this.getEditCreateFields().fornecedorInput.setValueStateText(this.getText('required'));
				return false;
			} else {
				this.getEditCreateFields().fornecedorInput.setValueState(sap.ui.core.ValueState.None);
			}

			return true;
		},
		handleDialogSaveButton: function () {

			if (!this.validateEditCreateAppointmentDialog()) {
				MessageToast.show(this.getText("msg_error_data_incomplete"));
				return;
			}

			var sInfoValue = Fragment.byId("idCalendCreate", "moreInfo").getValue(),
				sInputTitle = Fragment.byId("idCalendCreate", "inputTitle").getValue(),
				sLifnr = Fragment.byId("idCalendCreate", "fornecedorInput").getValue(),
				sLifnrDescr = Fragment.byId("idCalendCreate", "fornecedorInput").getDescription(),
				bIsIntervalAppointment = Fragment.byId("idCalendCreate", "isIntervalAppointment").getSelected();

			if (this.getEditCreateFields().startDate.getValueState() !== "Error" && this.getEditCreateFields().endDate.getValueState() !==
				"Error") {
				if (this.sPath && this._oNewAppointmentDialog._sDialogType === "edit_appointment") {

					let updAppointment = {
						Grpcompradores: this.sEkgrp,
						Fornecedor: sLifnr,
						Nomefornecedor: sLifnrDescr,
						Comentario: sInfoValue,
						Usuario: this.sUname,
						Dthrinicio: this.getEditCreateFields().startDate.getDateValue(),
						Dthrfim: this.getEditCreateFields().endDate.getDateValue(),
						Modificador: this.sUname
					};

					var oAppointment = this._planningCalendar.getModel().getProperty(this._oDetailsPopover.oAppointment.getBindingContext().sPath);

					this.updateAppointment(oAppointment.Zuuid, updAppointment)
						.then((res) => {
							MessageToast.show(this.getText("msg_success_edit_appointment"));
							this.loadAppointments(this._planningCalendar.getStartDate());
						})
						.catch((err) => {
							MessageToast.show(this.getText("msg_error_edit_appointment"));
						});

				} else {

					let newAppointment = {
						Grpcompradores: this.sEkgrp,
						Fornecedor: sLifnr,
						Nomefornecedor: sLifnrDescr,
						Comentario: sInfoValue,
						Usuario: this.sUname,
						Dthrinicio: this.getEditCreateFields().startDate.getDateValue(),
						Dthrfim: this.getEditCreateFields().endDate.getDateValue(),
						Modificador: this.sUname
					};

					this.saveAppointment(newAppointment)
						.then((res) => {
							MessageToast.show(this.getText("msg_success_create_appointment"));
							this.loadAppointments(this._planningCalendar.getStartDate());
						})
						.catch((err) => {
							MessageToast.show(this.getText("msg_error_create_appointment"));
						});
				}

				this.clearEditCreateAppointmentDialog();
				this._oNewAppointmentDialog.close();
			}
		},
		_appointmentOwnerChange: function () {
			var iSpathPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
				iSelectedPerson = Fragment.byId("idCalendCreate", "selectPerson").getSelectedIndex(),
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
				oPersonSelected = Fragment.byId("idCalendCreate", "fornecedorInput");
			//Set the person in the first row as selected.
			//oPersonSelected.setSelectedItem(Fragment.byId("idCalendCreate", "selectPerson").getItems()[0]);
			this.currentPeople = this._planningCalendar.getModel().getProperty(this._planningCalendar.getRows()[0].getBindingContext().sPath);
			oDateTimePickerStart.setValue("");
			oDateTimePickerEnd.setValue("");
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");
			oTitleInput.setValue("");
			oMoreInfoInput.setValue("");
			oAppointmentType.setSelected(false);
			//this.updateButtonEnabledState();
		},
		_setCreateWithContextAppointmentDialogContent: function (oAppnt) {
			//this.getView().getModel().getProperty("/people/"),
			var aPeople = this._planningCalendar.getModel().oData.people,
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
			/*			if (this.oClickEventParameters.row) {
							sPersonName = this.oClickEventParameters.row.getTitle();
							oPersonSelected = Fragment.byId("idCalendCreate", "selectPerson");
							oPersonSelected.setSelectedIndex(aPeople.indexOf(aPeople.filter(function (oPerson) {
								return oPerson.name === sPersonName;
							})[0]));
						}*/
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
			var oAppointment = this._planningCalendar.getModel().getProperty(this._oDetailsPopover.oAppointment.getBindingContext().sPath),
				oSelectedIntervalStart = oAppointment.start,
				oSelectedIntervalEnd = oAppointment.end,
				oDateTimePickerStart = Fragment.byId("idCalendCreate", "startDate"),
				oDateTimePickerEnd = Fragment.byId("idCalendCreate", "endDate"),
				sSelectedInfo = oAppointment.info,
				sSelectedTitle = oAppointment.title,
				iSelectedPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
				oFornecedorInput = Fragment.byId("idCalendCreate", "fornecedorInput"),
				oStartDate = Fragment.byId("idCalendCreate", "startDate"),
				oEndDate = Fragment.byId("idCalendCreate", "endDate"),
				oMoreInfoInput = Fragment.byId("idCalendCreate", "moreInfo"),
				oTitleInput = Fragment.byId("idCalendCreate", "inputTitle"),
				oAppointmentType = Fragment.byId("idCalendCreate", "isIntervalAppointment");
			oFornecedorInput.setValue(oAppointment.lifnr);
			oFornecedorInput.setDescription(oAppointment.title);
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
		},
		onF4Fornecedor: function (oEvent) {

			var sInputValue = oEvent.getSource().getDescription();
			//var sEkgrp = this.currentPeople.ekgrp; //this.byId("compradorInput").getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._F4fornecedorDialog) {
				this._F4fornecedorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.fornecedor", this);
				this.getView().addDependent(this._F4fornecedorDialog);
			}

			let oEkgrpFilter = [];
			for (let sEkgrp of this.aEkgrp) {
				oEkgrpFilter.push(new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase()))
			}
			var oFilter = new Array(new sap.ui.model.Filter({
				filters: oEkgrpFilter,
				and: false
			}));

			// set previous filter - if comprador is filled
			//var oFilter = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
			// open value help dialog filtered by the input value
			this._F4fornecedorDialog.getBinding("items").filter([oFilter]);
			this._F4fornecedorDialog.open(sInputValue);
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
				//var fornecedorInput = this.getView().byId(this.inputId);
				//fornecedorInput.setValue(oSelectedItem.getTitle());
				let fornecedorInput = Fragment.byId("idCalendCreate", "fornecedorInput");
				fornecedorInput.setValue(oSelectedItem.getTitle());
				fornecedorInput.setDescription(oSelectedItem.getDescription());
				//this.clearContrato(oEvent);
			}
			oEvent.getSource().getBinding("items").filter([]);
			//this.habilitaBotaoPedido();
		}
	});
});