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
        <div className="d-flex align-items-center justify-content-center flex-column">
            <div className="d-flex align-items-center justify-content-center flex-column" style={{background:"rgba(217, 217, 217, 0)", width:"330px", height:`${props.height}px`, borderRadius:"10px", margin:"0px", position: 'relative'}}>
                {scanResultStatus === 'normal' ?
                <div>
                    <QrReader
                        style={{ width: `${props.width}px`, height: `${props.height}px`, objectFit: 'cover', background:"black", marginTop: '8px'}}
                        onError={err => handleError(err)}
                        onScan={data => handleScan(data)}
                        delay={100}
                        constraints={
                            // window.innerWidth > 768 
                            window.innerWidth > 1280 
                            ? undefined
                            : {
                                video: {
                                    facingMode: { exact: `environment` }
                                }
                            }
                        } 
                    />

                    { scanResultStatus === 'normal' && (
                        <div style={{
                            background:"rgba(102, 252, 241, 0.7)", 
                            height:"5px", 
                            width:`${props.width}px`, 
                            borderRadius:"10px", 
                            position:"absolute", 
                            bottom: '0', 
                            animation: "moveUpDown 3s ease-in-out infinite"
                        }}></div>
                    )}
                </div>
                 : 
                <div style={{ width: `${props.width}px`, height: `${props.height}px`, background:"black"}}>
                    {scanResultStatus === 'wait' &&(
                        <div className="d-flex align-items-center justify-content-center flex-column" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <div style={{ width: `${props.width}px`, height: `${props.height}px`, background:"black", display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Spinner animation="border" variant="light"/>
                            </div>
                        </div>
                    )}

                    {scanResultStatus === 'success' && (
                        <div className="d-flex align-items-center justify-content-center flex-column" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <ReactSVG 
                                src={ process.env.PUBLIC_URL + "/assets/img/scan/entrtScan-pass.svg" } 
                                style={{
                                    width: '100%', 
                                    opacity:"0.8",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                }}
                            />
                            <div className="d-flex align-items-center justify-content-center" 
                                style={{
                                    background:"rgba(102, 252, 241, 1)", 
                                    height:"48px", 
                                    width:"200px", 
                                    borderRadius:"5px", 
                                    color:"black", 
                                    fontSize:"18px", 
                                    fontWeight:"400", 
                                    opacity:"0.8"
                                }}
                            >兌換成功
                            </div>
                        </div>
                    )}

                    {scanResultStatus === 'warning' && (
                        <div className="d-flex align-items-center justify-content-center flex-column" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <ReactSVG src={process.env.PUBLIC_URL + "/assets/img/scan/entrtScan-warning.svg"} 
                                style={{
                                    width: '100%', 
                                    opacity:"0.8",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                }}
                            />
                            <div className="d-flex align-items-center justify-content-center" 
                                style={{
                                    background:"#FCD266", 
                                    height:"48px", 
                                    width:"200px", 
                                    borderRadius:"5px", 
                                    color:"black", 
                                    fontSize:"18px", 
                                    fontWeight:"400", 
                                    opacity:"0.8"
                                }}
                            >票券有誤</div>
                        </div>
                    )}
                    
                    {scanResultStatus === 'error' && (
                        <div className="d-flex align-items-center justify-content-center flex-column" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <ReactSVG src={process.env.PUBLIC_URL + "/assets/img/scan/entrtScan-error.svg"} 
                                style={{
                                    width: '100%', 
                                    opacity:"0.8",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                }}
                            />
                            <div className="d-flex align-items-center justify-content-center" 
                                style={{
                                    background:"rgba(249, 103, 103, 1)", 
                                    height:"48px", 
                                    width:"200px", 
                                    borderRadius:"5px", 
                                    color:"black", 
                                    fontSize:"18px", 
                                    fontWeight:"400", 
                                    opacity:"0.8"
                                }}
                            >無效票券</div>
                        </div>
                    )}
                </div>
                }   



                <img src={ process.env.PUBLIC_URL + `/assets/img/scan/entrtScan-frame${
                        scanResultStatus === 'normal' ? '' : 
                        scanResultStatus === 'warning' ? 'Yellow' :
                        scanResultStatus === 'error' ? 'Red' : 'Tint' }.svg`}
                        className="img-fluid"
                        alt=""
                        style={{width:`${props.width}px`,height:`${props.height}px` , position: 'absolute', left: '62px', top: '0px', transform:'scale(1.2,1.12)'}}
                /> 
            </div>
            
            

        </div> 
    )
});

// 匯出函式
module.exports = qrReader;