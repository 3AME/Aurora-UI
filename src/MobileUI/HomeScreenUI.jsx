import React from 'react';
import styled from 'styled-components';

// --- Styled Components ---

const DEVICE_CONFIG = {
    phone: {
        gridCols: 4,
        iconSize: '45px',
        iconFontSize: '20px',
        dockSize: '50px',
        labelFontSize: '0.8em',
        gridGap: '1.5em 0.5em',
        dockItemSize: '50px',
    },
    tablet: {
        gridCols: 6,
        iconSize: '65px',
        iconFontSize: '30px',
        dockSize: '80px',
        labelFontSize: '1em',
        gridGap: '2em 1em',
        dockItemSize: '75px',
    },
    smartwatch: {
        gridCols: 2,
        iconSize: '40px',
        iconFontSize: '18px',
        dockSize: '0px', // without dock
        labelFontSize: '0.7em',
        gridGap: '1em 0.5em',
        dockItemSize: '0px',
    }
}
const getConfig = (props) => {
    const deviceType = props.$deviceType || 'phone';
    return DEVICE_CONFIG[deviceType] || DEVICE_CONFIG.phone;
};

const HomeWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 90; 
    
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
    align-content: center;
    padding: 0;
`;

const AppGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => getConfig(props).gridCols}, 1fr);
    gap: ${props => getConfig(props).gridGap};
    justify-content: center;
    align-content: center;
    padding-top: 1.5em;
    padding-left: 1em;
    padding-right: 1em;
    padding-bottom: ${props => getConfig(props).dockSize !== '0px' ? '2em' : '1em'};
    flex-grow: ${props => getConfig(props).dockSize === '0px' ? 1 : 0};;
    z-index: 95; 
`;

const AppIconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    font-size: 14px;
    cursor: pointer;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8); /* 增加文字阴影，提高在极光背景上的可读性 */
    transition: transform 0.1s;

    &:active {
        transform: scale(0.95);
    }
`;

const Icon = styled.div`
    width: ${props => getConfig(props).iconSize};
    height: ${props => getConfig(props).iconSize};
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px); 
    display: flex;
    justify-content: center;
    align-content: center;
    font-size: ${props => getConfig(props).iconFontSize};
    margin-bottom: 0.3em;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const AppLabel = styled.span`
    font-size: ${props => getConfig(props).labelFontSize};
    font-size: 0.8em;
    font-weight: 500;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

// --- 新增：Dock 栏样式 ---

const DockContainer = styled.div`
    /* hide dock if dockSize is 0px = smartwatch */
    display: ${props => getConfig(props).dockSize !== '0px' ? 'flex' : 'none'};
    /* 关键 1: 磨砂玻璃效果 */
    background: rgba(255, 255, 255, 0.1); 
    backdrop-filter: blur(20px); /* 强大的模糊效果 */
    
    /* 关键 2: 布局和定位 */
    width: 90%;
    margin: 0;
    height: ${props => getConfig(props).dockSize};
    padding: ${props => getConfig(props).dockSize !== '0px' ? '12px 15px' : '0'};
    align-self: center; /* 居中对齐 */
    // padding: 12px 15px;
    border-radius: 25px; /* 圆角边框 */
    
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    /* 关键 3: 阴影和层级 */
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2); 
    z-index: 100; /* 确保它在所有 Home Screen 元素之上 */
`;

const DockItem = styled(AppIconWrapper)`
    width: ${props => getConfig(props).dockItemSize};
    height: ${props => getConfig(props).dockItemSize};
  
    text-shadow: none; 
    display: flex;
    justify-content: center;
    align-items: center;
    
    ${Icon} {
        width: 100%;
        height: 100%;
        background: transparent; /* Dock 栏图标不需要背景色 */
        backdrop-filter: none; /* 移除图标内部的模糊 */
        box-shadow: none;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: ${props => getConfig(props).iconFontSize}; 
    }
`;

// --- 应用数据 (拆分常用应用到 Dock) ---

// Dock 栏应用 (最常用的 4 个)
const dockApps = [
    { id: 'phone', icon: '📞', label: 'Phone' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'browser', icon: '🌐', label: 'Browser' },
    { id: 'camera', icon: '📷', label: 'Camera' },
];

// 主屏幕应用 (其余的)
const gridApps = [
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'maps', icon: '🗺️', label: 'Maps' },
    { id: 'email', icon: '📧', label: 'Email' },
    { id: 'music', icon: '🎶', label: 'Music' },
    { id: 'photos', icon: '🖼️', label: 'Photos' },
    { id: 'weather', icon: '☁️', label: 'Weather' },
];


// --- Component Logic ---

const HomeScreenUI = ({ onOpenApp, deviceType = 'phone' }) => {

    // 渲染 App 图标的通用函数
    // const config = DEVICE_CONFIG[deviceType] || DEVICE_CONFIG.phone;
    const renderAppIcon = (app, isDock = false) => {
        const IconComponent = isDock ? DockItem : AppIconWrapper;

        return (
            <IconComponent
                key={app.id}
                onClick={() => onOpenApp(app.id)}
                $deviceType={deviceType}
            >
                <Icon $deviceType={deviceType}>{app.icon}</Icon>
                {!isDock && <AppLabel $deviceType={deviceType}>{app.label}</AppLabel>}
            </IconComponent>
        );
    };

    return (
        <HomeWrapper>

            <AppGrid $deviceType={deviceType}>
                {gridApps.map(app => renderAppIcon(app, false))}
            </AppGrid>

            <DockContainer $deviceType={deviceType}>
                {dockApps.map(app => renderAppIcon(app, true))}
            </DockContainer>

        </HomeWrapper>
    );
};

export default HomeScreenUI;