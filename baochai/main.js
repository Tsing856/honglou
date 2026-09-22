// 1. 解析 URL 中的参数，判断是否来自剧情回顾
const urlParams = new URLSearchParams(window.location.search);
const isFromRecap = urlParams.get('from') === 'recap';

// 2. 宝钗篇结束/跳转下一个节点的函数
function goToNextChapter() {
    if (isFromRecap) {
        // 来自剧情回顾：独立播放完毕，直接返回根目录的剧情回顾界面
        window.location.href = '../home.html?recap=1';
    } else {
        // 第一次正常流程：三篇全部结束，进入剧情回顾界面（或大观园全景）
        window.location.href = '../home.html?recap=1';
    }
}
// 全局 Web Audio 上下文
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

// 播放类似“扇风/扑翅”的风声音效
function playCatchSound() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const duration = 0.25; // 挥风持续时间（秒）

    // 1. 创建音频缓冲区生成白噪音（模拟空气摩擦声）
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // 2. 创建低通滤波器（Low-pass Filter），塑造“风”的闷响感
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    // 频率从低到高再切断，模拟扇子扫过空气的动态
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);

    // 3. 配置音量包络（渐入渐出，形成“咻”的一声）
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // 4. 连接节点并播放
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + duration);
}
document.addEventListener('DOMContentLoaded', () => {
    const DEBUG_DIRECT_TO_CURTAIN =false;

    if (DEBUG_DIRECT_TO_CURTAIN) {
        // 自动隐藏前置场景
        ['book-stage', 'scene-stage', 'catch-butterfly-stage', 'hint-ui'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        // 自动拉起黑幕
        const curtain = document.getElementById('curtain-call-stage');
        if (curtain) {
            curtain.style.display = 'flex';
            curtain.style.opacity = '1';
            curtain.classList.add('active');
        }
        console.warn("🛠️ 已自动切入【黑幕谢幕】调试模式");
    }
    const hintUi = document.getElementById('hint-ui');
    const guideText = document.getElementById('guide-text');
    const bookStage = document.getElementById('book-stage');
    const bookEntity = document.getElementById('book-entity');
    const awakeningStage = document.getElementById('awakening-stage');
    const goldLock = document.getElementById('gold-lock');
    const lockSketch = document.getElementById('lock-sketch');
    const lockColored = document.getElementById('lock-colored');
    const fogOverlay = document.getElementById('fog-overlay');
    const sceneStage = document.getElementById('scene-stage');
    const scrollContainer = document.getElementById('scroll-container');
    const viewport = document.getElementById('viewport');
    const curtainStage = document.getElementById('curtain-call-stage');

    let currentStep = 0; 

    // ================= 阶段 1 & 2：书本翻开与交接 =================
    bookEntity.addEventListener('click', () => {
        if (currentStep === 0) {
            bookEntity.classList.add('book-open-active');
            guideText.innerText = "【第二步】轻触内页破损金锁，释放其封存的器物记忆...";
            currentStep = 1;
        } else if (currentStep === 1) {
            bookStage.style.opacity = '0';
            bookStage.style.transform = 'scale(0.85) translateZ(-150px)';
            bookStage.style.pointerEvents = 'none'; 

            setTimeout(() => {
                bookStage.style.display = 'none';
                awakeningStage.style.display = 'flex';
                setTimeout(() => {
                    awakeningStage.style.opacity = '1';
                    guideText.innerText = "【第三步】触碰破损金锁，为器物注入角色灵魂...";
                    currentStep = 2;
                }, 50);
            }, 1000); 
        }
    });

    // ================= 阶段 3：点击未唤醒线稿 -> 触发 SVG 遮罩扩散 =================
    goldLock.addEventListener('click', () => {
        if (currentStep !== 2) return;
        currentStep = 3; 

        const ritualCircle = document.querySelector('.ritual-circle');
        if (ritualCircle) {
            ritualCircle.style.opacity = '0';
            ritualCircle.style.transform = 'scale(1.08)';
        }

        lockColored.classList.add('bleed-active');
        lockSketch.style.opacity = '0';
        guideText.innerText = "画卷觉醒，凝一缕红楼幽魂...";

        setTimeout(() => {
            const maskCircle = document.getElementById('mask-circle');
            if (maskCircle) { 
                maskCircle.setAttribute('cx', '190');
                maskCircle.setAttribute('cy', '270');
                maskCircle.setAttribute('r', '500'); 
            }
        }, 50);

        setTimeout(() => {
            guideText.innerText = "往事如烟，虚空汇聚...";
            fogOverlay.style.display = 'block';
            fogOverlay.classList.add('fog-active'); 

            setTimeout(() => {
                awakeningStage.style.display = 'none'; 
                sceneStage.style.display = 'block';    
                
                if (hintUi) hintUi.classList.add('scene-style');

                setTimeout(() => {
                    sceneStage.style.opacity = '1';
                    hintUi.style.opacity = '0'; 
                }, 50);
            }, 1300); 

            setTimeout(() => {
                fogOverlay.style.display = 'none';
                currentStep = 4; 
            }, 5000);

        }, 2500); 
    });

    // ================= 阶段 4：3D 视频镜头环视 + WASD 键盘漫游 =================
    let camX = 0, camZ = 0, mouseX = 0;
    let curCamX = 0, curCamZ = 0, curMouseX = 0;
    const easeFactor = 0.08; 

    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = true;
    });
    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (currentStep !== 4 && currentStep !== 6) return;
        const mousePercentX = (e.clientX / window.innerWidth) - 0.5;
        mouseX = mousePercentX * 120; 
    });

    function updateVideoSceneCamera() {
        if (currentStep === 4 || currentStep === 6) {
            const speed = 4; 

            if (keys.w) camZ += speed;  
            if (keys.s) camZ -= speed;  
            if (keys.a) camX -= speed;  
            if (keys.d) camX += speed;  

            camX = Math.max(-80, Math.min(80, camX));
            camZ = Math.max(-40, Math.min(120, camZ));

            curCamX += (camX - curCamX) * easeFactor;
            curCamZ += (camZ - curCamZ) * easeFactor;
            curMouseX += (mouseX - curMouseX) * easeFactor;

            const rotateY = (curMouseX / 120) * 4; 

            scrollContainer.style.transform = `
                translate3d(${-curCamX - curMouseX}px, 0, ${curCamZ}px) 
                rotateY(${-rotateY}deg)
            `;
        }
        requestAnimationFrame(updateVideoSceneCamera);
    }
    updateVideoSceneCamera();

    // ================= 阶段 5：古典道具点击 =================
    const propBooks = document.getElementById('prop-books'); 
    const propTea = document.getElementById('prop-tea');     
    const propBaochai = document.getElementById('prop-baochai'); 

    if (propBooks) {
        propBooks.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentStep !== 4) return; 
            hintUi.style.opacity = '1';
            guideText.innerHTML = "<b>【案头诗集】</b><br>翻开诗卷，隐约可见宝钗所作《海棠诗》：‘淡极始知花更艳，愁多焉得玉无痕’。温厚笔墨间，终是一抹挥不去的冷香。";
            setTimeout(() => { if(currentStep === 4) hintUi.style.opacity = '0'; }, 6000);
        });
    }

    if (propTea) {
        propTea.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentStep !== 4) return; 
            hintUi.style.opacity = '1';
            guideText.innerHTML = "<b>【冷香丸】</b><br>白牡丹花蕊、白荷花蕊、白芙蓉花蕊、白梅花蕊...历经春夏秋冬的严苛节候，方炼得这一缕压制热毒的异香。是药，也是她一生的隐忍。";
            setTimeout(() => { if(currentStep === 4) hintUi.style.opacity = '0'; }, 6000);
        });
    }

    // ==========================================================================
    // 🌸 宝钗篇 4. 场景器物/人物局部发光交互绑定（安全、无冲突版本）
    // ==========================================================================
    
    // 1. 获取 HTML 中已经写好的发光层元素
    const glowTea = document.getElementById('glow-tea');
    const glowBook = document.getElementById('glow-book');
    const glowBaochai = document.getElementById('glow-baochai');
    
    // ⚠️ 注意：如果 main.js 的顶部或者外面已经声明过 hintUi, guideText, sceneStage 
    // ⚠️ 这里【绝对不要】再写 const，直接赋值或直接使用它们！
    // 为了最安全，我们这里直接通过 document.getElementById 实时获取，不声明局部变量
    
    // ---- 🍵 点击：左侧冷香丸茶 ----
    if (glowTea) {
        glowTea.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentStep !== 4) return;
            
            // 🔍 直接通过 ID 获取和操作，不使用可能冲突的全局/局部变量声明
            const currentHintUi = document.getElementById('hint-ui');
            const currentGuideText = document.getElementById('guide-text');
            
            if (currentHintUi && currentGuideText) {
                currentHintUi.classList.add('scene-style');
                currentHintUi.style.opacity = '1';
                currentGuideText.innerHTML = "<b>【冷香丸茶】</b><br>以白牡丹、白荷、白芙蓉、白梅花蕊配节气神水调和而成的冷香丸，正浸于茶盏之中，香气清冷入骨。";
                setTimeout(() => { if(currentStep === 4) currentHintUi.style.opacity = '0'; }, 5000);
            }
        });
    }

    // ---- 📜 点击：右侧案头诗集 ----
    if (glowBook) {
        glowBook.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentStep !== 4) return;
            
            const currentHintUi = document.getElementById('hint-ui');
            const currentGuideText = document.getElementById('guide-text');
            
            if (currentHintUi && currentGuideText) {
                currentHintUi.classList.add('scene-style');
                currentHintUi.style.opacity = '1';
                currentGuideText.innerHTML = "<b>【案头诗集】</b><br>‘珍重芳姿昼掩门’。案头书卷墨香未干，其上录着的正是大观园诗社里，她那才华夺魁的‘咏白海棠’。";
                setTimeout(() => { if(currentStep === 4) currentHintUi.style.opacity = '0'; }, 5000);
            }
        });
    }

    // ---- 🌸 点击：薛宝钗（直接触发下方剧情，不弹提示） ----
    if (glowBaochai) {
        glowBaochai.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentStep !== 4) return;
            
            currentStep = 5;
            isEndingDialogueMode = false;
            
            const currentHintUi = document.getElementById('hint-ui');
            if (currentHintUi) currentHintUi.style.opacity = '0';

            const storyStage = document.getElementById('story-stage');
            const dialogueTextDom = document.getElementById('dialogue-text');
            const dialogueNameDom = document.getElementById('dialogue-name');
            const currentSceneStage = document.getElementById('scene-stage');

            if (storyStage && dialogueTextDom && dialogueNameDom) {
                currentLineIndex = 0;
                dialogueNameDom.innerText = storyScript[currentLineIndex].name;
                dialogueTextDom.innerHTML = storyScript[currentLineIndex].text;
                
                // 气泡名称框的背景颜色区分（用户为绿色，角色为红色）
                if (storyScript[currentLineIndex].name === "我") {
                    dialogueNameDom.style.background = "#2e4e3f";
                } else {
                    dialogueNameDom.style.background = "#8c241e";
                }

                // 漫游大图平滑淡出
                if (currentSceneStage) {
                    currentSceneStage.style.transition = 'opacity 1.0s ease';
                    currentSceneStage.style.opacity = '0';
                }

                // 剧情幕平滑淡入
                setTimeout(() => {
                    if (currentSceneStage) currentSceneStage.style.display = 'none';
                    storyStage.classList.add('active');
                    storyStage.style.display = 'block';
                    setTimeout(() => {
                        storyStage.style.opacity = '1';
                        storyStage.classList.add('fade-in');
                    }, 50);
                }, 1000);
            }
        });
    }

    // ================= 智能双剧本驱动系统 =================
    const storyScript = [
        { name: "宝钗", text: "（语气温和，带着一丝轻轻的审视）<br>“你来了。方才金锁动了一下，我就知道——有人在书页上唤了它。”" },
        { name: "宝钗", text: "（她顿了顿，目光落在用户身上，像是端详一位不速之客）<br>“它好久没有这样亮过了。你既然能让它醒过来，想必也不是寻常的访客。”" },
        { name: "宝钗", text: "（她微微侧了侧身，示意旁边的木椅）<br>“坐吧。蘅芜苑平日没什么人来，你倒不必拘束。”" },
        { name: "我",   text: "“你平日最喜欢做什么？”" },
        { name: "宝钗", text: "（像是被问到了一件她很少对人提起的事，微微垂眼）<br>“读书、理账、做些针线——都是些寻常事，说出来怕你嫌闷。”" },
        { name: "宝钗", text: "（她想了想，又接了一句）<br>“不过有一件事，算是我自己的——园子西边那片花圃，每日午后我总要去走一趟。也不做什么，就是看看花开了没有，蝴蝶来了没有。”" },
        { name: "宝钗", text: "（她语气里带着一丝极淡的柔软，几乎是自言自语）<br>“春天的时候，那一带的蝴蝶特别多。白色的、黄色的、还有那种玉色的——翅膀带着淡淡的光，飞起来像一小片天落在花上。”" },
        { name: "我",   text: "“可以带我去看看吗？”" },
        { name: "宝钗", text: "（站起身来，走向门口，顺手取过挂在木架上的团扇）<br>“走吧。正好是午后，蝴蝶该醒了。”" },
        { name: "宝钗", text: "（她回头看了用户一眼，唇角带着浅浅的笑意）<br>“你倒是第一个主动说要去看蝴蝶的人。宝玉来了八百回，从来没提过。”" }
    ];
    let currentLineIndex = 0; 

    // 🎬 终章剧本数据
    const finalEndingScript = [
        { name: "宝钗", text: "（转过身来，静静地看着你，身后的漫漫景色渐渐隐入暮色之中）<br>“故事看完了，属于这把金锁的记忆，大抵也就到这里了。”" },
        { name: "宝钗", text: "（她微微低头，抚了抚衣袖，语气里是一种看透命途的释然与平和）<br>“世人都道‘金玉良缘’是个好结果，可谁又知这深墙之内，到底锁了多少冷清。不过，今日能有你相伴走这一程，倒是不负此番苏醒。”" },
        { name: "我",   text: "“你要回去了吗？”" },
        { name: "宝钗", text: "（对你浅浅一礼，身形开始有一层淡淡的微光扩散）<br>“该回书卷里去了。若有一日，你再次翻开这本《红楼物语》，记得别走错了院子……我们在蘅芜苑，再见。”" }
    ];
    let finalScriptIndex = 0;
    let isEndingDialogueMode = false; 

    if (propBaochai) {
        propBaochai.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentStep !== 4) return;
            currentStep = 5; 
            isEndingDialogueMode = false; 

            if (hintUi) hintUi.style.opacity = '0';

            const storyStage = document.getElementById('story-stage');
            const dialogueTextDom = document.getElementById('dialogue-text');
            const dialogueNameDom = document.getElementById('dialogue-name'); 

            if (storyStage && dialogueTextDom && dialogueNameDom) {
                currentLineIndex = 0;
                
                dialogueNameDom.innerText = storyScript[currentLineIndex].name;
                dialogueTextDom.innerHTML = storyScript[currentLineIndex].text;

                if (storyScript[currentLineIndex].name === "我") {
                    dialogueNameDom.style.background = "#2e4e3f"; 
                } else {
                    dialogueNameDom.style.background = "#8c241e";
                }

                if (sceneStage) {
                    sceneStage.style.transition = 'opacity 1.0s ease';
                    sceneStage.style.opacity = '0';
                }

                setTimeout(() => {
                    if (sceneStage) sceneStage.style.display = 'none'; 
                    storyStage.classList.add('active'); 

                    setTimeout(() => {
                        storyStage.style.opacity = '1';
                        storyStage.classList.add('fade-in'); 
                    }, 50);
                }, 1000); 
            }
        });
    }

    // 核心剧情翻页控制系统
function advanceStory() {
    const dialogueTextDom = document.getElementById('dialogue-text');
    const dialogueNameDom = document.getElementById('dialogue-name');
    const storyStage = document.getElementById('story-stage');
    
    if (!dialogueTextDom || !dialogueNameDom) return;

    // 分支 A：终章对话场景逻辑
    if (isEndingDialogueMode) {
        finalScriptIndex++;
        if (finalScriptIndex < finalEndingScript.length) {
            dialogueTextDom.style.opacity = '0';
            setTimeout(() => {
                const currentData = finalEndingScript[finalScriptIndex];
                dialogueNameDom.innerText = currentData.name;
                dialogueTextDom.innerHTML = currentData.text;
                if (currentData.name === "我") {
                    dialogueNameDom.style.background = "#2e4e3f";
                    dialogueTextDom.style.color = "#3a4a3e";
                } else {
                    dialogueNameDom.style.background = "#8c241e";
                    dialogueTextDom.style.color = "#2c1e13";
                }
                dialogueTextDom.style.opacity = '1';
            }, 150);
        } else {
            console.log("终章剧情演绎完毕，正在淡出对白舞台并拉起黑底终幕...");
            
            // 1. 淡出对话舞台
            if (storyStage) {
                storyStage.style.transition = 'opacity 1.5s ease';
                storyStage.style.opacity = '0';
                setTimeout(() => {
                    storyStage.style.display = 'none';
                    storyStage.classList.remove('active');
                }, 1500);
            }

            // 2. 🌟 正确显示黑幕谢幕舞台（必须设置 display 与 opacity）
            const curtainStage = document.getElementById('curtain-call-stage');
            if (curtainStage) {
                curtainStage.style.display = 'flex'; // 设置 display 显现
                setTimeout(() => {
                    curtainStage.style.opacity = '1';
                    curtainStage.classList.add('active');
                }, 50);

                // 从剧情回顾进入宝钗篇时，宝钗篇结束后自动回到三个器物选择界面。
                if (isReplayMode && recapParams.get('return') === 'recap') {
                    setTimeout(() => {
                        showStoryRecap();
                    }, 1800);
                }
            }
        }
        return;
    }

    // ...下面保持原有的分支 B 逻辑不动 ...

        // 分支 B：第一个书房剧本逻辑
        currentLineIndex++;

        if (currentLineIndex < storyScript.length) {
            dialogueTextDom.style.opacity = '0';
            
            setTimeout(() => {
                const currentData = storyScript[currentLineIndex];
                
                dialogueNameDom.innerText = currentData.name;
                dialogueTextDom.innerHTML = currentData.text;

                if (currentData.name === "我") {
                    dialogueNameDom.style.background = "#2e4e3f"; 
                    dialogueTextDom.style.color = "#3a4a3e"; 
                } else {
                    dialogueNameDom.style.background = "#8c241e"; 
                    dialogueTextDom.style.color = "#2c1e13"; 
                }

                dialogueTextDom.style.opacity = '1';
            }, 150);
        } else {
            if (storyStage) {
                storyStage.style.transition = 'opacity 1.5s ease';
                storyStage.style.opacity = '0'; 
                setTimeout(() => {
                    storyStage.classList.remove('active');
                    enterButterflyStage(); 
                }, 1500);
            }
        }
    }

    const dialogueNextBtn = document.getElementById('dialogue-next-btn');
    if (dialogueNextBtn) { dialogueNextBtn.addEventListener('click', (e) => { e.stopPropagation(); advanceStory(); }); }

    const dialogueBoxDom = document.getElementById('dialogue-box');
    if (dialogueBoxDom) { dialogueBoxDom.addEventListener('click', (e) => { e.stopPropagation(); advanceStory(); }); }

    // ================= 🎬 🎯 核心新增：点击黑幕回到最初场景 =================
    /*
    if (curtainStage) {
        curtainStage.addEventListener('click', () => {
            console.log("玩家点击了谢幕黑屏，正在清洗全局状态，重新回到故事起点...");

            // 1. 让黑色画布淡出并关闭
            curtainStage.style.transition = 'opacity 1.5s ease';
            curtainStage.style.opacity = '0';
            
            setTimeout(() => {
                curtainStage.classList.remove('active');
                curtainStage.style.transition = 'opacity 3.0s ease'; // 还原回原本的淡入速度

                // 2. 将所有场景、视频、热区、图片复原回初始值
                const storyBg = document.getElementById('story-bg');
                if (storyBg) storyBg.src = "../image/baichai_juqing.jpg"; // 背景图还原回蘅芜苑内景

                const maskCircle = document.getElementById('mask-circle');
                if (maskCircle) maskCircle.setAttribute('r', '0'); // SVG 遮罩圆缩回为 0

                lockColored.classList.remove('bleed-active'); // 彩色锁褪色
                lockSketch.style.opacity = '1'; // 线稿锁浮现
                
                const ritualCircle = document.querySelector('.ritual-circle');
                if (ritualCircle) {
                    ritualCircle.style.opacity = '1';
                    ritualCircle.style.transform = 'scale(1)';
                }

                if (hintUi) {
                    hintUi.classList.remove('scene-style');
                    hintUi.style.opacity = '1';
                }
                guideText.innerText = "【第一步】轻触案上这本《臨樓物語》，翻开书页...";

                // 3. 复原首幕组件可见度
                if (propBooks) propBooks.style.display = 'block';
                if (propTea) propTea.style.display = 'block';
                if (propBaochai) propBaochai.style.display = 'block';

                // 4. 重置第一个视频的属性与路径
                const bgVideo = document.getElementById('scene-video');
                if (bgVideo) {
                    bgVideo.loop = true;
                    bgVideo.setAttribute('loop', 'loop');
                    bgVideo.src = "./image/baochai_book.mp4";
                    bgVideo.load();
                }

                // 5. 重新降临并切回第一阶段：书本舞台显现
                if (bookEntity) bookEntity.classList.remove('book-open-active');
                if (bookStage) {
                    bookStage.style.display = 'flex';
                    setTimeout(() => {
                        bookStage.style.opacity = '1';
                        bookStage.style.transform = 'scale(1) translateZ(0)';
                        bookStage.style.pointerEvents = 'auto';
                    }, 50);
                }

                // 6. 重置状态机步数
                currentStep = 0; 
                isEndingDialogueMode = false;
            }, 1500);
        });
    }
    */
    // ================= 🦋 【宝钗扑蝶】交互逻辑 =================
    let caughtCount = 0;
    let butterflyTimer = null;

    function enterButterflyStage() {
        const catchStage = document.getElementById('catch-butterfly-stage');
        if (!catchStage) return;

        caughtCount = 0;
        catchStage.classList.add('active');

        setTimeout(() => {
            catchStage.style.opacity = '1';
            triggerMiniToast("画面浮现", "正在走近西边花圃...");
            createGardenButterflies();
        }, 50);
    }

    function createGardenButterflies() {
        const container = document.getElementById('butterfly-container');
        if (!container) return;

        container.innerHTML = ""; 
        const colors = ['wing-jade', 'wing-white', 'wing-gold'];

        for (let i = 0; i < 12; i++) {
            const bt = document.createElement('div');
            bt.className = `live-butterfly ${colors[Math.floor(Math.random() * colors.length)]}`;
            bt.style.left = `${Math.random() * 85 + 5}vw`;
            bt.style.top = `${Math.random() * 70 + 10}vh`;

            bt.addEventListener('click', (e) => {
                e.stopPropagation();

                playCatchSound();

                bt.style.pointerEvents = 'none';
                bt.style.transform = 'scale(1.8)';
                bt.style.opacity = '0';
                setTimeout(() => { bt.remove(); }, 300);

                caughtCount++;

                if (caughtCount === 1) {
                    triggerMiniToast("扑蝶成功", "第一次扑蝶成功！接着扑蝶吧。");
                } else if (caughtCount === 2) {
                    triggerMiniToast("手疾眼快", "第二次扑蝶成功！还差最后一次。");
                } else if (caughtCount === 3) {
                    clearInterval(butterflyTimer);
                    container.innerHTML = ""; 

                    triggerMiniToast("香汗微融", "（大观园扑蝶动画）宝钗拿扇子掩面笑道：‘可把你累坏了。’");

                    setTimeout(() => {
                        const catchStage = document.getElementById('catch-butterfly-stage');
                        if (catchStage) {
                            catchStage.style.transition = 'opacity 1.5s ease';
                            catchStage.style.opacity = '0';
                            
                            setTimeout(() => {
                                catchStage.classList.remove('active');
                                
                                if (sceneStage) {
                                    sceneStage.style.display = 'block';
                                    setTimeout(() => { sceneStage.style.opacity = '1'; }, 50);
                                }
                                if (viewport) {
                                    viewport.style.display = 'block';
                                    setTimeout(() => { viewport.style.opacity = '1'; }, 50);
                                }

                                if (hintUi) hintUi.style.opacity = '0'; 
                                if (propBooks) propBooks.style.display = 'none';
                                if (propTea) propTea.style.display = 'none';
                                if (propBaochai) propBaochai.style.display = 'none';

                                const bgVideo = document.getElementById('scene-video');
                                if (bgVideo) {
                                    bgVideo.removeAttribute('loop');
                                    bgVideo.loop = false;
                                    bgVideo.muted = true; 
                                    
                                    bgVideo.src = "../image/baochai_butterfly.mp4"; 
                                    bgVideo.load();
                                    
                                    const playPromise = bgVideo.play();
                                    if (playPromise !== undefined) {
                                        playPromise.catch(error => {
                                            console.log("拦截降级处理:", error);
                                            bgVideo.muted = true;
                                            bgVideo.play();
                                        });
                                    }

                                    bgVideo.onended = () => {
                                        console.log("第二个漫游场景视频结束，正在无缝切入终章剧本与新对话图...");
                                        
                                        if (sceneStage) {
                                            sceneStage.style.transition = 'opacity 1.0s ease';
                                            sceneStage.style.opacity = '0';
                                        }

                                        setTimeout(() => {
                                            if (sceneStage) sceneStage.style.display = 'none';
                                            currentStep = 7; 

                                            const storyStage = document.getElementById('story-stage');
                                            const dialogueTextDom = document.getElementById('dialogue-text');
                                            const dialogueNameDom = document.getElementById('dialogue-name'); 
                                            const storyBg = document.getElementById('story-bg'); 

                                            if (storyStage && dialogueTextDom && dialogueNameDom) {
                                                
                                                if (storyBg) {
                                                    storyBg.src = "../image/ending_scene.jpg"; 
                                                }

                                                finalScriptIndex = 0;
                                                isEndingDialogueMode = true; 

                                                dialogueNameDom.innerText = finalEndingScript[finalScriptIndex].name;
                                                dialogueTextDom.innerHTML = finalEndingScript[finalScriptIndex].text;
                                                dialogueNameDom.style.background = "#8c241e"; 

                                                storyStage.classList.add('active');
                                                setTimeout(() => { storyStage.style.opacity = '1'; }, 50);
                                            }
                                        }, 1000);
                                    };
                                }

                                currentStep = 6; 
                            }, 1500);
                        }
                    }, 2000);
                }
            });

            container.appendChild(bt);
        }

        function flyAround() {
            const allButterflies = document.querySelectorAll('.live-butterfly');
            allButterflies.forEach(b => {
                const targetX = Math.random() * 85 + 5;
                const targetY = Math.random() * 70 + 10;
                const currentX = parseFloat(b.style.left) || 0;
                const direction = targetX > currentX ? 'rotateY(0deg)' : 'rotateY(180deg)';

                b.style.left = `${targetX}vw`;
                b.style.top = `${targetY}vh`;
                b.style.transform = `${direction} scale(${Math.random() * 0.3 + 0.85})`;
            });
        }

        setTimeout(flyAround, 100);
        butterflyTimer = setInterval(flyAround, 3500);
    }

    function triggerMiniToast(title, content) {
        const toastBox = document.getElementById('catch-toast-ui');
        const tTitle = document.getElementById('toast-title');
        const tContent = document.getElementById('toast-content');
        if (!toastBox) return;

        tTitle.innerText = title;
        tContent.innerText = content;
        toastBox.style.opacity = '1';

        setTimeout(() => { toastBox.style.opacity = '0'; }, 3000);
    }

// ==================== 🌸 宝钗篇谢幕：剧情回顾 / 大观园全景分流 ====================
const recapParams = new URLSearchParams(window.location.search);
const isReplayMode = recapParams.get('replay') === '1';
const shouldOpenRecap = recapParams.get('recap') === '1';

function hideAllStoryStagesForRecap() {
    ['book-stage', 'awakening-stage', 'scene-stage', 'scroll-container', 'catch-butterfly-stage', 'story-stage', 'hint-ui', 'fog-overlay', 'map-video-stage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.style.opacity = '0';
        }
    });
}

function showStoryRecap() {
    window.location.href = '../home.html?recap=1';
    return;
    // 先解除“回顾加载黑屏”，再只显示回顾界面，避免闪出其他篇章的器物界面。
    document.documentElement.classList.remove('recap-loading');
    document.body.classList.remove('replay-recap-mode');
    hideAllStoryStagesForRecap();
    const curtainStage = document.getElementById('curtain-call-stage');
    const recapStage = document.getElementById('story-recap-stage');
    const mapStage = document.getElementById('dagwanyuan-stage');

    if (curtainStage) {
        curtainStage.style.display = 'none';
        curtainStage.classList.remove('active');
        curtainStage.style.opacity = '0';
    }
    if (mapStage) {
        mapStage.style.display = 'none';
        mapStage.style.opacity = '0';
    }
    if (recapStage) {
        recapStage.style.display = 'flex';
        requestAnimationFrame(() => { recapStage.classList.add('active'); });
    }
}

function leaveRecapToMap() {
    window.location.href = '../index.html?map=1';
    return;
    const recapStage = document.getElementById('story-recap-stage');
    if (recapStage) {
        recapStage.classList.remove('active');
        recapStage.style.opacity = '0';
    }
    setTimeout(() => showDagwanyuanStage(), 700);
}

function replayChapter(chapter) {
    const routes = {
        baoyu: '../baoyu/index.html?replay=1&return=recap',
        daiyu: '../daiyu/index.html?replay=1&return=recap',
        baochai: './home.html?replay=1&return=recap'
    };
    const target = routes[chapter];
    if (!target) return;
    window.location.href = target;
}

window.addEventListener('load', () => {
    const curtainStage = document.getElementById('curtain-call-stage');
    const recapBtn = document.getElementById('story-recap-btn');
    const enterBtn = document.getElementById('enter-dagwanyuan-btn');
    const recapMapBtn = document.getElementById('recap-enter-map-btn');

    if (shouldOpenRecap) {
        showStoryRecap();
        requestAnimationFrame(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        });
    }

    const goToDagwanyuanMap = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (curtainStage) {
            curtainStage.style.transition = 'opacity 0.8s ease';
            curtainStage.style.opacity = '0';
            curtainStage.classList.remove('active');
        }
        setTimeout(() => {
            if (curtainStage) curtainStage.style.display = 'none';
            window.location.href = '../home.html?map=1';
        }, 800);
    };

    if (recapBtn) recapBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (curtainStage) {
            curtainStage.style.opacity = '0';
            curtainStage.classList.remove('active');
        }
        setTimeout(() => {
            window.location.href = '../home.html?recap=1';
        }, 800);
    });
    if (enterBtn) enterBtn.addEventListener('click', goToDagwanyuanMap);
    if (recapMapBtn) recapMapBtn.addEventListener('click', leaveRecapToMap);

    document.querySelectorAll('.recap-artifact').forEach(card => {
        card.addEventListener('click', () => replayChapter(card.dataset.chapter));
    });

    initDagwanyuanEvents();
});

// 显示大观园全景图
function showDagwanyuanStage() {
    const mapStage = document.getElementById('dagwanyuan-stage');
    if (mapStage) {
        mapStage.style.display = 'flex';
        mapStage.style.zIndex = '10000'; // 最顶层
        setTimeout(() => {
            mapStage.style.opacity = '1';
        }, 50);
    }
}


// ==================== 2. 全景图热点 & 视频播放队列逻辑 ====================

// 1. 潇湘馆（3 个视频）
const mapVideoPlaylistA = [
    "../image/screen1-1.mp4",
    "../image/screen1-2.mp4",
    "../image/screen1-3.mp4"
];

// 2. 怡红院（2 个视频）
const mapVideoPlaylistB = [
    "../image/screen2-1.mp4",
    "../image/screen2-2.mp4"
];

let mapCurrentPlaylist = [];
let mapCurrentVideoIndex = 0;
let activeVideoEl = null;
let hiddenVideoEl = null;

// 显示大观园全景图
function showDagwanyuanStage() {
    const mapStage = document.getElementById('dagwanyuan-stage');
    if (mapStage) {
        mapStage.style.display = 'flex';
        mapStage.style.zIndex = '1000';
        setTimeout(() => {
            mapStage.style.opacity = '1';
        }, 50);
    }
}

// 初始化全景图内部交互
function initDagwanyuanEvents() {
    const hotspot1 = document.getElementById('hotspot-1');
    const hotspot2 = document.getElementById('hotspot-2');
    const backBtn = document.getElementById('back-to-map-btn');

    if (hotspot1) {
        hotspot1.addEventListener('click', (e) => {
            triggerHotspotZoom(e, mapVideoPlaylistA);
        });
    }

    if (hotspot2) {
        hotspot2.addEventListener('click', (e) => {
            triggerHotspotZoom(e, mapVideoPlaylistB);
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            backToDagwanyuanMap();
        });
    }
}

// 点击热点 ➔ 镜头拉近放大 ➔ 切换到视频播放
function triggerHotspotZoom(event, playlist) {
    const dagwanyuanMap = document.getElementById('dagwanyuan-map');
    
    mapCurrentPlaylist = playlist; // 自动读取是 3 个还是 2 个视频
    mapCurrentVideoIndex = 0;

    if (dagwanyuanMap) {
        const rect = dagwanyuanMap.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const originXPercent = (offsetX / rect.width) * 100;
        const originYPercent = (offsetY / rect.height) * 100;

        dagwanyuanMap.style.transformOrigin = `${originXPercent}% ${originYPercent}%`;
        dagwanyuanMap.style.transform = 'scale(3.5)';
    }

    document.querySelectorAll('.map-hotspot').forEach(el => el.style.opacity = '0');
    const hint = document.getElementById('map-hint-ui');
    if (hint) hint.style.opacity = '0';

    setTimeout(() => {
        const videoStage = document.getElementById('map-video-stage');
        const backBtn = document.getElementById('back-to-map-btn');

        if (backBtn) backBtn.style.display = 'none';

        if (videoStage) {
            videoStage.style.display = 'block';
            setTimeout(() => { videoStage.style.opacity = '1'; }, 50);
            playMapVideo(); // 播放组内的第 1 个视频
        }
    }, 2000);
}

// 播放组内第 1 个视频
function playMapVideo() {
    activeVideoEl = document.getElementById('map-video-A');
    hiddenVideoEl = document.getElementById('map-video-B');

    if (!activeVideoEl || !mapCurrentPlaylist[mapCurrentVideoIndex]) return;

    if (activeVideoEl._timeCheck) clearInterval(activeVideoEl._timeCheck);
    if (hiddenVideoEl._timeCheck) clearInterval(hiddenVideoEl._timeCheck);

    // 初始位置设置
    activeVideoEl.className = 'map-video-player video-active';
    hiddenVideoEl.className = 'map-video-player video-next-right';

    activeVideoEl.src = mapCurrentPlaylist[mapCurrentVideoIndex];
    activeVideoEl.play().catch(err => console.warn("自动播放受限:", err));

    // 监听播放倒计时，提前 4.0 秒开始平移
    bindVideoScrollTrigger(activeVideoEl);
}

// 倒计时监听：视频结束前 4.0 秒平滑展开下一个画卷
function bindVideoScrollTrigger(videoEl) {
    if (videoEl._timeCheck) clearInterval(videoEl._timeCheck);

    let triggered = false;

    videoEl._timeCheck = setInterval(() => {
        if (!videoEl.duration) return;

        const remainingTime = videoEl.duration - videoEl.currentTime;
        
        // 距离结束还有 4.0 秒时，自动向左缓速推入下一个画卷
        if (remainingTime <= 4.0 && !triggered) {
            triggered = true;
            clearInterval(videoEl._timeCheck);

            mapCurrentVideoIndex++;
            if (mapCurrentVideoIndex < mapCurrentPlaylist.length) {
                slideNextMapVideo();
            } else {
                const backBtn = document.getElementById('back-to-map-btn');
                if (backBtn) backBtn.style.display = 'block';
            }
        }
    }, 100);
}

// 统一向左无缝平移推镜
function slideNextMapVideo() {
    const nextSrc = mapCurrentPlaylist[mapCurrentVideoIndex];
    if (!nextSrc || !activeVideoEl || !hiddenVideoEl) return;

    // 1. 禁用 transition，瞬间将即将切入的 video 强制复位到屏幕【正右侧】(translateX(100%))
    hiddenVideoEl.style.transition = 'none';
    hiddenVideoEl.className = 'map-video-player video-next-right';
    hiddenVideoEl.src = nextSrc;

    // 2. 视频准备好后开始平移动画
    hiddenVideoEl.oncanplay = () => {
        hiddenVideoEl.oncanplay = null;

        hiddenVideoEl.play();

        // 强行刷新 DOM 渲染状态，确保 CSS transition 重新生效且方向统一（恒定从右向左推入）
        void hiddenVideoEl.offsetWidth;

        setTimeout(() => {
            // 重新开启 4.0s 动画过渡
            hiddenVideoEl.style.transition = '';
            activeVideoEl.style.transition = '';

            // 旧画面向左滑出 (-100%)，新画面从右侧滑入 (0%)
            activeVideoEl.className = 'map-video-player video-exit-left';
            hiddenVideoEl.className = 'map-video-player video-active';

            // 交换角色
            const temp = activeVideoEl;
            activeVideoEl = hiddenVideoEl;
            hiddenVideoEl = temp;

            // 继续监听新画面的倒计时
            bindVideoScrollTrigger(activeVideoEl);
        }, 50);
    };
}

// 从视频返回全景图
function backToDagwanyuanMap() {
    const videoStage = document.getElementById('map-video-stage');
    const dagwanyuanMap = document.getElementById('dagwanyuan-map');

    if (activeVideoEl) activeVideoEl.pause();
    if (hiddenVideoEl) hiddenVideoEl.pause();

    if (videoStage) {
        videoStage.style.opacity = '0';
        setTimeout(() => {
            videoStage.style.display = 'none';

            if (dagwanyuanMap) {
                dagwanyuanMap.style.transform = 'scale(1)';
            }

            document.querySelectorAll('.map-hotspot').forEach(el => el.style.opacity = '1');
            const hint = document.getElementById('map-hint-ui');
            if (hint) hint.style.opacity = '1';
        }, 800);
    }
}
});