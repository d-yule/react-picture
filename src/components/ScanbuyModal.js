import React from "react";
import {
    Modal,
    ModalBody,
    ModalHeader
} from "reactstrap";
import { types } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import "./ScanBuyCss.css"
import QrCodeScanner from "./QrCodeScanner";


export const ModalState = types.model({
    open: types.maybe(types.boolean),
    title: types.maybe(types.string),
    eventUuid: types.maybe(types.string)
}).volatile(self => ({
})).actions( (self)=>({
    toggle(){
        self.open = !self.open
    },
    handleTitle(title){
        self.title = title
    },
    setEvent(e){
        const eventArr = e.target.value.split(" ")
        self.title = eventArr[0]
        self.eventUuid = eventArr[1]
    },
}))

const ScanbuyModal = observer(({ modalStore, componentStore, size = "", className = "" }) => {
    return (
        <>
            {componentStore.qrData && (
                <div>
                    <h2>Scanned Data:</h2>
                    <p>{componentStore.qrData}</p>
                </div>
            )}
            <Modal
                isOpen={modalStore.open}
                toggle={modalStore.toggle}
                centered
                // size="sm"
                contentClassName="modal-size"
                scrollable
            >
                <ModalHeader toggle={modalStore.toggle}>
                    {modalStore.title}
                </ModalHeader>
                <ModalBody className="text-center m-3">
                    <QrCodeScanner store={componentStore} />
                </ModalBody>
            </Modal>
        </>

    );
});

export default ScanbuyModal;
