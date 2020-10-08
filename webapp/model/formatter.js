sap.ui.define([], function () {
	"use strict";

	return {
		fullNumberStr: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			if (!sValue) {
				return "";
			}
			return number.format(sValue).toString();
		},
		toInteger: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
			if (!sValue) {
				return "0";
			}
			return number.format(sValue);
		},
		toIntegerStr: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
			if (!sValue) {
				return "0";
			}
			return number.format(sValue).toString();
		},
		zeroToEmpty: function (sValue) {

			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
			
			if (sValue === "0" || sValue === 0 || sValue === "0.00" || sValue === 0.00) {
				return "";
			}
			return number.format(sValue).toString(); 
		},
		toIntReqSugStr: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
			if ((!sValue) || (sValue === 0)) {
				return "";
			}
			return number.format(sValue).toString();
		},
		float2digStr: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			if ((!sValue) || (sValue === 0)) {
				return "";
			}
			return number.format(sValue).toString();
		},
		percentage1dig: function (sValue) {
			var number = new Intl.NumberFormat("pt-BR", {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1
			});
			if (!sValue) {
				return "";
			}
			return number.format(sValue).toString();

		},
		dateFormatDdMm: function (a) {
			if (a !== null) {
				var b = new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
				a = b.toLocaleString("pt-BR", {
					month: "2-digit",
					day: "2-digit"
				});
			} else {
				a = "";
			}
			return a;
		},
		dateFormat: function (a) {
			if (a !== null) {
				a = a.toLocaleString("pt-BR", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
			} else {
				a = "";
			}
			return a;
		}
	};
});