"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Party = exports.TransactionStatus = void 0;
/**
 * Enum representing the status of an escrow transaction
 */
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["NoDispute"] = "NoDispute";
    TransactionStatus["WaitingSender"] = "WaitingSender";
    TransactionStatus["WaitingReceiver"] = "WaitingReceiver";
    TransactionStatus["DisputeCreated"] = "DisputeCreated";
    TransactionStatus["Resolved"] = "Resolved";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
/**
 * Enum representing the parties in an escrow transaction
 */
var Party;
(function (Party) {
    Party["Sender"] = "Sender";
    Party["Receiver"] = "Receiver";
})(Party || (exports.Party = Party = {}));
