import React, { useState } from "react";
import EventEmitter from "events";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from "./counterSlice";
import styles from "./Counter.module.css";

interface BluetoothChannel {
  postMessage: (message: any) => void;
  receiveMessage: (message: string) => void;
}

interface NFCChannel {
  postMessage: (message: any) => void;
  receiveMessage: (message: string) => void;
}

const applicationEvent = new EventEmitter();

const BLE: BluetoothChannel = (window as any)["SmartLED_BLE"];
const NFC: NFCChannel = (window as any)["SmartLED_NFC"];

if (BLE) {
  BLE.receiveMessage = (message) => {
    console.log("ble2", message);
    const msg = JSON.parse(message);
    applicationEvent.emit("ble", msg);
  };
}

if (BLE) {
  NFC.receiveMessage = (message) => {
    console.log("nfc2", message);
    const msg = JSON.parse(message);
    applicationEvent.emit("nfc", msg);
  };
}

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");

  const incrementValue = Number(incrementAmount) || 0;

  React.useEffect(() => {
    const BLEScan = (message: any) => {
      console.log(`ble`, JSON.stringify(message));
    };
    const NFCScan = (message: any) => {
      console.log(`nfc`, JSON.stringify(message));
    };
    applicationEvent.on("ble", BLEScan);
    applicationEvent.on("nfc", NFCScan);
    return () => {
      applicationEvent.removeListener("ble", BLEScan);
      applicationEvent.removeListener("nfc", NFCScan);
    };
  }, []);

  const StartBLE = () => {
    const msg = JSON.stringify({ action: "start" });
    console.log("ScanBLE", msg);
    if (BLE) {
      BLE.postMessage(msg);
    }
  };

  const StopBLE = () => {
    const msg = JSON.stringify({ action: "stop" });
    console.log("StopBLE", msg);
    if (BLE) {
      BLE.postMessage(msg);
    }
  };

  const ScanNFC = () => {
    const msg = JSON.stringify({ action: "start" });
    console.log("ScanNFC", msg);
    if (NFC) {
      NFC.postMessage(msg);
    }
  };

  return (
    <div>
      <div className={styles.row}>
        V2
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={StartBLE}
        >
          Start BLE
        </button>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={StopBLE}
        >
          Stop BLE
        </button>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={ScanNFC}
        >
          Scan NFC
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(incrementAsync(incrementValue))}
        >
          Add Async
        </button>
        <button
          className={styles.button}
          onClick={() => dispatch(incrementIfOdd(incrementValue))}
        >
          Add If Odd
        </button>
      </div>
    </div>
  );
}
