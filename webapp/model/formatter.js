sap.ui.define([], function () {
	"use strict";

	return {
		currencyValue: function (sValue) {
			var curr = new Intl.NumberFormat("pt-BR", {
				style: "'currency",
				currency: "BRL",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			if (!sValue) {
				return "";
			}
			return curr.format(sValue);
		},
		currencyValueStr: function (sValue) {
			var curr = new Intl.NumberFormat("pt-BR", {
				style: "'currency",
				currency: "BRL",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			if (!sValue) {
				return "";
			}
			return curr.format(sValue).toString();
		},
		compactCurrencyValue: function (sValue) {
			var curr = new Intl.NumberFormat("pt-BR", {
				style: "'currency",
				currency: "BRL",
				notation: "compact",
				compactDisplay: "short"
			});
			if (!sValue) {
				return "";
			}
			return curr.format(sValue);
		},
		compactCurrencyValueStr: function (sValue) {
			var curr = new Intl.NumberFormat("pt-BR", {
				style: "'currency",
				currency: "BRL",
				notation: "compact",
				compactDisplay: "short"
			});
			if (!sValue) {
				return "";
			}
			return curr.format(sValue).toString();
		},
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
		cnpj: function (nCNPJ) {
			if (!nCNPJ) {
				return "";
			}
			return nCNPJ.slice(-15, -12) + "." +
				nCNPJ.slice(-12, -9) + "." +
				nCNPJ.slice(-9, -6) + "/" +
				nCNPJ.slice(-6, -2) + "-" +
				nCNPJ.slice(-2);
		},
		cidadeUf: function (nCidade, nUF) {
			// if (!nCidade||nUF) { return ""; }
			return nCidade + "/" + nUF;
		},
		compress: function (number) {
			var compact = new Intl.NumberFormat("pt-BR", {
				notation: "compact",
				compactDisplay: "short"
			});
			return compact.format(number);
		},
		float2dig: function (a) {
			var oCalculation = 0;
			if (a === null) {
				oCalculation = 0;
			} else {
				var oValue = a.replace(",", "");
				oCalculation = parseFloat(oValue);
			}
			return oCalculation.toFixed(2);
		},
		float3dig: function (a) {
			var oCalculation = 0;
			if (a === null) {
				oCalculation = 0;
			} else {
				var oValue = a.replace(",", "");
				oCalculation = parseFloat(oValue);
			}
			return oCalculation.toFixed(3);
		},
		percentage2dig: function (a, b) {
			var oCalculation = 0;
			if (a === null) {
				oCalculation = 0;
			} else {
				var oValue1 = a.replace(",", "");
				if (b === null) {
					oCalculation = parseFloat(oValue1);
				} else {
					var oValue2 = b.replace(",", "");
					oCalculation = (parseFloat(oValue1) / parseFloat(oValue2)) * 100;
				}
			}
			return oCalculation.toFixed(2);
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
		multValor1dig: function (a, b) {
			var oCalculation = 0;
			if (a === null) {
				oCalculation = 0;
			} else {
				var oValue1 = a.replace(",", "");
				if (b === null) {
					oCalculation = parseFloat(oValue1);
				} else {
					var oValue2 = b.replace(",", "");
					oCalculation = (parseFloat(oValue1) * parseFloat(oValue2));
				}
			}
			return oCalculation.toFixed(1);
		},
		multValor2dig: function (a, b) {
			var oCalculation = 0;
			if (a === null) {
				oCalculation = 0;
			} else {
				var oValue1 = a.replace(",", "");
				if (b === null) {
					oCalculation = parseFloat(oValue1);
				} else {
					var oValue2 = b.replace(",", "");
					oCalculation = (parseFloat(oValue1) * parseFloat(oValue2));
				}
			}
			return oCalculation.toFixed(2);
		},
		makeRandom: function (sValue) {
			var nro = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
			var div = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
			var calc = nro / div;
			return calc.toFixed(2);
		},
		iconBloqueada: function (sValue) {
			if (sValue === "X") {
				return "sap-icon://message-warning";
			} else {
				return "";
			}
		},
		bloqueadaState: function (sValue) {
			if (sValue === "X") {
				return "Error";
			} else {
				return "None";
			}
		},
		numberState: function (a, b) {
			if (a !== b) {
				return "Warning";
			} else {
				return "None";
			}
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
		dateFormatDdMmYy: function (a) {
			if (a !== null) {
				var b = new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
				a = b.toLocaleString("pt-BR", {
					year: "2-digit",
					month: "2-digit",
					day: "2-digit"
				});
			} else {
				a = "";
			}
			return a;
		},
		dateFormatDdMmYyyy: function (a) {
			if (a !== null) {
				var b = new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
				a = b.toLocaleString("pt-BR", {
					year: '4-digit',
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
					year: '4-digit',
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