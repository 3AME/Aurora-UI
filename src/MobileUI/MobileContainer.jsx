import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 导入所有 UI 组件
import MobileMockup from './MobileMockup';
import LockScreenUI from './LockScreenUI';
import HomeScreenUI from './HomeScreenUI';
import IncomingCallUI from './IncomingCallUI';
import AuroraEffect from './AuroraEffect'; // 确保 AuroraEffect 已导入
// import GyroEffect from './GyroEffect';

// 屏幕状态枚举
const SCREEN = {
    LOCKED: 'locked',
    HOME: 'home',
    CALL_ACTIVE: 'call_active',
    INCOMING_CALL: 'incoming_call',
    APP_VIEW: 'app_view',
};

// 调试按钮组件 (保持不变)
const DebugButton = styled.button`
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
`;

const DEVICE_TYPES = ['phone', 'tablet', 'smartwatch'];

const MobileContainer = () => {
    // 基础状态
    const [currentScreen, setCurrentScreen] = useState(SCREEN.HOME);
    const [currentApp, setCurrentApp] = useState(null);

    // 极光状态：实时 Kp 指数
    const [kpIndex, setKpIndex] = useState(0);
    const [deviceIndex, setDeviceIndex] = useState(0);
    const currentDevice = DEVICE_TYPES[deviceIndex];

    // --- Kp 指数 API 调用逻辑 ---
    useEffect(() => {
        const fetchKpIndex = async () => {

            // 1. 正确的 NOAA 实时 Kp API URL
            const noaaUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';

            // 2. 使用 CORS 代理来绕过跨域限制
            const apiUrl = `https://corsproxy.io/?${encodeURIComponent(noaaUrl)}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                let currentKp = 0;

                if (Array.isArray(data) && data.length > 1) {
                    // 获取数组中的最后一个元素（最新的观测/预测值）
                    const latestObservation = data[data.length - 1];

                    // Kp 值位于数组索引 1
                    const kpIndexInRow = 1;

                    if (latestObservation.length > kpIndexInRow) {
                        currentKp = parseFloat(latestObservation[kpIndexInRow] || 0);
                    }
                }

                // 限制 Kp 值在 0-9 之间，并向上取整 (因为 Kp 是整数)
                const finalKp = Math.min(9, Math.max(0, Math.ceil(currentKp)));

                console.log(`Successfully fetched and parsed Kp Index: ${finalKp}`);
                setKpIndex(finalKp);

            } catch (error) {
                console.error("Error fetching Kp Index:", error);
                // 失败时，设置安全值
                setKpIndex(0);
            }
        };

        // 首次加载立即执行
        fetchKpIndex();

        // 设置定时器，每 5 分钟 (300000 毫秒) 刷新一次数据
        const intervalId = setInterval(fetchKpIndex, 300000);

        // 清理函数：组件卸载时清除定时器
        return () => clearInterval(intervalId);
    }, []);

    const toggleDevice = () => {
        setDeviceIndex((prevIndex) => (prevIndex + 1) % DEVICE_TYPES.length);
    }

    // --- Handler 函数 (保持不变) ---
    const handleUnlock = () => {
        setCurrentScreen(SCREEN.HOME);
    };

    const handleOpenApp = (appId) => {
        setCurrentApp(appId);
        setCurrentScreen(SCREEN.APP_VIEW);
    };

    const handleDecline = () => {
        setCurrentScreen(SCREEN.HOME);
    };

    const toggleCall = () => {
        if (currentScreen !== SCREEN.INCOMING_CALL) {
            setCurrentScreen(SCREEN.INCOMING_CALL);
        } else {
            setCurrentScreen(SCREEN.HOME);
        }
    };


    // --- 渲染逻辑 ---
//    const test = 2;
    const renderScreenContent = () => {
        // 渲染 AuroraEffect 作为所有 UI 的背景层
        return (
            <AuroraEffect kpIndex={kpIndex}>
                {console.log("Rendering GyroEffect with kpIndex:", test)}
            {/* <GyroEffect> */}

                {/* 1. App View UI (应用内视图) - 暂未实现完整代码 */}
                {currentScreen === SCREEN.APP_VIEW && (
                    <LockScreenUI onUnlock={handleUnlock} lockText={`App: ${currentApp}`} />
                    // 实际项目中 AppViewUI 将代替 LockScreenUI
                )}

                {/* 2. Home Screen UI (主屏幕) */}
                {/* 只有在主页状态时才渲染 Home Screen UI */}
                {currentScreen === SCREEN.HOME && (
                    <HomeScreenUI onOpenApp={handleOpenApp}
                        deviceType={currentDevice} />
                )}

                {/* 3. Lock Screen UI (锁屏) */}
                {currentScreen === SCREEN.LOCKED && (
                    <LockScreenUI onUnlock={handleUnlock} lockText="Swipe Up to Unlock" />
                )}

                {/* 4. Incoming Call UI (来电) - 必须在最上层 */}
                {currentScreen === SCREEN.INCOMING_CALL && (
                    <IncomingCallUI
                        onAccept={() => setCurrentScreen(SCREEN.CALL_ACTIVE)}
                        onDecline={handleDecline}
                        contactName={"Mom"}
                        phoneNumber={"358 12 374 5677"}
                    />
                )}

                {/* 5. Call Active UI (通话中) - 暂未实现 */}
                {currentScreen === SCREEN.CALL_ACTIVE && (
                    <HomeScreenUI onOpenApp={handleOpenApp} />
                    // 实际项目中 CallActiveUI 将代替 HomeScreenUI
                )}
            {/* </GyroEffect> */}
             </AuroraEffect>
        );
    };

    return (
        <>
            <MobileMockup deviceType={currentDevice}>
                {renderScreenContent()}
            </MobileMockup>

            {/* 调试按钮 */}
            <DebugButton onClick={toggleCall}>
                {currentScreen !== SCREEN.INCOMING_CALL ? 'Simulate Call' : 'End Call'}
            </DebugButton>
            <DebugButton onClick={toggleDevice} style={{ right: '150px', background: '#dc3545' }}>
                Switch to {DEVICE_TYPES[(deviceIndex + 1) % DEVICE_TYPES.length]}
            </DebugButton>
        </>
    );
};

export default MobileContainer;