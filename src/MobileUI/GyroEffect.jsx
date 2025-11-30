import React, { useState, useEffect, useRef } from 'react';


const GyroEffect = ({ children, kpIndex }) => {
    // 1. 状态管理：存储陀螺仪/设备倾斜数据
    // motionData 存储用于背景平移的 X 和 Y 值 (例如: { x: 5, y: -10 } 像素)
    const [motionData, setMotionData] = useState({ x: 0, y: 0 });
    const effectRef = useRef(null); // 用于引用背景元素

    // 2. 效果参数配置
    // MAX_MOVEMENT: 背景元素最大移动的像素值
    const MAX_MOVEMENT = 20;

    // 3. useEffect：处理设备运动事件的订阅和取消订阅
    useEffect(() => {
        // 检查浏览器是否支持 DeviceOrientationEvent
        if (!window.DeviceOrientationEvent) {
            console.warn("当前浏览器不支持 DeviceOrientationEvent。陀螺仪效果禁用。");
            return;
        }

        /**
         * 设备运动事件处理函数
         * @param {DeviceOrientationEvent} event
         */
        const handleDeviceMotion = (event) => {
            // event.gamma 是设备左右倾斜角度 (-90 到 90)
            // event.beta 是设备前后倾斜角度 (-180 到 180, 常用 -90 到 90)

            const gamma = event.gamma || 0; // 左右倾斜 (对应 X 轴运动)
            const beta = event.beta || 0;   // 前后倾斜 (对应 Y 轴运动)

            // 归一化和反转处理：
            // 将角度映射到 -1 到 1 的范围，并反转方向以实现视差效果：
            // 手机向右倾斜 (gamma > 0)，背景需要向左平移 (x < 0)
            // 手机向上倾斜 (beta < 0)，背景需要向下平移 (y > 0)

            // 简单的归一化（假设设备通常在垂直 +/- 30 度内运动）
            const normalize = (value, maxAngle = 30) => {
                return Math.max(-1, Math.min(1, value / maxAngle));
            };

            const normalizedX = normalize(gamma);
            const normalizedY = normalize(beta);

            // 计算背景元素的实际平移像素值 (视差效果需要反转方向)
            const translateX = -normalizedX * MAX_MOVEMENT;
            const translateY = normalizedY * MAX_MOVEMENT;

            // 更新状态
            setMotionData({
                x: translateX,
                y: translateY
            });
        };

        // 尝试请求权限 (iOS 13+ 需要)
        const requestPermission = () => {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleDeviceMotion);
                        } else {
                            console.warn("获取设备方向权限失败。");
                        }
                    })
                    .catch(error => console.error("权限请求错误:", error));
            } else {
                // 非 iOS 13+ 或其他不需要权限的平台
                window.addEventListener('deviceorientation', handleDeviceMotion);
            }
        };

        requestPermission();

        // 清理函数：组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('deviceorientation', handleDeviceMotion);
        };
    }, []); // 仅在组件挂载和卸载时执行

    // 4. 渲染逻辑：将运动数据应用到背景元素的样式上
    const effectStyle = {
        // 使用 CSS 变量或直接 style 对象来应用平移效果
        // effectRef 应该指向你的背景元素，例如一个伪元素或内部的 div
        // 假设您的背景效果 (如 `aurora-background`) 是 `AuroraEffect` 内部的一个 div
        transform: `translate3d(${motionData.x}px, ${motionData.y}px, 0)`,
        // 添加平滑过渡，让效果更自然 (例如 50ms)
        transition: 'transform 50ms linear',
        willChange: 'transform',
    };

    return (
        <div className="aurora-effect-container">
            {/* 假设你的极光背景元素是这个 div，它会接收陀螺仪的 transform 样式 */}
            <div
                ref={effectRef}
                className={`aurora-background kp-${kpIndex}`} // 假设通过 kpIndex 控制颜色和强度
                style={effectStyle}
            />

            {/* children 是要显示在背景之上的 UI 内容 */}
            <div className="ui-content-layer">
                {children}
            </div>
        </div>
    );
};

export default GyroEffect;