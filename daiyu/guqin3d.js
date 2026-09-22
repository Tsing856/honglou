// guqin3d.js - 全局无模块兼容版
class Guqin3D {
    constructor(containerId, imageUrl, onPluckCallback) {
        this.container = document.getElementById(containerId);
        this.imageUrl = imageUrl;
        this.onPluckCallback = onPluckCallback;
        this.strings = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        if (!this.container) {
            console.error("找不到3D古琴容器:", containerId);
            return;
        }
        
        this.init();
        this.createScene();
        this.createQinBody();
        this.createStrings();
        this.addLights();
        this.animate();
        
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.onWindowResize());
    }

    init() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        // 强制给一个安全初始宽高，防止容器隐藏时读取到 0px
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {
        this.scene = new THREE.Scene();
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        
        // 视角调整为 35 度，相机稍微拉高并靠近 (0, 7, 12) 获得最佳黄金俯瞰比例
        this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        this.camera.position.set(0, 7, 12); 

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; 
    }
   createQinBody() {
        // 1. 🌟 完美保留你原汁原味的古典仲尼式曲线轮廓！
        const qinShape = new THREE.Shape();
        qinShape.moveTo(0, 7.5);                  
        qinShape.bezierCurveTo(1.2, 7.5, 1.4, 7.0, 1.4, 6.0);   
        qinShape.bezierCurveTo(1.4, 5.0, 2.0, 4.5, 2.1, 3.5); 
        qinShape.lineTo(1.6, -5.5);               
        qinShape.bezierCurveTo(1.6, -6.5, 1.2, -7.0, 1.0, -7.5);  
        qinShape.lineTo(-1.0, -7.5);
        qinShape.bezierCurveTo(-1.2, -7.0, -1.6, -6.5, -1.6, -5.5);
        qinShape.lineTo(-2.1, 3.5);
        qinShape.bezierCurveTo(-2.0, 4.5, -1.4, 5.0, -1.4, 6.0);
        qinShape.bezierCurveTo(-1.4, 7.0, -1.2, 7.5, 0, 7.5);

        // 2. 🌟 建立标准的拉伸体
        const extrudeSettings = {
            depth: 0.5,             
            bevelEnabled: true,
            bevelThickness: 0.1,   
            bevelSize: 0.05,        
            bevelSegments: 5 
        };

        const geometry = new THREE.ExtrudeGeometry(qinShape, extrudeSettings);
        geometry.center();
        geometry.rotateX(Math.PI / 2); 

        // 3. 🌟 调高材质亮度，让琴身清晰可见
       //  修改后：
const bodyMaterial = new THREE.MeshStandardMaterial({ // 👈 改回 Standard
    color: 0x3d2216,        // 稍微调深一点的古典大漆色
    roughness: 0.4,        
    metalness: 0.2
    // 👈 删掉 clearcoat 和 clearcoatRoughness
});

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imageUrl, (texture) => {
            bodyMaterial.map = texture;
            bodyMaterial.needsUpdate = true;
        }, undefined, (err) => {
            console.warn("贴图加载受限，已自动启用高保真古漆底色。");
        });

        this.qinMesh = new THREE.Mesh(geometry, bodyMaterial);
        
        // 🌟 琴身整体下压，把最上面平坦的表面安全地留出来
        this.qinMesh.position.set(0, -0.2, 0);
        this.scene.add(this.qinMesh);

        // ==================== 🌟 核心强制修正：13颗绝对可见的黄金徽位 ====================
        // 古典古琴 1-13 徽的标准弦长百分比位置
        const huiRatios = [0.083, 0.125, 0.166, 0.25, 0.333, 0.416, 0.5, 0.583, 0.666, 0.75, 0.833, 0.875, 0.916];
        
        // 使用球体（Sphere）而不是扁平圆片！球体具有立体感，在任何视角和阴影下都绝对能看清！
        const huiGeo = new THREE.SphereGeometry(0.06, 16, 16); 
        
        // 关键改动：使用 MeshBasicMaterial 并给纯白色，无视灯光阴影，像13颗发光珍珠一样浮在表面！
        const huiMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const totalLength = 15.0; // 琴身总长

        huiRatios.forEach((ratio, index) => {
            const huiMesh = new THREE.Mesh(huiGeo, huiMat);
            
            // 计算 Z 轴位置：从琴头(7.5)排到琴尾(-7.5)
            const zPos = 7.5 - (ratio * totalLength);

            // 🌟 静态安全定位：固定放置在左侧 X = -1.1 处
            // 在琴头和琴尾处做安全的边缘微调，确保永远留在琴面上，绝不悬空
            let xPos = -1.15;
            if (zPos > 5.5) xPos = -0.9;      // 琴头收窄区
            else if (zPos < -5.5) xPos = -0.65; // 琴尾收窄区

            // 🌟 高度强制拉高到 Y = 0.15，绝对悬浮在暗色琴面之上
            huiMesh.position.set(xPos, 0.15, zPos);
            
            huiMesh.userData = { huiNumber: index + 1 };
            this.scene.add(huiMesh);
        });
        // ====================================================================
    }
    createStrings() {
        const stringCount = 7;
        const startX = -0.8;      
        const endX = 0.8;        
        const stepX = (endX - startX) / (stringCount - 1);
        
        // 琴弦参数：总长度
        const length = 13.5;      

        // 🌟 视觉升级 1：在琴面上创建“立体岳山”和“龙龈”作为视觉垫高托架，增强细节丰富度
        const bridgeMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x150d0a, 
            roughness: 0.5,
            metalness: 0.2
        });
        
        // 右侧岳山
        const yueshanGeo = new THREE.BoxGeometry(0.15, 0.18, 1.8);
        const yueshan = new THREE.Mesh(yueshanGeo, bridgeMat);
        yueshan.position.set(0, 0.25, length / 2 - 0.2);
        this.scene.add(yueshan);

        // 左侧龙龈
        const longyinGeo = new THREE.BoxGeometry(0.15, 0.12, 1.6);
        const longyin = new THREE.Mesh(longyinGeo, bridgeMat);
        longyin.position.set(0, 0.22, -length / 2 + 0.2);
        this.scene.add(longyin);

        // 🌟 视觉升级 2：生成高精度、带金属丝绢质感的立体圆形琴弦
        for (let i = 0; i < stringCount; i++) {
            // 从一弦到七弦，粗细物理递减 (半径从 0.022 递减到 0.01)
            const radius = 0.022 - (i * 0.002); 
            
            // 使用圆柱几何体，但将径向分段数开高到 8（使其圆润），长度分段开到 1
            const stringGeo = new THREE.CylinderGeometry(radius, radius, length, 8, 1);
            stringGeo.rotateX(Math.PI / 2); // 沿琴身纵向躺倒

            // 升级材质：采用高级物理材质 (MeshPhysicalMaterial)
            // 混合高金属感和自发光，使得琴弦既能折射舞台灯光的高光，又能在暗处微微发亮不隐形
            //  修改后：
const stringMat = new THREE.MeshStandardMaterial({ // 👈 改为 Standard
    color: 0xfff6e0,          
    metalness: 0.9,          // 保持高金属感
    roughness: 0.1,          
    emissive: 0x221d15,       // 稍微降低自发光，防止曝光
    emissiveIntensity: 0.5
});

            const stringMesh = new THREE.Mesh(stringGeo, stringMat);
            const xPos = startX + (i * stepX);
            
            // 🌟 核心修正：高度精准架设在 Y = 0.35 处！
            // 配合刚才建立的岳山托架，琴弦将完美悬浮，绝不与黑色琴面发生任何“面片重叠面片”的闪烁和隐形
            stringMesh.position.set(xPos, 0.35, 0);
            
            stringMesh.userData = {
    index: i,          // 👈 传出 0 ~ 6，完美对应 main.js 的音频数组索引！
    originalX: xPos,
    isVibrating: false,
    vibratingTime: 0
};

            // 开启投影，让琴弦在黑色大漆琴面上投下细微逼真的阴影（细节感拉满）
            stringMesh.castShadow = true;

            this.scene.add(stringMesh);
            this.strings.push(stringMesh); 
        }

        // 🌟 视觉升级 3：优化加光，为高精细度琴弦补充一条侧逆方向的高光束
        const stringLight = new THREE.DirectionalLight(0xffffff, 0.6);
        stringLight.position.set(-5, 5, 0); // 从左侧切入，打出漂亮的金属弦侧边高光
        this.scene.add(stringLight);
    }
    addLights() {
        // 1. 调低环境光，避免画面死白！
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // 2. 顶部主探照灯，专门用来照亮木纹面板
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 10, 5);
        this.scene.add(mainLight);

        // 3. 黄金色侧逆侧光，从左后方打过来，照亮琴弦边缘和徽位
        const warmGlow = new THREE.DirectionalLight(0xffdca8, 0.6);
        warmGlow.position.set(-5, 4, -2);
        this.scene.add(warmGlow);
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.strings);

        if (intersects.length > 0) {
            const hitString = intersects[0].object;
            if (!hitString.userData.isVibrating) {
                hitString.userData.isVibrating = true;
                hitString.userData.vibratingTime = 0;
                
                if (typeof this.onPluckCallback === 'function') {
                    this.onPluckCallback(hitString.userData.index);
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.strings.forEach(str => {
            if (str.userData.isVibrating) {
                str.userData.vibratingTime += 0.4;
                const amp = 0.05 * Math.exp(-str.userData.vibratingTime * 0.15); 
                
                if (amp > 0.001) {
                    str.position.x = str.userData.originalX + Math.sin(str.userData.vibratingTime * 2.5) * amp;
                } else {
                    str.position.x = str.userData.originalX;
                    str.userData.isVibrating = false;
                }
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// 暴露出全局类名
window.Guqin3D = Guqin3D;