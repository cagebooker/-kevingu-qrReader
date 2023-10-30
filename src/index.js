import React, { useState, useCallback, useEffect, memo } from "react";
import { ReactSVG } from "react-svg";
import QrReader from "react-qr-scanner";
import useSound from 'use-sound';

import Spinner from 'react-bootstrap/Spinner';

const qrReader = memo((props) => {
    const [scanResultStatus, setScanResultStatus] = useState('normal');   // normal, wait, error, success, warning
    const [scanResultList, setScanResultList] = useState('');  // 編號、條碼號、時間、狀態
    const [scanResultSuccessNumber, setScanResultSuccessNumber] = useState(1);
    const [asynchronous, setAsynchronous] = useState(false);

    const [playSuccess] = useSound(process.env.PUBLIC_URL + "/assets/music/entryScan-success.mp3");
    const [playError] = useSound(process.env.PUBLIC_URL + "/assets/music/entryScan-error.mp3");

    const getCurrentDateTime = () => {
        const date = new Date();
        const utcOffset = 8; // UTC+8
        // 設定時區偏移
        date.setUTCHours(date.getUTCHours() + utcOffset);
        // 獲取年、月、日、時、分、秒
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        // 格式化時間
        const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
    };

    const handleScan = useCallback(async (data) => {
        if(data) {
            if(scanResultStatus !== 'normal') return;
            setScanResultStatus('wait');
            const newScanResult = {
                serialNumber: scanResultSuccessNumber<10?`0${scanResultSuccessNumber}`:scanResultSuccessNumber,
                code: data.text,
                time: getCurrentDateTime(),
            };
            setScanResultList([newScanResult, ...scanResultList]);
            setScanResultSuccessNumber(scanResultSuccessNumber >= 99 ? 1 : scanResultSuccessNumber+1 );
            setAsynchronous(true);
        };
    }, [scanResultStatus, scanResultList, scanResultSuccessNumber, setScanResultStatus]);
    
    const handleError = useCallback((err) => {
        if(err) console.log(err)
    }, []);

    useEffect(() => {
        if(asynchronous){
            props.data(scanResultList);
            setScanResultStatus('wait');
            setAsynchronous(false);
        };
    }, [scanResultStatus, asynchronous, props, scanResultList, setAsynchronous, setScanResultStatus]);


    useEffect(() => {
        const setStatusWithDelay = (status, playSound) => {
            setScanResultStatus(status);
            if (playSound) playSound();
            if (status !== 'normal' && status !== 'wait') {
                setTimeout(() => {
                    setScanResultStatus('normal');
                    props.setStatus('normal');
                }, 3000);
            }
        };
        switch(props.status) {
            case 'normal':
                setScanResultStatus('normal');
                break;
            case 'wait':
                setStatusWithDelay('wait', null);
                break;
            case 'success':
                setStatusWithDelay('success', playSuccess);
                break;
            case 'warning':
                setStatusWithDelay('warning', playError);
                break;
            default:
                setStatusWithDelay('error', playError);
                break;
        }
    }, [props, playSuccess, playError]);
    


    return (
        <div>測試用</div>
    )
});

// 匯出函式
module.exports = qrReader;