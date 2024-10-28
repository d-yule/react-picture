import React from "react";

import {Button} from "reactstrap";
import ScanbuyModal, {ModalState} from "./components/ScanbuyModal";
import {QrCodeScannerStore} from "./components/QrCodeScannerStore";
import 'bootstrap/dist/css/bootstrap.min.css';

// Create instances of the MobX stores
const modalStore = ModalState.create({ open: false, title: "Scan QR Code" });
const componentStore = QrCodeScannerStore.create({ scannedData: "" });

const App = () => {
    return (
        <div >
            <Button onClick={() => modalStore.toggle()}>Open QR Scanner Modal</Button>
            {componentStore.qrData && (
                <div>
                    <h2>Scanned Data:</h2>
                    <p>{componentStore.qrData}</p>
                </div>
            )}

            <ScanbuyModal
                modalStore={modalStore}
                componentStore={componentStore}
            />

        </div>
    );
};

export default App;
