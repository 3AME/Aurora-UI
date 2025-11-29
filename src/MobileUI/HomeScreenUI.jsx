import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// --- Animations (用于图标发光效果) ---
const glow = keyframes`
    0%, 100% { text-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(122,0,255,0.6); }
    50% { text-shadow: 0 0 10px rgba(255,255,255,1), 0 0 20px rgba(218,0,255,0.8); }
`;

// --- Styled Components ---

const HomeScreenWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 90; 
    
    background: transparent; 
    
    font-size: 18px; 
    @media (max-width: 400px) {
        font-size: 4.5vw;
    }
    
    display: flex;
    flex-direction: column;
    justify-content: flex-start; 
    padding: 0; 
`;

// --- 状态栏 (TopBar) ---

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8em 1em 0.5em; 
    color: white;
    font-size: 0.7em; 
    font-weight: 500;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    z-index: 10; 
`;

// --- 应用图标网格 (Icon Grid) ---

const IconGrid = styled.div`
    display: grid; 
    /* 关键修改：固定为 3 列 */
    grid-template-columns: repeat(3, 1fr); 
    gap: 1.5em 1em; /* 调整间距 */
    padding: 1em; 
    flex-grow: 1; 
    overflow-y: auto; 
    
    align-content: flex-start;
    justify-items: center; 
    
    padding-bottom: 7em; 
`;

const AppIcon = styled.div`
    max-width: 6em; 
    
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    text-align: center;
    
    .icon-image {
        width: 3em; 
        height: 3em;
        /* 关键：移除背景色 */
        background: transparent; 
        border-radius: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.8em; 
        color: white; 
        box-shadow: none; 

        /* 关键：添加极光发光效果 */
        text-shadow: 0 0 5px rgba(255,255,255,0.5), 0 0 10px ${props => props.$glowColor || 'rgba(122,0,255,0.4)'};
        transition: text-shadow 0.3s ease;

        &:hover {
            animation: ${glow} 1.5s infinite alternate; 
        }
    }
    
    .icon-label {
        margin-top: 0.5em;
        font-size: 0.7em;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        line-height: 1.1;
        max-width: 100%; 
        white-space: normal;
        word-break: break-word;
    }
`;

// --- 底部 Dock 栏 ---

const Dock = styled.div`
    position: absolute; 
    bottom: 0;
    left: 50%;
    transform: translateX(-50%); 

    width: calc(100% - 2em); 
    max-width: 90%; 
    height: 4.5em; 
    /* 关键：半透明模糊效果 */
    background: rgba(255, 255, 255, 0.15); 
    backdrop-filter: blur(15px); 
    border-radius: 2em;
    margin: 0 auto 1em; 
    padding: 0.5em;
    
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 10; 
`;

const DockIcon = styled(AppIcon)`
    width: 3em; 
    height: 3em;
    margin: 0; 
    
    .icon-image {
        width: 100%;
        height: 100%;
        border-radius: 20%;
        font-size: 1.5em; 
        /* 关键：添加极光发光效果 */
        text-shadow: 0 0 5px rgba(255,255,255,0.5), 0 0 10px ${props => props.$glowColor || 'rgba(122,0,255,0.4)'};
        transition: text-shadow 0.3s ease;

        &:hover {
            animation: ${glow} 1.5s infinite alternate; 
        }
    }
    
    .icon-label {
        display: none; 
    }
`;

// --- Component Logic ---

const AppItem = ({ label, icon, glowColor, onClick, isDock = false }) => {
    const Component = isDock ? DockIcon : AppIcon;
    
    // 使用 $glowColor 传递瞬时 Prop
    return (
        <Component $glowColor={glowColor} onClick={onClick}>
            <div className="icon-image">{icon}</div>
            {!isDock && <div className="icon-label">{label}</div>}
        </Component>
    );
};


const HomeScreenUI = ({ onOpenApp }) => {
    // 关键：更新图标和极光颜色
    const gridApps = [
        { label: "Messages", icon: "✉️", glowColor: "#007bff", id: "messages" }, // 蓝色
        { label: "Camera", icon: "📸", glowColor: "#FFC107", id: "camera" },    // 黄色
        { label: "Aurora", icon: "✨", glowColor: "#ff00ff", id: "aurora" },    // 品红色
        { label: "Settings", icon: "⚙️", glowColor: "#bbbbbb", id: "settings" },// 灰色
        { label: "Photos", icon: "🌄", glowColor: "#8A2BE2", id: "photos" },    // 紫罗兰色
        { label: "Music", icon: "🎵", glowColor: "#FF1493", id: "music" },     // 深粉色
        { label: "Weather", icon: "☁️", glowColor: "#00CED1", id: "weather" },   // 深青色
        { label: "Notes", icon: "🗒️", glowColor: "#ffff00", id: "notes" },     // 黄色
        { label: "Clock", icon: "⏰", glowColor: "#00CED1", id: "clock" },     // 深青色
        { label: "Calendar", icon: "🗓️", glowColor: "#ffff00", id: "calendar" },// 黄色
    ];
    
    const dockApps = [
        { label: "Phone", icon: "📞", glowColor: "#28a745", id: "phone" },     // 绿色
        { label: "Mail", icon: "📧", glowColor: "#007bff", id: "mail" },      // 蓝色
        { label: "Browser", icon: "🌐", glowColor: "#fd7e14", id: "browser" }, // 橙色
        { label: "Maps", icon: "📍", glowColor: "#dc3545", id: "maps" },      // 红色
    ];


    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    

    return (
        <HomeScreenWrapper>
            {/* 1. 状态栏 */}
            <TopBar>
                <div>Carrier</div>
                <div>{timeString}</div>
                <div>📶🔋</div>
            </TopBar>
            
            {/* 2. 应用图标网格 */}
            <IconGrid>
                {gridApps.map(app => (
                    <AppItem 
                        key={app.id} 
                        {...app} 
                        onClick={() => onOpenApp(app.id)} 
                    />
                ))}
            </IconGrid>
            
            {/* 3. 底部 Dock 栏 */}
            <Dock>
                {dockApps.map(app => (
                    <AppItem 
                        key={app.id} 
                        {...app} 
                        isDock={true}
                        onClick={() => onOpenApp(app.id)} 
                    />
                ))}
            </Dock>
            
        </HomeScreenWrapper>
    );
};

export default HomeScreenUI;