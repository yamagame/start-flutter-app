import React, { useState } from "react";

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
  scanDevice: (deviceName: string, deviceId: string) => void;
}

interface NFCChannel {
  postMessage: (message: any) => void;
  discoverd: (tag: string) => void;
}

const BLE: BluetoothChannel = (window as any)["SmartLED_BLE"];
const NFC: NFCChannel = (window as any)["SmartLED_NFC"];

if (BLE) {
  BLE.scanDevice = (deviceName, deviceId) => {
    console.log(`BLE.scanDevice : ${deviceName}, ${deviceId}`);
  };
}

if (BLE) {
  NFC.discoverd = (tag) => {
    console.log(`NFC.discoverd : ${tag}`);
  };
}

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");

  const incrementValue = Number(incrementAmount) || 0;

  const ScanBLE = () => {
    console.log("ScanBLE");
    if (BLE) {
      BLE.postMessage({ action: "scan", count });
    }
  };

  const ScanNFC = () => {
    console.log("ScanNFC");
    if (NFC) {
      NFC.postMessage({ action: "scan", count });
    }
  };

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={ScanBLE}
        >
          Scan BLE
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
