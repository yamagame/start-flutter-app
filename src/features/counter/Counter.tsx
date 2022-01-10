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

interface BLEDevice {
  name: string;
  id: string;
}

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");
  const [devices, setDevices] = React.useState<{ [index: string]: BLEDevice }>(
    {}
  );

  const incrementValue = Number(incrementAmount) || 0;

  React.useEffect(() => {
    return () => {
      BLE.postMessage({ action: "stop" });
    };
  }, []);

  React.useEffect(() => {
    const recieveBleDevice = (data: any) => {
      if (data && data.payload) {
        const foundDevice = data.payload as BLEDevice;
        if (!devices[foundDevice.id]) {
          const d = { ...devices };
          d[foundDevice.id] = foundDevice;
          setDevices(d);
        }
      }
    };
    BLE.addListener("data", recieveBleDevice);
    return () => {
      BLE.removeListener("data", recieveBleDevice);
    };
  }, [devices]);

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

  const startLEDHander = (deviceId: string) => {
    return () => {
      BLE.postMessage({
        action: "connect",
        deviceId,
        payload: JSON.stringify({ action: "on", duration: "10" }),
      });
    };
  };

  return (
    <div>
      <div className={styles.row}>V9</div>
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
      {Object.entries(devices).map(([key, device]) => (
        <p onClick={startLEDHander(key)}>
          {key} : {device.name}
        </p>
      ))}
    </div>
  );
}
