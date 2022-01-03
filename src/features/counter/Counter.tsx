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

// interface BluetoothChannel {
//   postMessage: (message: any) => void;
//   receiveMessage: (message: string) => void;
// }

// interface NFCChannel {
//   postMessage: (message: any) => void;
//   receiveMessage: (message: string) => void;
// }

interface ApplicationCannnel {
  postMessage: (message: string) => void;
  receiveMessage: (message: string) => void;
}

class ApplicationEmitter extends EventEmitter {
  channel: ApplicationCannnel;
  constructor(channel: ApplicationCannnel) {
    super();
    this.channel = channel;
  }
  postMessage = (message: any) => {
    const msg = JSON.stringify(message);
    console.log(msg);
    if (this.channel) {
      this.channel.postMessage(msg);
    }
  };
}

const SmartLED_BLE: ApplicationCannnel = (window as any)["SmartLED_BLE"];
const SmartLED_NFC: ApplicationCannnel = (window as any)["SmartLED_NFC"];

export const BLE: ApplicationEmitter = new ApplicationEmitter(SmartLED_BLE);
export const NFC: ApplicationEmitter = new ApplicationEmitter(SmartLED_NFC);

if (SmartLED_BLE) {
  SmartLED_BLE.receiveMessage = (message) => {
    const msg = JSON.parse(message);
    BLE.emit("data", msg);
  };
}

if (SmartLED_NFC) {
  SmartLED_NFC.receiveMessage = (message) => {
    const msg = JSON.parse(message);
    NFC.emit("data", msg);
  };
}

// const applicationEvent = new EventEmitter();

// const BLE: BluetoothChannel = (window as any)["SmartLED_BLE"];
// const NFC: NFCChannel = (window as any)["SmartLED_NFC"];

// if (BLE) {
//   BLE.receiveMessage = (message) => {
//     console.log("ble2", message);
//     const msg = JSON.parse(message);
//     applicationEvent.emit("ble", msg);
//   };
// }

// if (BLE) {
//   NFC.receiveMessage = (message) => {
//     console.log("nfc2", message);
//     const msg = JSON.parse(message);
//     applicationEvent.emit("nfc", msg);
//   };
// }

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
    BLE.on("data", BLEScan);
    NFC.on("data", NFCScan);
    return () => {
      BLE.removeListener("ble", BLEScan);
      NFC.removeListener("nfc", NFCScan);
    };
  }, []);

  const StartBLE = () => {
    BLE.postMessage({ action: "start" });
  };

  const StopBLE = () => {
    BLE.postMessage({ action: "stop" });
  };

  const ScanNFC = () => {
    NFC.postMessage({ action: "start" });
  };

  const Reload = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className={styles.row}>V7</div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={Reload}
        >
          Reload
        </button>
      </div>
      <div className={styles.row}>
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
