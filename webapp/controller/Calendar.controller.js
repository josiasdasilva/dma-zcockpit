sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Device, Fragment, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("dma.zcockpit.controller.Calendar", {
		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date("2019", "12", "08", "8", "0"),
				people: [{
					name: "Max Mustermann",
					appointments: [{
						start: new Date("2019", "12", "10", "10", "0"),
						end: new Date("2019", "12", "10", "12", "0"),
						title: "Reunião Equipe",
						info: "sala 1",
						type: "Type01",
						pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: new Date("2019", "12", "11", "8", "0"),
						end: new Date("2019", "12", "11", "18", "00"),
						title: "Vilma",
						info: "Visita Externa",
						type: "Type02",
						tentative: false
					}, {
						start: new Date("2019", "12", "12", "9", "0"),
						end: new Date("2019", "12", "12", "9", "59"),
						title: "BRF S/A",
						info: "",
						type: "Type03",
						tentative: false
					}, {
						start: new Date("2019", "12", "12", "10", "0"),
						end: new Date("2019", "12", "12", "10", "59"),
						title: "BRF S/A",
						info: "",
						type: "Type03",
						tentative: false
					}, {
						start: new Date("2019", "12", "12", "11", "0"),
						end: new Date("2019", "12", "12", "11", "59"),
						title: "BRF S/A",
						info: "",
						type: "Type03",
						tentative: false
					}],
					headers: [{
						start: new Date("2019", "12", "08", "0", "0"),
						end: new Date("2019", "12", "08", "23", "59"),
						title: "Rosenmontag",
						type: "Type04"
					}, {
						start: new Date("2019", "12", "10", "0", "0"),
						end: new Date("2019", "12", "10", "23", "59"),
						title: "Aschermittwoch",
						type: "Type04"
					}]
				}]
			});
			this.getView().setModel(oModel);

		},

		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (oAppointment) {
				//alert("Appointment selected: " + oAppointment.getTitle());
			} else {
				//var aAppointments = oEvent.getParameter("appointments");
				//var sValue = aAppointments.length + " Appointments selected";
				//alert(sValue);
			}
		},

		handleIntervalSelect: function (oEvent) {
			//var oPC = oEvent.oSource;
			var oStartDate = oEvent.getParameter("startDate");
			var oEndDate = oEvent.getParameter("endDate");
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
			var oAppointment = {
				start: oStartDate,
				end: oEndDate,
				title: "new appointment",
				type: "Type09"
			};

			oData.people[0].appointments.push(oAppointment);
			oModel.setData(oData);
		}

	});
});