document.addEventListener('DOMContentLoaded', () => {
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

    // 1. 解析 URL 中的参数，判断是否来自剧情回顾
const urlParams = new URLSearchParams(window.location.search);
const isFromRecap = urlParams.get('from') === 'recap';

// 2. 宝玉篇结束/跳转下一个节点的函数
function goToNextChapter() {
    if (isFromRecap) {
        // 来自剧情回顾：独立播放完毕，直接返回根目录的剧情回顾界面
        window.location.href = '../home.html?recap=1';
    } else {
        // 第一次正常流程：进入下一篇（黛玉篇）
        window.location.href = '../daiyu/index.html';
    }
}

    // 初始即为书本展开状态，处于“点击内页通灵宝玉”阶段 (Step 1)
    let currentStep = 1;

    // 1. 轻触内页通灵宝玉进入玉石觉醒舞台
    if (bookEntity) {
        bookEntity.addEventListener('click', () => {
            if (currentStep === 1) {
                if (bookStage) bookStage.style.opacity = '0';
                setTimeout(() => {
                    if (bookStage) bookStage.style.display = 'none';
                    if (awakeningStage) awakeningStage.style.display = 'flex';
                    setTimeout(() => {
                        if (awakeningStage) awakeningStage.style.opacity = '1';
                        if (guideText) guideText.innerText = "【第二步】触碰通灵宝玉，为器物注入神瑛侍者之魂...";
                        currentStep = 2;
                    }, 50);
                }, 1000); 
            }
        });
    }

    // 2. 玉石觉醒扩散
    if (goldLock) {
        goldLock.addEventListener('click', () => {
            if (currentStep !== 2) return;
            currentStep = 3; 

            const ritualCircle = document.querySelector('.ritual-circle');
            if (ritualCircle) {
                ritualCircle.style.opacity = '0';
                ritualCircle.style.transform = 'scale(1.08)';
            }

            if (lockColored) lockColored.classList.add('bleed-active');
            if (lockSketch) lockSketch.style.opacity = '0';
            setTimeout(() => {
                const maskCircle = document.getElementById('mask-circle');
                if (maskCircle) { maskCircle.setAttribute('r', '500'); }
            }, 50);
            setTimeout(() => {
                if (fogOverlay) {
                    fogOverlay.style.display = 'block';
                    fogOverlay.classList.add('fog-active'); 
                }
                
                setTimeout(() => {
                    if (awakeningStage) awakeningStage.style.display = 'none'; 
                    if (sceneStage) sceneStage.style.display = 'block';    
                    if (hintUi) hintUi.classList.add('scene-style'); 

                    setTimeout(() => { 
                        if (sceneStage) sceneStage.style.opacity = '1'; 
                        if (hintUi) hintUi.style.opacity = '0'; 
                    }, 50);
                }, 1300); 

                setTimeout(() => { 
                    if (fogOverlay) fogOverlay.style.display = 'none'; 
                    currentStep = 4; 
                }, 5000);

            }, 2500);
        });
    }

    // 3. 漫游机制
    let camX = 0, camZ = 0, mouseX = 0;
    let curCamX = 0, curCamZ = 0, curMouseX = 0;
    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });
    window.addEventListener('mousemove', (e) => { if (currentStep === 4 || currentStep === 6) mouseX = ((e.clientX / window.innerWidth) - 0.5) * 120; });

    function updateCam() {
        if (currentStep === 4 || currentStep === 6) {
            if (keys.w) camZ += 4; if (keys.s) camZ -= 4; if (keys.a) camX -= 4; if (keys.d) camX += 4;
            camX = Math.max(-80, Math.min(80, camX)); camZ = Math.max(-40, Math.min(120, camZ));
            curCamX += (camX - curCamX) * 0.08; curCamZ += (camZ - curCamZ) * 0.08; curMouseX += (mouseX - curMouseX) * 0.08;
            if (scrollContainer) scrollContainer.style.transform = `translate3d(${-curCamX - curMouseX}px, 0, ${curCamZ}px) rotateY(${(-curMouseX/120)*4}deg)`;
        }
        requestAnimationFrame(updateCam);
    }
    updateCam();

    // 4. 场景器物局部高级互动
    const scrollViewport = document.getElementById('scroll-container');
    if (scrollViewport) {
        // 【局部器物一：雕花胭脂盒】
        const rougeGlowLayer = document.createElement('div');
        rougeGlowLayer.className = 'local-glow-element glow-rouge-box';
        rougeGlowLayer.style.left = '300px'; rougeGlowLayer.style.top = '600px'; rougeGlowLayer.style.width = '280px'; rougeGlowLayer.style.height = '180px';
        rougeGlowLayer.addEventListener('click', (e) => {
            e.stopPropagation(); if (currentStep !== 4) return;
            if (hintUi && guideText) {
                hintUi.style.opacity = '1';
                guideText.innerHTML = "<b>【雕花胭脂盒】</b><br>红茉莉花瓣配以上等玫瑰卤研碎而成，是他在绛芸轩里最爱淘漉的女儿家玩意。";
                setTimeout(() => { if(currentStep === 4) hintUi.style.opacity = '0'; }, 5000);
            }
        });
        scrollViewport.appendChild(rougeGlowLayer);

        // 【局部器物二：书桌宣纸】
        const paperGlowLayer = document.createElement('div');
        paperGlowLayer.className = 'local-glow-element glow-desk-paper';
        paperGlowLayer.style.left = '520px'; paperGlowLayer.style.top = '650px'; paperGlowLayer.style.width = '480px'; paperGlowLayer.style.height = '200px'; paperGlowLayer.style.transform = 'rotate(4deg)';
        paperGlowLayer.addEventListener('click', (e) => {
            e.stopPropagation(); if (currentStep !== 4) return;
            if (hintUi && guideText) {
                hintUi.style.opacity = '1';
                guideText.innerHTML = "<b>【太虚仙训】</b><br>梦中警幻仙姑所授。‘孽海情天，大梦先觉’，窥看见了金陵女子册籍宿命。";
                setTimeout(() => { if(currentStep === 4) hintUi.style.opacity = '0'; }, 5000);
            }
        });
        scrollViewport.appendChild(paperGlowLayer);

        // 【局部人物：贾宝玉】
        const characterGlowLayer = document.createElement('div');
        characterGlowLayer.className = 'local-glow-element glow-character';
        characterGlowLayer.style.left = '760px'; characterGlowLayer.style.top = '280px'; characterGlowLayer.style.width = '240px'; characterGlowLayer.style.height = '520px';
        characterGlowLayer.addEventListener('click', (e) => {
            e.stopPropagation(); if (currentStep !== 4) return;
            currentStep = 5; isEndingDialogueMode = false;
            if (hintUi) hintUi.style.opacity = '0';

            const storyStage = document.getElementById('story-stage');
            const dialogueTextDom = document.getElementById('dialogue-text');
            const dialogueNameDom = document.getElementById('dialogue-name');

            if (storyStage && dialogueTextDom && dialogueNameDom) {
                currentLineIndex = 0;
                dialogueNameDom.innerText = storyScript[currentLineIndex].name;
                dialogueTextDom.innerHTML = storyScript[currentLineIndex].text;
                dialogueNameDom.style.background = "#8c241e";

                if (sceneStage) {
                    sceneStage.style.transition = 'opacity 1.0s ease';
                    sceneStage.style.opacity = '0';
                }

                setTimeout(() => {
                    if (sceneStage) sceneStage.style.display = 'none';
                    storyStage.classList.add('active');
                    storyStage.style.display = 'block';
                    setTimeout(() => {
                        storyStage.style.opacity = '1';
                        storyStage.classList.add('fade-in');
                    }, 50);
                }, 1000);
            }
        });
        scrollViewport.appendChild(characterGlowLayer);
    }

    // 5. 剧情对白数据
    const storyScript = [
        { name: "宝玉", text: "“哎呀，你是从哪来的？这通灵宝玉刚才竟发了热，我就猜一定是有知己来了！”" },
        { name: "宝玉", text: "“我正忙着一件要紧事呢。丫头们新采了些红茉莉花，我正打算将它们淘漉研碎，调一盒最上等的冷香胭脂。”" },
        { name: "我",   text: "“古法调香颇为繁复，我来帮你一起弄吧。”" },
        { name: "宝玉", text: "“那敢情好！来，咱们这就到案前。先淘花蕊，再用玉杵研磨，有你相助，这盒胭脂定是绝妙！”" }
    ];

    const finalEndingScript = [
        { name: "宝玉", text: "（身穿一袭大红猩猩毡斗篷，身后的繁华渐化作无边白雪）“多谢你陪我调了最后一盒胭脂。繁华落尽，这场富贵大梦，我也该醒了。”" },
        { name: "宝玉", text: "（双手合合，微微躬身）“神瑛侍者该回赤瑕宫了。若你日后再次翻开这本《红楼物语》，便去潇湘馆瞧瞧吧，林妹妹兴许正等在哪儿呢。”" }
    ];

    let currentLineIndex = 0;
    let finalScriptIndex = 0;
    let isEndingDialogueMode = false; 
    
    function advanceStory() {
        if (isEndingDialogueMode) {
            finalScriptIndex++;
            if (finalScriptIndex < finalEndingScript.length) {
                document.getElementById('dialogue-name').innerText = finalEndingScript[finalScriptIndex].name;
                document.getElementById('dialogue-text').innerHTML = finalEndingScript[finalScriptIndex].text;
                document.getElementById('dialogue-name').style.background = "#8c241e";
            } else {
                const sStage = document.getElementById('story-stage');
                if (sStage) sStage.style.opacity = '0';
                setTimeout(() => { 
                    if (sStage) sStage.style.display = 'none';
                    if (curtainStage) {
                        curtainStage.style.display = 'flex';
                        curtainStage.classList.add('active'); 
                    }
                }, 1000);
            }
            return;
        }

        currentLineIndex++;
        if (currentLineIndex < storyScript.length) {
            const dName = document.getElementById('dialogue-name');
            const dText = document.getElementById('dialogue-text');
            if (dName) dName.innerText = storyScript[currentLineIndex].name;
            if (dText) dText.innerHTML = storyScript[currentLineIndex].text;
            if (dName) dName.style.background = storyScript[currentLineIndex].name === "我" ? "#2e4e3f" : "#8c241e";
        } else {
            const sStage = document.getElementById('story-stage');
            if (sStage) sStage.style.opacity = '0';
            setTimeout(() => { 
                if (sStage) sStage.classList.remove('active', 'fade-in'); 
                enterCatchButterflyGame();
            }, 1500);
        }
    }

    const nextBtn = document.getElementById('dialogue-next-btn');
    if (nextBtn) { nextBtn.addEventListener('click', (e) => { e.stopPropagation(); advanceStory(); }); }

    // 6. 古法特制胭脂小游戏舞台
    const catchButterflyStage = document.getElementById('catch-butterfly-stage');
    const butterflyContainer = document.getElementById('butterfly-container');
    let collectedCount = 0;
    let butterflyTimer = null;
    let currentCraftStage = 1; 
    let isWaitingForVesselClick = false; 

    let pestleAnimFrame = null;

// 启动捣杵左右晃动+上下捣压动画
function startPestleGrinding(vessel) {
    // 自动寻找研杵元素：优先查找 class 包含 pestle 的，找不到则查找 vessel 内部的 img 元素
    const pestle = vessel.querySelector('.pestle') || 
                   vessel.querySelector('[class*="pestle"]') || 
                   vessel.querySelector('img');

    if (!pestle) {
        console.error("【调试提示】未在研钵内找到研杵元素，请检查 HTML 结构或 Class 名称！");
        return;
    }

    // 暂停 CSS 中可能冲突的原生 animation 动画
    pestle.style.setProperty('animation', 'none', 'important');

    let startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = (currentTime - startTime) / 1000; // 转换为秒
        
        // 计算左右(X)、上下(Y)偏移量与倾斜角度
        const offsetX = Math.sin(elapsed * 15) * 15; // 左右晃动 15px
        const offsetY = Math.cos(elapsed * 20) * 8;  // 上下捣压 8px
        const rotateDeg = Math.sin(elapsed * 12) * 20; // 倾斜 20 度

        // 使用 setProperty 加上 !important，强行覆盖 CSS 原有样式
        pestle.style.setProperty(
            'transform', 
            `translate(${offsetX}px, ${offsetY}px) rotate(${rotateDeg}deg)`, 
            'important'
        );

        pestleAnimFrame = requestAnimationFrame(animate);
    }

    pestleAnimFrame = requestAnimationFrame(animate);
}

// 停止研磨动画并重置位置
function stopPestleGrinding(vessel) {
    if (pestleAnimFrame) {
        cancelAnimationFrame(pestleAnimFrame);
        pestleAnimFrame = null;
    }

    const pestle = vessel.querySelector('.pestle') || 
                   vessel.querySelector('[class*="pestle"]') || 
                   vessel.querySelector('img');

    if (pestle) {
        // 清除内联 transform 和 animation 样式，恢复默认
        pestle.style.removeProperty('transform');
        pestle.style.removeProperty('animation');
    }
}

    function enterCatchButterflyGame() {
        if (hintUi) hintUi.style.opacity = '0';
        currentStep = 6; 
        currentCraftStage = 1;
        isWaitingForVesselClick = false;
        
        const dynamicSceneStage = document.getElementById('scene-stage');
        const dynamicStoryStage = document.getElementById('story-stage');
        
        if (dynamicSceneStage) dynamicSceneStage.style.display = 'none';
        if (dynamicStoryStage) dynamicStoryStage.style.display = 'none';
        
        if (catchButterflyStage) {
            catchButterflyStage.style.setProperty('display', 'block', 'important');
            catchButterflyStage.classList.add('active');
            setTimeout(() => { catchButterflyStage.style.opacity = '1'; }, 50);
        }

        collectedCount = 0;
        const progressFill = document.getElementById('perfume-progress-fill');
        if (progressFill) progressFill.style.width = '0%';
        
        triggerMiniToast("古法制脂", "请点击空中飘落的红茉莉花瓣，洗练精制胭脂...");

        if (butterflyContainer) butterflyContainer.innerHTML = '';

        if (butterflyTimer) clearInterval(butterflyTimer);
        butterflyTimer = setInterval(() => { createFallingPetal(); }, 350);
    }

    function createFallingPetal() {
        if (!butterflyContainer || isWaitingForVesselClick) return;

        const petal = document.createElement('div');
        petal.className = 'butterfly'; 
        
        const startLeft = Math.random() * 90 + 5; 
        const duration = Math.random() * 2.5 + 3.5; 
        petal.style.left = startLeft + 'vw';
        petal.style.top = '-5vh';
        petal.style.animation = `fallAndSway ${duration}s linear forwards`;

        petal.addEventListener('mouseenter', () => {
            if (petal.classList.contains('is-flying')) return;
            const rect = petal.getBoundingClientRect();
            petal.style.animation = 'none';
            petal.style.left = rect.left + 'px';
            petal.style.top = rect.top + 'px';
            petal.style.position = 'fixed'; 
        });

        petal.addEventListener('click', (e) => {
            e.stopPropagation();
            if (petal.classList.contains('is-flying') || isWaitingForVesselClick) return; 
            petal.classList.add('is-flying');

            let targetId = 'vessel-first';
            if (collectedCount >= 3 && collectedCount < 7) {
                targetId = 'vessel-second';
            } else if (collectedCount >= 7) {
                targetId = 'vessel-third';
            }
            
            const targetVessel = document.getElementById(targetId);
            if (targetVessel) {
                const petalRect = petal.getBoundingClientRect();
                const vesselRect = targetVessel.getBoundingClientRect();
                const deltaX = (vesselRect.left + vesselRect.width / 2) - (petalRect.left + petalRect.width / 2);
                const deltaY = (vesselRect.top + vesselRect.height / 2) - (petalRect.top + petalRect.height / 2);

                petal.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease';
                petal.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(720deg)`;
                petal.style.opacity = '0.3';
            }

            setTimeout(() => { petal.remove(); }, 800);

            collectedCount++;
            
            const progressFill = document.getElementById('perfume-progress-fill');
            if (progressFill) progressFill.style.width = Math.min(collectedCount * 10, 100) + '%';

            if (collectedCount === 3 && currentCraftStage === 1) {
                isWaitingForVesselClick = true;
                clearInterval(butterflyTimer); 
                triggerMiniToast("【清音提示】", "第一步淘洗已满，请轻触【青瓷盆】激荡清泉...");
                const v1 = document.getElementById('vessel-first');
                if (v1) v1.classList.add('stage-highlight');
            } else if (collectedCount === 7 && currentCraftStage === 2) {
                isWaitingForVesselClick = true;
                clearInterval(butterflyTimer); 
                triggerMiniToast("【清音提示】", "第二步捣烂已满，请轻触【白砂研钵】全速研磨...");
                const v2 = document.getElementById('vessel-second');
                if (v2) v2.classList.add('stage-highlight');
            } else if (collectedCount >= 10) {
                clearInterval(butterflyTimer);
                handleGameComplete();
            }
        });

        butterflyContainer.appendChild(petal);
    }

    const vessel1 = document.getElementById('vessel-first');
    const vessel2 = document.getElementById('vessel-second');

    if (vessel1) {
        vessel1.addEventListener('click', (e) => {
            e.stopPropagation();
            if (collectedCount === 3 && isWaitingForVesselClick && currentCraftStage === 1) {
                vessel1.classList.remove('stage-highlight');
                createSplashParticles(vessel1, '#71a1c2'); 
                
                isWaitingForVesselClick = false;
                currentCraftStage = 2;
                triggerMiniToast("【第二步：捣烂】", "水洗完成！请继续收集花瓣投入白砂研钵...");
                
                if (butterflyTimer) clearInterval(butterflyTimer);
                butterflyTimer = setInterval(() => { createFallingPetal(); }, 350);
            }
        });
    }

    if (vessel2) {
        vessel2.addEventListener('click', (e) => {
            e.stopPropagation();
            if (collectedCount === 7 && isWaitingForVesselClick && currentCraftStage === 2) {
                vessel2.classList.remove('stage-highlight');
                
                // 1. 启动 JS 动态摇晃与捣压动画
                vessel2.classList.add('pestle-fast-active');
                startPestleGrinding(vessel2);

                // 2. 产生红色花瓣溅射粒子
                createSplashParticles(vessel2, '#e63946'); 

                // 3. 研磨 1.5 秒后自动停止动画
                setTimeout(() => {
                    vessel2.classList.remove('pestle-fast-active');
                    stopPestleGrinding(vessel2); // <-- 停止 JS 动画并重置坐标

                    isWaitingForVesselClick = false;
                    currentCraftStage = 3;
                    triggerMiniToast("【第三步：凝脂】", "已捣成花泥！最后收集3片花瓣封入描金玉盒...");
                    
                    if (butterflyTimer) clearInterval(butterflyTimer);
                    butterflyTimer = setInterval(() => { createFallingPetal(); }, 350);
                }, 1500); 
            }
        });
    }

    function createSplashParticles(element, color) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        for (let i = 0; i < 24; i++) {
            const p = document.createElement('div');
            p.className = 'splash-particle';
            p.style.backgroundColor = color;
            p.style.left = centerX + 'px';
            p.style.top = centerY + 'px';

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 80 + 40;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity - 60;

            p.style.setProperty('--x', `${x}px`);
            p.style.setProperty('--y', `${y}px`);
            
            const size = Math.random() * 6 + 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            document.body.appendChild(p);
            setTimeout(() => { p.remove(); }, 800);
        }
    }

    function handleGameComplete() {
        if (catchButterflyStage) {
            catchButterflyStage.style.opacity = '0';
            setTimeout(() => { catchButterflyStage.style.setProperty('display', 'none', 'important'); }, 800);
        }
        
        const videoElement = document.getElementById('transition-video');
        const videoStage = document.getElementById('video-stage');
        
        if (videoElement && videoStage) {
            videoStage.style.display = 'block';
            setTimeout(() => { videoStage.style.opacity = '1'; }, 50);
            videoElement.play();
            
            videoElement.onended = () => {
                videoStage.style.opacity = '0';
                setTimeout(() => { videoStage.style.display = 'none'; }, 1000);
                
                isEndingDialogueMode = true; 
                finalScriptIndex = 0;
                
                const storyStage = document.getElementById('story-stage');
                const dName = document.getElementById('dialogue-name');
                const dText = document.getElementById('dialogue-text');
                
                if (storyStage && dName && dText) {
                    dName.innerText = finalEndingScript[0].name;
                    dName.style.background = "#8c241e";
                    dText.innerHTML = finalEndingScript[0].text;
                    
                    storyStage.style.display = 'block';
                    storyStage.classList.add('active');
                    setTimeout(() => { 
                        storyStage.style.opacity = '1'; 
                        storyStage.classList.add('fade-in');
                    }, 50);
                }
            };
        }
    }

    // 返回键绑定
    const backToBookBtn = document.getElementById('back-to-book');
    const backToAwakeningBtn = document.getElementById('back-to-awakening');
    const backToWanderBtn = document.getElementById('back-to-wander');
    const backToSceneBtn = document.getElementById('back-to-scene');

    if (backToBookBtn) {
        backToBookBtn.addEventListener('click', () => {
            if(awakeningStage) awakeningStage.style.display = 'none';
            if(bookStage) { bookStage.style.display = 'flex'; bookStage.style.opacity = '1'; }
            if(guideText) guideText.innerText = "【第一步】轻触内页通灵宝玉，释放其封存的顽石记忆...";
            currentStep = 1;
        });
    }
    if (backToAwakeningBtn) {
        backToAwakeningBtn.addEventListener('click', () => {
            if(sceneStage) sceneStage.style.display = 'none';
            if(awakeningStage) { awakeningStage.style.display = 'flex'; awakeningStage.style.opacity = '1'; }
            if(guideText) guideText.innerText = "【第二步】触碰通灵宝玉，为器物注入神瑛侍者之魂...";
            currentStep = 2;
        });
    }
    if (backToWanderBtn) {
        backToWanderBtn.addEventListener('click', () => {
            if(catchButterflyStage) catchButterflyStage.style.setProperty('display', 'none', 'important');
            if(sceneStage) { sceneStage.style.display = 'block'; sceneStage.style.opacity = '1'; }
            if(butterflyTimer) clearInterval(butterflyTimer);
            currentStep = 4;
        });
    }
    if (backToSceneBtn) {
        backToSceneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sStage = document.getElementById('story-stage');
            if(sStage) sStage.style.display = 'none';
            if(sceneStage) { sceneStage.style.display = 'block'; sceneStage.style.opacity = '1'; }
            currentStep = 4;
        });
    }

    function triggerMiniToast(t, c) { 
        const toastBox = document.getElementById('catch-toast-ui');
        if (!toastBox) return;
        document.getElementById('toast-title').innerText = t; 
        document.getElementById('toast-content').innerText = c; 
        toastBox.style.opacity = '1'; 
        toastBox.style.display = 'block'; 
    }

    if (curtainStage) {
        curtainStage.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            curtainStage.style.opacity = '0';
            setTimeout(() => {
                // 直接使用顶部已经定义好、支持 ?from=recap 判断的函数
                goToNextChapter();
            }, 1000);
        });
    }
});