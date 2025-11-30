import React, { useState } from 'react';
import MobileMockup from './MobileUI/MobileMockup';
import GlobalBackground from './MobileUI/GlobalBackground';
import MobileContainer from './MobileUI/MobileContainer'; 
import styled from 'styled-components';

// 定义设备类型常量
// const DEVICE_TYPES = {
//     PHONE: 'phone',
//     TABLET: 'tablet',
//     WATCH: 'smartwatch'
// };

// --- Device Selector UI ---
const SelectorWrapper = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000; /* Must be on top of everything */
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    display: flex;
    gap: 10px;
`;

const SelectButton = styled.button`
    padding: 8px 15px;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    
    background: ${props => props.$active ? '#fff' : 'transparent'};
    color: ${props => props.$active ? '#000' : '#fff'};
    border: ${props => props.$active ? 'none' : '1px solid rgba(255, 255, 255, 0.5)'};

    &:hover {
        background: ${props => props.$active ? '#eee' : 'rgba(255, 255, 255, 0.1)'};
    }
`;


function App() {
    // const [currentDevice, setCurrentDevice] = useState(DEVICE_TYPES.PHONE);

    return (
        <div className="App">
            
            {/* 1. 全局背景 */}
            <GlobalBackground />
            
            {/* 2. 设备选择按钮 */}
            {/* <SelectorWrapper>
                <SelectButton 
                    $active={currentDevice === DEVICE_TYPES.PHONE}
                    onClick={() => setCurrentDevice(DEVICE_TYPES.PHONE)}
                >
                    📱 Phone
                </SelectButton>
                <SelectButton 
                    $active={currentDevice === DEVICE_TYPES.TABLET}
                    onClick={() => setCurrentDevice(DEVICE_TYPES.TABLET)}
                >
                    💻 Tablet
                </SelectButton>
                <SelectButton 
                    $active={currentDevice === DEVICE_TYPES.WATCH}
                    onClick={() => setCurrentDevice(DEVICE_TYPES.WATCH)}
                >
                    ⌚ Smartwatch
                </SelectButton>
            </SelectorWrapper> */}
            
            {/* 3. 手机/设备 Mockup 容器 - 传入当前设备类型 */}
            {/* <MobileMockup deviceType={currentDevice}> */}
                {/* 4. 手机内部逻辑 (Lock Screen / Home Screen) */}
                <MobileContainer /> 
            {/* </MobileMockup> */}
            
        </div>
    );
}

export default App;