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
			this.populateAppointments();
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
		},
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
		},
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
						startDate: new Date(new Date().setHours(7,0,0)),//new Date("2020", "07", "23", "07", "00"),//this.getMonday(),
						people: []
					}

					plannData.people.push({
						appointments: []
					});
					//plannData.people[0].pic = sRootPath + "xxx.png";
					plannData.people[0].name = res.results[0].Nome;

					for (let item of res.results) {
						let dDataBeg = new Date(item.HoraInicio.ms);
						let dDataEnd = new Date(item.HoraFim.ms);

						dDataBeg.setDate(item.Data.getDate());
						dDataBeg.setMonth(item.Data.getMonth());
						dDataBeg.setYear(item.Data.getYear());

						dDataEnd.setDate(item.Data.getDate());
						dDataEnd.setMonth(item.Data.getMonth());
						dDataEnd.setYear(item.Data.getYear());
	debugger;
	let dDateBeg = new Date(new Date(item.Data.toISOString()).setHours(new Date(item.HoraInicio.ms).getHours()));
	let dDateEnd = new Date(new Date(item.Data.toISOString()).setHours(new Date(item.HoraFim.ms).getHours()));
						plannData.people[0].appointments.push({
							start: dDateBeg,
							end: dDateEnd,
							title: item.Name1,
							info: item.Comentario,
							type: "Type02",
							tentative: false
						});
					}
					oModel.setData(plannData);
					console.log(plannData);
					this.byId("MyCalendar").setModel(oModel); //this.getView().setModel(oModel);
				},
				error: (err) => {
					sap.m.MessageBox.error(err, {
						title: "Erro"
					});
					Ï
				}
			});


				oModel.setData({
					startDate: new Date("2020", "06", "15", "07", "00"),
					people: [{
						pic: sRootPath + "/img/mike_wazowsky.png",
						name: "Ederson Menezes",
						role: "comprador",
						appointments: [{
								start: new Date("2020", "06", "15", "08", "30"),
								end: new Date("2020", "06", "15", "09", "30"),
								title: "SADIA S/A",
								type: "Type02",
								tentative: false
							}, {
								start: new Date("2020", "06", "15", "10", "00"),
								end: new Date("2020", "06", "15", "11", "00"),
								title: "BRF S/A",
								//info: "mensal",
								type: "Type01",
								//pic: "sap-icon://sap-ui5",
								tentative: false
							}, {
								start: new Date("2020", "06", "15", "12", "30"),
								end: new Date("2020", "06", "15", "13", "30"),
								title: "Almo\xE7o",
								info: "amigos",
								type: "Type03",
								tentative: true
							}, {
								start: new Date("2020", "06", "15", "14", "00"),
								end: new Date("2020", "06", "15", "15", "00"),
								title: "Saudali S/A",
								type: "Type02",
								tentative: false
							}, {
								start: new Date("2020", "06", "15", "15", "00"),
								end: new Date("2020", "06", "15", "16", "00"),
								title: "Nestl\xE9 S/A",
								//info: "linha nova",
								type: "Type01",
								//pic: "sap-icon://sap-ui5",
								tentative: false
							}, {
								start: new Date("2020", "06", "15", "16", "30"),
								end: new Date("2020", "06", "15", "17", "30"),
								title: "Caf\xE9 3Cora\xE7\xF5es",
								//info: "canteen",
								type: "Type03",
								tentative: true
							}, {
								start: new Date("2020", "06", "15", "17", "45"),
								end: new Date("2020", "06", "15", "18", "00"),
								title: "Caf\xE9 Dom Pedro",
								type: "Type02",
								//pic: "sap-icon://sap-ui5",
								tentative: false
							}] // headers: [{
							// 	start: new Date("2020", "00", "23", "8", "00"),
							// 	end: new Date("2020", "00", "23", "10", "00"),
							// 	title: "Relatório de Despesas",
							// 	type: "Type06"
							// }, {
							// 	start: new Date("2020", "00", "23", "15", "00"),
							// 	end: new Date("2020", "00", "23", "18", "00"),
							// 	title: "Ligar Café do Sítio",
							// 	type: "Type06"
							// }]
					}]
				});
			
			this.byId("MyCalendar").setModel(oModel); //this.getView().setModel(oModel);
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
			var oDateTimePickerStart = Fragment.byId("dialogFrag", "startDate"),
				oDateTimePickerEnd = Fragment.byId("dialogFrag", "endDate");
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
		handleEditButton: function () {
			this._oDetailsPopover.close();
			this.sPath = this._oDetailsPopover.getBindingContext().getPath();
			this._arrangeDialogFragment(this._aDialogTypes[2].type);
		},
		_arrangeDialogFragment: function (iDialogType) {
			if (!this._oNewAppointmentDialog) {
				this._oNewAppointmentDialog = new Fragment.createId("dialogFrag", "zcockpit.view.fragment.calendar_create");
				//this._oNewAppointmentDialog = oDialog;
				this.getView().addDependent(this._oNewAppointmentDialog);
				this._arrangeDialog(iDialogType);
			} else {
				this._arrangeDialog(iDialogType);
			}
			/*Fragment.load({
									id: "dialogFrag",
									name: "zcockpit.view.fragment.calendar_create",
									controller: this
								}).then(function(oDialog) {
									this._oNewAppointmentDialog = oDialog;
									this.getView().addDependent(this._oNewAppointmentDialog);
									this._arrangeDialog(iDialogType);
								}.bind(this));*/
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
			var oAppointmentType = Fragment.byId("dialogFrag", "isIntervalAppointment"),
				oDateTimePickerStart = Fragment.byId("dialogFrag", "startDate"),
				oDateTimePickerEnd = Fragment.byId("dialogFrag", "endDate"),
				oTitleInput = Fragment.byId("dialogFrag", "inputTitle"),
				oMoreInfoInput = Fragment.byId("dialogFrag", "moreInfo"),
				oPersonSelected = Fragment.byId("dialogFrag", "selectPerson");
			//Set the person in the first row as selected.
			oPersonSelected.setSelectedItem(Fragment.byId("dialogFrag", "selectPerson").getItems()[0]);
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
			var aPeople = this.getView().getModel().getProperty("/people/"),
				oSelectedIntervalStart = this.oClickEventParameters.startDate,
				oStartDate = Fragment.byId("dialogFrag", "startDate"),
				oSelectedIntervalEnd = this.oClickEventParameters.endDate,
				oEndDate = Fragment.byId("dialogFrag", "endDate"),
				oDateTimePickerStart = Fragment.byId("dialogFrag", "startDate"),
				oDateTimePickerEnd = Fragment.byId("dialogFrag", "endDate"),
				oAppointmentType = Fragment.byId("dialogFrag", "isIntervalAppointment"),
				oTitleInput = Fragment.byId("dialogFrag", "inputTitle"),
				oMoreInfoInput = Fragment.byId("dialogFrag", "moreInfo"),
				sPersonName, oPersonSelected;
			if (this.oClickEventParameters.row) {
				sPersonName = this.oClickEventParameters.row.getTitle();
				oPersonSelected = Fragment.byId("dialogFrag", "selectPerson");
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
				oDateTimePickerStart = Fragment.byId("dialogFrag", "startDate"),
				oDateTimePickerEnd = Fragment.byId("dialogFrag", "endDate"),
				sSelectedInfo = oAppointment.info,
				sSelectedTitle = oAppointment.title,
				iSelectedPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
				oPersonSelected = Fragment.byId("dialogFrag", "selectPerson"),
				oStartDate = Fragment.byId("dialogFrag", "startDate"),
				oEndDate = Fragment.byId("dialogFrag", "endDate"),
				oMoreInfoInput = Fragment.byId("dialogFrag", "moreInfo"),
				oTitleInput = Fragment.byId("dialogFrag", "inputTitle"),
				oAppointmentType = Fragment.byId("dialogFrag", "isIntervalAppointment");
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
				this._oDetailsPopover = Fragment.createId("zcockpit.view.fragment.calendar_details", "myPopoverFrag");
				this._setDetailsDialogContent(oAppointment);
				/*
										this._oDetailsPopover = Fragment.load({
											id: "myPopoverFrag",
											name: "zcockpit.view.fragment.calendar_details",
											controller: this
										}).then(function(oDialog) {
											this._oDetailsPopover = oDialog;
											this._setDetailsDialogContent(oAppointment);

										}.bind(this)); */
			} else {
				this._setDetailsDialogContent(oAppointment);
			}
		},
		_setDetailsDialogContent: function (oAppointment) {
			var oTextStart = Fragment.byId("myPopoverFrag", "startDate"),
				oTextEnd = Fragment.byId("myPopoverFrag", "endDate"),
				oAppBindingContext = oAppointment.getBindingContext(),
				oMoreInfo = Fragment.byId("myPopoverFrag", "moreInfo"),
				oDetailsPopover = Fragment.byId("myPopoverFrag", "detailsPopover");
			this._oDetailsPopover.setBindingContext(oAppBindingContext);
			this._oDetailsPopover.openBy(oAppointment);
			oTextStart.setText(this.formatDate(oAppointment.getStartDate()));
			oTextEnd.setText(this.formatDate(oAppointment.getEndDate()));
			oMoreInfo.setText(oAppointment.getText());
			oDetailsPopover.setTitle(oAppointment.getTitle());
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