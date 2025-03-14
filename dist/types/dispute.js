"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeStatus = exports.Ruling = void 0;
/**
 * Enum representing possible rulings in a dispute
 */
var Ruling;
(function (Ruling) {
    Ruling[Ruling["RefusedToRule"] = 0] = "RefusedToRule";
    Ruling[Ruling["SenderWins"] = 1] = "SenderWins";
    Ruling[Ruling["ReceiverWins"] = 2] = "ReceiverWins";
})(Ruling || (exports.Ruling = Ruling = {}));
/**
 * Enum representing the status of a dispute
 */
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["Waiting"] = "Waiting";
    DisputeStatus["Appealable"] = "Appealable";
    DisputeStatus["Solved"] = "Solved";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
