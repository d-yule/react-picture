import { types } from "mobx-state-tree";

export const QrCodeScannerStore = types
    .model({
        qrData: types.maybe(types.string),
        previousQrData: types.maybe(types.string),
        isVideoReady: types.optional(types.boolean, false),
        facingMode: types.optional(types.string, "environment"),
    })
    .actions((self) => ({
        setQrData(data) {
            self.qrData = data !== null ? data : undefined; // Use undefined instead of null
        },
        setPreviousQrData(data) {
            self.previousQrData = data !== null ? data : undefined; // Use undefined instead of null
        },
        setIsVideoReady(ready) {
            self.isVideoReady = ready;
        },
        toggleCamera() {
            self.facingMode = self.facingMode === "environment" ? "user" : "environment";
        },
    }));
