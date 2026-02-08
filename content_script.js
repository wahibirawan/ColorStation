const V={defaultFormat:"hex",defaultSamplingSize:1,showGrid:!0,preferNativeEyeDropper:!1,loupeZoom:10},W=[1,3,5,11,25],K=[8,10,12,15,20],Z=5,b="cs-force-crosshair",Q=["a","button","input","select","textarea","summary","label",'[role="button"]','[role="menuitem"]',"[tabindex]","[onclick]","[onmouseenter]","[onmouseover]","[data-hover]","[data-state]",'[class*="hover"]','[class*="active"]'].join(", ");class j{samplingModes=[...W];zoomSteps=[...K];loupePixels=15;liveFastIntervalMs=260;liveHoverIntervalMs=320;liveSlowIntervalMs=900;motionProbeIntervalMs=80;minDynamicCaptureGapMs=420;minInteractiveCaptureGapMs=460;minIdleCaptureGapMs=680;settings={...V};history=[];state="idle";pointerX=0;pointerY=0;samplingIndex=0;zoomIndex=1;gridEnabled=!0;capture=null;captureVersion=0;latestColor=null;targetLoupeX=0;targetLoupeY=0;loupeX=0;loupeY=0;loupePositionReady=!1;rafId=null;recaptureTimer=null;liveRecaptureTimer=null;freezeTimer=null;confirmFadeTimer=null;confirmEndTimer=null;captureInFlight=!1;captureQueued=!1;motionProbeStamp=0;hoverDynamicSurface=!1;hoverInteractiveSurface=!1;hoverTargetFingerprint="";lastCaptureTimestamp=0;lastRenderedCaptureVersion=-1;lastRenderedMappedX=-1;lastRenderedMappedY=-1;swatchPulseTimer=null;loupePulseTimer=null;previousReadoutColor=null;lastSwatchPulseAt=0;captureFailureStreak=0;previousCursor="";pickingEventsBound=!1;styleElement=null;rootElement=null;overlayElement=null;reticleElement=null;loupeElement=null;loupeCanvas=null;loupeContext=null;swatchElement=null;hexElement=null;rgbElement=null;hslElement=null;metaElement=null;confirmElement=null;readyIndicatorElement=null;postActionsElement=null;historyButtonElement=null;historyPopoverElement=null;historyListElement=null;historyPopoverOpen=!1;historyOutsideBound=!1;postKeyBound=!1;waitingForCursor=!1;hasCursorSeed=!1;onRuntimeMessage=(t,e,i)=>{if(t.type==="FAST_COLOR_PICKER_START")return this.start(t.payload).then(()=>i({ok:!0})).catch(s=>{i({ok:!1,error:s instanceof Error?s.message:String(s)})}),!0};onPointerMove=t=>{if(this.state==="picking"){if(this.pointerX=this.clamp(t.clientX,0,Math.max(window.innerWidth-1,0)),this.pointerY=this.clamp(t.clientY,0,Math.max(window.innerHeight-1,0)),this.updateMotionHint(t),this.waitingForCursor){this.waitingForCursor=!1,this.hasCursorSeed=!0,this.hideReadyIndicator(),this.updateReticlePosition(),this.updateLoupeTarget(),this.applyLoupePosition(!0),this.setIndicatorVisibility(!0),this.armLiveRecapture(!0),this.scheduleFrame();return}this.updateReticlePosition(),this.updateLoupeTarget(),this.scheduleFrame()}};onPointerDown=t=>{if(this.state==="picking"){if(t.button===2){t.preventDefault(),t.stopPropagation(),typeof t.stopImmediatePropagation=="function"&&t.stopImmediatePropagation();return}t.preventDefault(),t.stopPropagation()}};onClick=t=>{this.state==="picking"&&(t.preventDefault(),t.stopPropagation(),typeof t.stopImmediatePropagation=="function"&&t.stopImmediatePropagation(),this.confirmPick())};onContextMenu=t=>{this.state==="picking"&&(t.preventDefault(),t.stopPropagation(),typeof t.stopImmediatePropagation=="function"&&t.stopImmediatePropagation(),this.exit())};onKeyDown=t=>{if(this.state!=="idle"){if(t.key==="Escape"){t.preventDefault(),t.stopPropagation(),this.exit();return}if(this.state==="picking"){if(t.key===" "||t.key==="Spacebar"){t.preventDefault(),t.stopPropagation(),this.cycleSamplingMode();return}if(t.key==="g"||t.key==="G"){t.preventDefault(),t.stopPropagation(),this.gridEnabled=!this.gridEnabled,this.invalidateRenderedFrame(),this.latestColor&&this.updateReadout(this.latestColor),this.scheduleFrame();return}if(t.key==="+"||t.key==="="){t.preventDefault(),t.stopPropagation(),this.adjustZoom(1);return}(t.key==="-"||t.key==="_")&&(t.preventDefault(),t.stopPropagation(),this.adjustZoom(-1))}}};onViewportMutation=()=>{this.state==="picking"&&this.queueRecapture()};onDocumentPointerDown=t=>{if(!this.historyPopoverOpen||!this.postActionsElement)return;const e=t.target;if(!(e instanceof Node)){this.setHistoryPopoverOpen(!1);return}this.postActionsElement.contains(e)||this.setHistoryPopoverOpen(!1)};onPostKeyDown=t=>{if(this.state!=="post"||t.key!=="Enter")return;const e=t.target;e instanceof HTMLElement&&(e.closest("#cs-history-popover")||e.closest("#cs-post-actions button"))||(t.preventDefault(),t.stopPropagation(),this.startCapturePicker())};constructor(){chrome.runtime.onMessage.addListener(this.onRuntimeMessage)}setState(t){this.state=t,this.rootElement&&(this.rootElement.dataset.state=t)}async start(t){if(this.settings={...V,...t?.settings??{}},this.history=Array.isArray(t?.history)?t.history:[],t?.mode==="native"){await this.startNativePicker();return}await this.startCapturePicker()}async startCapturePicker(){this.stopSession(!1),this.samplingIndex=Math.max(this.samplingModes.indexOf(this.settings.defaultSamplingSize),0),this.zoomIndex=this.getClosestZoomIndex(this.settings.loupeZoom),this.gridEnabled=this.settings.showGrid,this.waitingForCursor=!0,this.hasCursorSeed=!1,this.hoverDynamicSurface=!1,this.hoverInteractiveSurface=!1,this.hoverTargetFingerprint="",this.motionProbeStamp=0,this.captureQueued=!1,this.lastCaptureTimestamp=0,this.captureVersion=0,this.lastRenderedCaptureVersion=-1,this.lastRenderedMappedX=-1,this.lastRenderedMappedY=-1,this.previousReadoutColor=null,this.lastSwatchPulseAt=0,this.captureFailureStreak=0,this.ensureHostUi(),this.mountOverlay(),this.bindPickingEvents(),this.hideCursor(),this.setState("picking"),this.setIndicatorVisibility(!1),this.showReadyIndicator(),this.captureInFlight=!0,this.setCaptureBusy(!0);try{await this.captureViewport(),this.lastCaptureTimestamp=performance.now()}catch{this.exit();return}finally{this.captureInFlight=!1,this.setCaptureBusy(!1)}this.captureQueued&&(this.captureQueued=!1,this.captureViewportGuarded("queued")),this.armLiveRecapture(),this.hasCursorSeed&&this.scheduleFrame()}async startNativePicker(){this.stopSession(!1);const t=this.getEyeDropperCtor();if(!t){this.exit();return}try{const e=await new t().open(),i=this.normalizeHex(e.sRGBHex),s=this.hexToRgb(i),r=this.toSampledColor(s.r,s.g,s.b);this.latestColor=r,await this.persistHistory(r),await this.copyText(this.formatForCopy(r)),this.ensureHostUi(),this.setState("confirming"),await this.showCopyConfirmation(),this.enterPostPickMode()}catch(e){if(e instanceof DOMException&&e.name==="AbortError"){this.exit();return}this.exit()}}bindPickingEvents(){this.pickingEventsBound||(window.addEventListener("pointermove",this.onPointerMove,{capture:!0,passive:!0}),window.addEventListener("pointerdown",this.onPointerDown,!0),window.addEventListener("click",this.onClick,!0),window.addEventListener("contextmenu",this.onContextMenu,!0),window.addEventListener("keydown",this.onKeyDown,!0),window.addEventListener("scroll",this.onViewportMutation,{capture:!0,passive:!0}),window.addEventListener("resize",this.onViewportMutation,{passive:!0}),window.visualViewport?.addEventListener("resize",this.onViewportMutation,{passive:!0}),window.visualViewport?.addEventListener("scroll",this.onViewportMutation,{passive:!0}),this.pickingEventsBound=!0)}unbindPickingEvents(){this.pickingEventsBound&&(window.removeEventListener("pointermove",this.onPointerMove,!0),window.removeEventListener("pointerdown",this.onPointerDown,!0),window.removeEventListener("click",this.onClick,!0),window.removeEventListener("contextmenu",this.onContextMenu,!0),window.removeEventListener("keydown",this.onKeyDown,!0),window.removeEventListener("scroll",this.onViewportMutation,!0),window.removeEventListener("resize",this.onViewportMutation),window.visualViewport?.removeEventListener("resize",this.onViewportMutation),window.visualViewport?.removeEventListener("scroll",this.onViewportMutation),this.pickingEventsBound=!1)}ensureHostUi(){if(!this.styleElement){const t=document.createElement("style");t.id="colorstation-style",t.textContent=`
        html.${b},
        html.${b} * {
          cursor: crosshair !important;
        }

        #cs-root {
          --cs-accent: #0a84ff;
          --cs-glass-bg: rgba(26, 29, 34, 0.56);
          --cs-glass-border: rgba(255, 255, 255, 0.26);
          --cs-glass-shadow: 0 10px 28px rgba(8, 12, 18, 0.24);
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          pointer-events: none;
          font-family: 'SF Pro Text', 'SF Pro Display', 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        #cs-root.capture-hidden #cs-overlay,
        #cs-root.capture-hidden #cs-ready-indicator,
        #cs-root.capture-hidden #cs-copy-confirm,
        #cs-root.capture-hidden #cs-post-actions {
          visibility: hidden !important;
          opacity: 0 !important;
        }

        #cs-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        #cs-overlay #cs-reticle,
        #cs-overlay #cs-loupe {
          opacity: 1;
          transition: opacity 90ms ease;
        }

        #cs-overlay.waiting-cursor #cs-reticle,
        #cs-overlay.waiting-cursor #cs-loupe {
          opacity: 0.02;
        }

        #cs-overlay.waiting-cursor #cs-loupe-pulse {
          animation: none;
          opacity: 0;
        }

        #cs-reticle {
          position: fixed;
          width: 28px;
          height: 28px;
          margin-left: -14px;
          margin-top: -14px;
          display: none;
          pointer-events: none;
          will-change: transform;
        }

        #cs-reticle .ring {
          position: absolute;
          inset: 0;
          border: 1.5px solid var(--cs-accent);
          border-radius: 999px;
          opacity: 0.95;
          transform: scale(1);
          transition: opacity 180ms ease, transform 180ms ease;
        }

        #cs-overlay.capture-busy #cs-reticle .ring {
          animation: none;
          box-shadow: none;
        }

        @keyframes csReticleBreath {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.88;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        #cs-reticle .dot {
          display: none;
        }

        #cs-reticle .check {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: var(--cs-accent);
          font-size: 14px;
          font-weight: 700;
          opacity: 0;
          transform: scale(0.72);
          transition: opacity 180ms ease, transform 180ms ease;
        }

        #cs-reticle.locked .ring,
        #cs-reticle.locked .dot {
          opacity: 0;
          transform: scale(0.64);
        }

        #cs-reticle.locked .check {
          opacity: 1;
          transform: scale(1);
        }

        #cs-loupe {
          position: fixed;
          padding: 9px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(18, 21, 26, 0.86);
          box-shadow: 0 8px 20px rgba(7, 10, 14, 0.24);
          color: #f6fbff;
          will-change: transform;
          user-select: none;
          pointer-events: none;
          overflow: hidden;
        }

        #cs-loupe::after {
          content: '';
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 8px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.46),
            rgba(255, 255, 255, 0)
          );
          transform: scaleX(0.45);
          opacity: 0;
          pointer-events: none;
        }

        #cs-loupe.capture-flash::after {
          animation: csCaptureFlash 260ms ease-out;
        }

        @keyframes csCaptureFlash {
          0% {
            transform: scaleX(0.45);
            opacity: 0;
          }

          35% {
            transform: scaleX(0.9);
            opacity: 0.48;
          }

          100% {
            transform: scaleX(1);
            opacity: 0;
          }
        }

        #cs-loupe-pulse {
          position: absolute;
          inset: 7px;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          opacity: 0.1;
          animation: csPulse 1400ms ease-in-out infinite;
          pointer-events: none;
        }

        #cs-overlay.locked #cs-loupe-pulse {
          animation: none;
          opacity: 0.1;
        }

        @keyframes csPulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.16; }
        }

        #cs-canvas {
          display: block;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        #cs-readout {
          margin-top: 7px;
          display: grid;
          gap: 2px;
          font-size: 11px;
          line-height: 1.3;
        }

        #cs-topline {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        #cs-swatch {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.32);
          background: #000;
          transform: scale(1);
        }

        #cs-swatch.snap {
          animation: csSnap 200ms ease-out;
        }

        #cs-swatch.live-pop {
          animation: csLivePop 180ms ease-out;
        }

        @keyframes csSnap {
          0% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        @keyframes csLivePop {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(10, 132, 255, 0.26);
          }

          55% {
            transform: scale(1.08);
            box-shadow: 0 0 0 6px rgba(10, 132, 255, 0);
          }

          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(10, 132, 255, 0);
          }
        }

        #cs-hex {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        #cs-rgb,
        #cs-hsl {
          color: #ccdaea;
        }

        #cs-meta {
          color: #9fb2c8;
          font-size: 10px;
          letter-spacing: 0.02em;
          font-weight: 500;
        }

        #cs-copy-confirm {
          position: fixed;
          left: 50%;
          top: 11vh;
          min-width: 304px;
          max-width: min(86vw, 420px);
          transform: translate(-50%, -14px) scale(0.96);
          opacity: 0;
          transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
          background: linear-gradient(150deg, rgba(32, 38, 47, 0.84), rgba(18, 23, 31, 0.88));
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 20px;
          padding: 13px;
          color: #f7fbff;
          box-shadow: 0 16px 40px rgba(8, 12, 18, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(16px) saturate(136%);
          -webkit-backdrop-filter: blur(16px) saturate(136%);
          pointer-events: none;
          overflow: hidden;
        }

        #cs-copy-confirm::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 24%,
            rgba(255, 255, 255, 0.2) 46%,
            rgba(255, 255, 255, 0) 66%
          );
          transform: translateX(-135%);
          opacity: 0;
          pointer-events: none;
        }

        #cs-copy-confirm.visible {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }

        #cs-copy-confirm.visible::before {
          opacity: 0.75;
          animation: csConfirmShine 620ms ease-out forwards;
        }

        @keyframes csConfirmShine {
          0% {
            transform: translateX(-135%);
          }

          100% {
            transform: translateX(120%);
          }
        }

        #cs-copy-confirm .cs-copy-shell {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 14px;
          background: rgba(9, 14, 21, 0.34);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 12px;
        }

        #cs-copy-confirm .cs-copy-icon {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 17px;
          line-height: 1;
          color: #f3fbff;
          border: 1px solid rgba(255, 255, 255, 0.34);
          background: radial-gradient(circle at 30% 28%, rgba(74, 196, 255, 0.95), rgba(10, 132, 255, 0.9) 52%, rgba(7, 89, 182, 0.95));
          box-shadow: 0 7px 18px rgba(7, 85, 165, 0.38);
          transform: scale(0.82);
          opacity: 0.86;
        }

        #cs-copy-confirm.visible .cs-copy-icon {
          animation: csConfirmPop 360ms cubic-bezier(0.2, 1.1, 0.32, 1) both;
        }

        @keyframes csConfirmPop {
          0% {
            transform: scale(0.82);
            opacity: 0.7;
          }

          62% {
            transform: scale(1.08);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        #cs-copy-confirm .cs-copy-text {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        #cs-copy-confirm .cs-copy-title {
          font-size: 15px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #f6fbff;
        }

        #cs-copy-confirm .cs-copy-subtitle {
          font-size: 12px;
          line-height: 1.28;
          color: #b9cee6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        #cs-ready-indicator {
          position: fixed;
          top: 14px;
          right: 14px;
          transform: translateY(-6px) scale(0.98);
          opacity: 0;
          transition: opacity 160ms ease, transform 160ms ease;
          border-radius: 999px;
          border: 1px solid var(--cs-glass-border);
          background: var(--cs-glass-bg);
          color: #eaf2fc;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 630;
          letter-spacing: 0.02em;
          box-shadow: var(--cs-glass-shadow);
          backdrop-filter: blur(12px) saturate(124%);
          -webkit-backdrop-filter: blur(12px) saturate(124%);
          pointer-events: none;
        }

        #cs-ready-indicator.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        #cs-post-actions {
          position: fixed;
          top: 14px;
          right: 14px;
          display: grid;
          gap: 8px;
          width: max-content;
          pointer-events: auto;
        }

        #cs-post-actions .cs-actions-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px;
          border-radius: 16px;
          border: 1px solid var(--cs-glass-border);
          background: var(--cs-glass-bg);
          box-shadow: var(--cs-glass-shadow);
          backdrop-filter: blur(12px) saturate(125%);
          -webkit-backdrop-filter: blur(12px) saturate(125%);
        }

        #cs-post-actions button {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(244, 247, 252, 0.12);
          color: #eef5ff;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(8, 12, 18, 0.12);
          opacity: 0.95;
          transition: transform 170ms ease, background-color 170ms ease, border-color 170ms ease;
        }

        #cs-post-actions button:not(.pick-again):hover {
          background: rgba(244, 247, 252, 0.2);
          border-color: rgba(255, 255, 255, 0.34);
          transform: translateY(-1px);
        }

        #cs-post-actions button:not(.pick-again):active {
          transform: translateY(0) scale(0.98);
        }

        #cs-post-actions .pick-again {
          padding: 9px 17px;
          font-size: 13px;
          font-weight: 640;
          border-color: rgba(10, 132, 255, 0.85);
          background: rgba(10, 132, 255, 0.9);
          color: #f5fbff;
          opacity: 1;
          box-shadow: 0 8px 18px rgba(10, 72, 138, 0.26);
        }

        #cs-post-actions .pick-again:hover {
          background: rgba(33, 145, 255, 0.96);
          transform: translateY(-1px);
        }

        #cs-post-actions .pick-again:active {
          transform: translateY(0) scale(0.98);
        }

        #cs-post-actions .history {
          border-color: rgba(255, 255, 255, 0.28);
        }

        #cs-history-popover {
          position: absolute;
          top: calc(100% + 2px);
          right: 0;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid var(--cs-glass-border);
          background: var(--cs-glass-bg);
          box-shadow: var(--cs-glass-shadow);
          backdrop-filter: blur(12px) saturate(125%);
          -webkit-backdrop-filter: blur(12px) saturate(125%);
          padding: 8px;
          opacity: 0;
          transform: translateY(-6px) scale(0.98);
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
        }

        #cs-post-actions.history-open #cs-history-popover {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        #cs-history-title {
          margin: 2px 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #d6e5f7;
        }

        #cs-history-list {
          display: grid;
          gap: 6px;
        }

        .cs-history-empty {
          font-size: 11px;
          color: #b9cce2;
          padding: 6px;
        }

        .cs-history-item {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(241, 246, 252, 0.08);
          color: #edf6ff;
          border-radius: 10px;
          padding: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease;
        }

        .cs-history-item:hover {
          border-color: rgba(10, 132, 255, 0.48);
          background: rgba(241, 246, 252, 0.16);
        }

        .cs-history-item:active {
          transform: scale(0.99);
        }

        .cs-history-item.copied {
          border-color: rgba(10, 132, 255, 0.72);
        }

        .cs-history-swatch {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          flex-shrink: 0;
        }

        .cs-history-text {
          min-width: 0;
          display: grid;
          gap: 1px;
          text-align: left;
        }

        .cs-history-hex {
          font-size: 11px;
          font-weight: 700;
          color: #f5fbff;
        }

        .cs-history-meta {
          font-size: 10px;
          color: #afc3da;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cs-history-item.copied .cs-history-meta {
          color: #dcecff;
        }

        @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
          #cs-loupe,
          #cs-copy-confirm,
          #cs-ready-indicator,
          #cs-post-actions .cs-actions-bar,
          #cs-history-popover {
            background: rgba(18, 24, 28, 0.92);
          }
        }
      `,document.documentElement.appendChild(t),this.styleElement=t}if(!this.rootElement){const t=document.createElement("div");t.id="cs-root",t.dataset.state=this.state,document.documentElement.appendChild(t),this.rootElement=t}}mountOverlay(){if(!this.rootElement||this.overlayElement)return;const t=document.createElement("div");t.id="cs-overlay";const e=document.createElement("div");e.id="cs-reticle";const i=document.createElement("div");i.className="ring";const s=document.createElement("div");s.className="dot";const r=document.createElement("div");r.className="check",r.textContent="✓",e.append(i,s,r);const o=document.createElement("div");o.id="cs-loupe";const n=document.createElement("div");n.id="cs-loupe-pulse";const l=document.createElement("canvas");l.id="cs-canvas";const a=document.createElement("div");a.id="cs-readout";const c=document.createElement("div");c.id="cs-topline";const h=document.createElement("div");h.id="cs-swatch";const u=document.createElement("div");u.id="cs-hex",c.append(h,u);const p=document.createElement("div");p.id="cs-rgb";const d=document.createElement("div");d.id="cs-hsl";const m=document.createElement("div");m.id="cs-meta",a.append(c,p,d,m),o.append(n,l,a),t.append(e,o),this.rootElement.appendChild(t),this.overlayElement=t,this.reticleElement=e,this.loupeElement=o,this.loupeCanvas=l,this.loupeContext=l.getContext("2d",{willReadFrequently:!0}),this.swatchElement=h,this.hexElement=u,this.rgbElement=p,this.hslElement=d,this.metaElement=m,this.ensureCanvasSize()}unmountOverlay(){this.loupePulseTimer!==null&&(window.clearTimeout(this.loupePulseTimer),this.loupePulseTimer=null),this.swatchPulseTimer!==null&&(window.clearTimeout(this.swatchPulseTimer),this.swatchPulseTimer=null),this.overlayElement?.remove(),this.overlayElement=null,this.reticleElement=null,this.loupeElement=null,this.loupeCanvas=null,this.loupeContext=null,this.swatchElement=null,this.hexElement=null,this.rgbElement=null,this.hslElement=null,this.metaElement=null,this.loupePositionReady=!1,this.waitingForCursor=!1,this.hasCursorSeed=!1,this.previousReadoutColor=null,this.lastSwatchPulseAt=0}setIndicatorVisibility(t){this.overlayElement&&this.overlayElement.classList.toggle("waiting-cursor",!t)}setCaptureBusy(t){this.overlayElement&&this.overlayElement.classList.toggle("capture-busy",t)}flashLoupePulse(){!this.loupeElement||this.state!=="picking"||(this.loupeElement.classList.remove("capture-flash"),this.loupeElement.offsetWidth,this.loupeElement.classList.add("capture-flash"),this.loupePulseTimer!==null&&window.clearTimeout(this.loupePulseTimer),this.loupePulseTimer=window.setTimeout(()=>{this.loupeElement?.classList.remove("capture-flash"),this.loupePulseTimer=null},280))}pulseSwatchOnColorShift(t){const e=this.previousReadoutColor;if(this.previousReadoutColor=t,!this.swatchElement||!e||this.colorShiftMagnitude(e,t)<32)return;const s=performance.now();s-this.lastSwatchPulseAt<170||(this.lastSwatchPulseAt=s,this.swatchElement.classList.remove("live-pop"),this.swatchElement.offsetWidth,this.swatchElement.classList.add("live-pop"),this.swatchPulseTimer!==null&&window.clearTimeout(this.swatchPulseTimer),this.swatchPulseTimer=window.setTimeout(()=>{this.swatchElement?.classList.remove("live-pop"),this.swatchPulseTimer=null},210))}colorShiftMagnitude(t,e){return Math.abs(t.r-e.r)+Math.abs(t.g-e.g)+Math.abs(t.b-e.b)}mountPostActions(){if(!this.rootElement||this.postActionsElement)return;const t=document.createElement("div");t.id="cs-post-actions";const e=document.createElement("div");e.className="cs-actions-bar";const i=document.createElement("button");i.type="button",i.className="pick-again",i.textContent="Pick again",i.addEventListener("click",()=>{this.startCapturePicker()});const s=document.createElement("button");s.type="button",s.className="history",s.textContent="History",s.addEventListener("click",a=>{a.stopPropagation(),this.setHistoryPopoverOpen(!this.historyPopoverOpen)});const r=document.createElement("button");r.type="button",r.textContent="Exit",r.addEventListener("click",()=>{this.exit()}),e.append(i,s,r);const o=document.createElement("div");o.id="cs-history-popover";const n=document.createElement("div");n.id="cs-history-title",n.textContent="History";const l=document.createElement("div");l.id="cs-history-list",o.append(n,l),t.append(e,o),this.rootElement.appendChild(t),this.postActionsElement=t,this.historyButtonElement=s,this.historyPopoverElement=o,this.historyListElement=l,this.renderHistoryPopover(),this.bindPostKeyListener(),requestAnimationFrame(()=>{i.focus()})}unmountPostActions(){this.setHistoryPopoverOpen(!1),this.unbindPostKeyListener(),this.postActionsElement?.remove(),this.postActionsElement=null,this.historyButtonElement=null,this.historyPopoverElement=null,this.historyListElement=null}bindPostKeyListener(){this.postKeyBound||(window.addEventListener("keydown",this.onPostKeyDown,!0),this.postKeyBound=!0)}unbindPostKeyListener(){this.postKeyBound&&(window.removeEventListener("keydown",this.onPostKeyDown,!0),this.postKeyBound=!1)}setHistoryPopoverOpen(t){if(this.historyPopoverOpen=t,!!this.postActionsElement){if(this.postActionsElement.classList.toggle("history-open",t),t){this.renderHistoryPopover(),this.bindHistoryOutsideListener();return}this.unbindHistoryOutsideListener()}}bindHistoryOutsideListener(){this.historyOutsideBound||(document.addEventListener("pointerdown",this.onDocumentPointerDown,!0),this.historyOutsideBound=!0)}unbindHistoryOutsideListener(){this.historyOutsideBound&&(document.removeEventListener("pointerdown",this.onDocumentPointerDown,!0),this.historyOutsideBound=!1)}renderHistoryPopover(){if(!this.historyListElement)return;this.historyListElement.replaceChildren();const t=[...this.history].sort((e,i)=>e.pinned!==i.pinned?e.pinned?-1:1:i.createdAt-e.createdAt);if(t.length===0){const e=document.createElement("div");e.className="cs-history-empty",e.textContent="No colors yet",this.historyListElement.appendChild(e);return}for(const e of t.slice(0,Z)){const i=document.createElement("button");i.type="button",i.className="cs-history-item";const s=document.createElement("span");s.className="cs-history-swatch",s.style.backgroundColor=e.hex;const r=document.createElement("span");r.className="cs-history-text";const o=document.createElement("span");o.className="cs-history-hex",o.textContent=e.hex;const n=document.createElement("span");n.className="cs-history-meta",n.textContent=`${e.rgb} · ${e.hsl}`,r.append(o,n),i.append(s,r),i.addEventListener("click",async l=>{if(l.stopPropagation(),!await this.copyText(this.formatForCopy(e)))return;i.classList.add("copied");const c=n.textContent;n.textContent="Copied",window.setTimeout(()=>{i.classList.remove("copied"),n.textContent=c},760)}),this.historyListElement.appendChild(i)}}async showCopyConfirmation(){if(!this.rootElement)return;this.clearCopyConfirmation();const t=document.createElement("div");t.id="cs-copy-confirm";const e=document.createElement("div");e.className="cs-copy-shell";const i=document.createElement("div");i.className="cs-copy-icon",i.setAttribute("aria-hidden","true"),i.textContent="✓";const s=document.createElement("div");s.className="cs-copy-text";const r=document.createElement("div");r.className="cs-copy-title",r.textContent="Copied to clipboard";const o=document.createElement("div");o.className="cs-copy-subtitle",this.latestColor?o.textContent=`${this.formatForCopy(this.latestColor)} ready to paste`:o.textContent="Color value ready to paste",s.append(r,o),e.append(i,s),t.append(e),this.rootElement.appendChild(t),this.confirmElement=t,requestAnimationFrame(()=>{this.confirmElement?.classList.add("visible")}),await new Promise(n=>{this.confirmFadeTimer=window.setTimeout(()=>{this.confirmElement?.classList.remove("visible"),this.confirmFadeTimer=null},920),this.confirmEndTimer=window.setTimeout(()=>{this.confirmEndTimer=null,this.clearCopyConfirmation(),n()},1140)})}clearCopyConfirmation(){this.confirmFadeTimer!==null&&(window.clearTimeout(this.confirmFadeTimer),this.confirmFadeTimer=null),this.confirmEndTimer!==null&&(window.clearTimeout(this.confirmEndTimer),this.confirmEndTimer=null),this.confirmElement?.remove(),this.confirmElement=null}showReadyIndicator(){if(this.rootElement){if(!this.readyIndicatorElement){const t=document.createElement("div");t.id="cs-ready-indicator",t.textContent="Click to pick color · Right-click to exit",this.rootElement.appendChild(t),this.readyIndicatorElement=t}requestAnimationFrame(()=>{this.readyIndicatorElement?.classList.add("visible")})}}hideReadyIndicator(){if(!this.readyIndicatorElement)return;const t=this.readyIndicatorElement;t.classList.remove("visible"),window.setTimeout(()=>{this.readyIndicatorElement!==t||t.classList.contains("visible")||(t.remove(),this.readyIndicatorElement=null)},180)}async captureViewport(t=!1){const e=t?await this.captureVisiblePageDataUrlWithoutPickerUi():await this.requestCapturedDataUrl(),i=await this.decodeDataUrl(e),s=this.capture,r=s?.canvas??document.createElement("canvas"),o=s?.context??r.getContext("2d",{willReadFrequently:!0});if(!o)throw i.close(),new Error("Unable to create capture context.");(r.width!==i.width||r.height!==i.height)&&(r.width=i.width,r.height=i.height),o.clearRect(0,0,r.width,r.height),o.drawImage(i,0,0),i.close(),this.capture={canvas:r,context:o,width:r.width,height:r.height,scaleX:r.width/Math.max(window.innerWidth,1),scaleY:r.height/Math.max(window.innerHeight,1)},this.captureVersion+=1}async captureVisiblePageDataUrlWithoutPickerUi(){if(!this.rootElement||this.state!=="picking")return this.requestCapturedDataUrl();this.setPickerUiVisibleForCapture(!1),await this.waitForNextFrame();try{return await this.requestCapturedDataUrl()}finally{this.setPickerUiVisibleForCapture(!0)}}async requestCapturedDataUrl(){const t=await chrome.runtime.sendMessage({type:"CAPTURE_VISIBLE_TAB"});if(!t?.ok||typeof t.dataUrl!="string")throw new Error(t?.error||"Viewport capture failed.");return t.dataUrl}setPickerUiVisibleForCapture(t){this.rootElement?.classList.toggle("capture-hidden",!t)}async waitForNextFrame(){await new Promise(t=>{window.requestAnimationFrame(()=>t())})}releaseCapture(){this.capture&&(this.capture.canvas.width=0,this.capture.canvas.height=0,this.capture=null)}async decodeDataUrl(t){const i=await(await fetch(t)).blob();return createImageBitmap(i)}queueRecapture(){this.recaptureTimer!==null&&window.clearTimeout(this.recaptureTimer),this.recaptureTimer=window.setTimeout(()=>{this.recaptureTimer=null,this.captureViewportGuarded("mutation")},180)}armLiveRecapture(t=!1){if(this.state!=="picking")return;if(this.liveRecaptureTimer!==null&&(window.clearTimeout(this.liveRecaptureTimer),this.liveRecaptureTimer=null),!t&&!this.hoverDynamicSurface&&!this.hoverInteractiveSurface&&!this.waitingForCursor){this.liveRecaptureTimer=null;return}const e=t?0:this.getLiveRecaptureDelay(),i=this.getCaptureThrottleDelay(t),s=Math.max(e,i);this.scheduleLiveRecapture(s)}getLiveRecaptureDelay(){return document.hidden?900:this.waitingForCursor?260:this.hoverDynamicSurface?this.liveFastIntervalMs:this.hoverInteractiveSurface?this.liveHoverIntervalMs:this.liveSlowIntervalMs}scheduleLiveRecapture(t){this.state==="picking"&&(this.liveRecaptureTimer!==null&&window.clearTimeout(this.liveRecaptureTimer),this.liveRecaptureTimer=window.setTimeout(()=>{this.liveRecaptureTimer=null,this.captureViewportGuarded("live")},Math.max(0,t)))}getCaptureThrottleDelay(t){if(this.lastCaptureTimestamp<=0)return 0;const e=Math.max(0,performance.now()-this.lastCaptureTimestamp),i=this.getMinCaptureGapMs();return t&&e>=i?0:Math.max(0,i-e)}getMinCaptureGapMs(){return this.waitingForCursor?280:this.hoverDynamicSurface?this.minDynamicCaptureGapMs:this.hoverInteractiveSurface?this.minInteractiveCaptureGapMs:this.minIdleCaptureGapMs}getCaptureRetryDelayMs(){return Math.min(1900,520+(this.captureFailureStreak-1)*260)}async captureViewportGuarded(t){if(this.state==="picking"){if(this.captureInFlight){this.captureQueued=!0;return}this.captureInFlight=!0,this.setCaptureBusy(!0);try{await this.captureViewport(),this.lastCaptureTimestamp=performance.now(),this.captureFailureStreak=0,this.hasCursorSeed&&this.scheduleFrame()}catch{this.state==="picking"&&(this.captureFailureStreak+=1,this.scheduleLiveRecapture(this.getCaptureRetryDelayMs()));return}finally{this.captureInFlight=!1,this.setCaptureBusy(!1)}if(this.state==="picking"){if(this.captureQueued){this.captureQueued=!1,this.captureViewportGuarded("queued");return}t!=="initial"&&this.armLiveRecapture()}}}updateMotionHint(t){if(this.waitingForCursor)return;const e=performance.now();if(e-this.motionProbeStamp<this.motionProbeIntervalMs)return;this.motionProbeStamp=e;const i=this.isDynamicMotionTarget(t.target),s=this.getHoverTargetFingerprint(t.target),r=s.length>0,o=i!==this.hoverDynamicSurface,n=r!==this.hoverInteractiveSurface,l=s!==this.hoverTargetFingerprint;if(!o&&!n&&!l)return;this.hoverDynamicSurface=i,this.hoverInteractiveSurface=r,this.hoverTargetFingerprint=s,this.latestColor&&this.updateReadout(this.latestColor);const a=o&&i||n||l&&r;this.armLiveRecapture(a)}isDynamicMotionTarget(t){if(t instanceof HTMLVideoElement||t instanceof HTMLCanvasElement)return!0;if(t instanceof HTMLImageElement)return this.isLikelyAnimatedImage(t);if(!(t instanceof Element))return!1;const e=t.closest("video, canvas, img");return e instanceof HTMLVideoElement||e instanceof HTMLCanvasElement?!0:e instanceof HTMLImageElement?this.isLikelyAnimatedImage(e):!1}isLikelyAnimatedImage(t){const e=t.currentSrc||t.src||"";return/\.(gif|webp|apng)(?:$|[?#])/i.test(e)}getHoverTargetFingerprint(t){const e=this.findHoverSensitiveElement(t);if(!e)return"";const i=e.getBoundingClientRect(),s=e.classList.length?`.${Array.from(e.classList).slice(0,2).join(".")}`:"",r=e.id?`#${e.id}`:"";return`${e.tagName}${r}${s}:${Math.round(i.left)}:${Math.round(i.top)}:${Math.round(i.width)}:${Math.round(i.height)}`}findHoverSensitiveElement(t){if(!(t instanceof Element))return null;if(this.isHoverSensitiveElement(t))return t;let e=t.parentElement,i=0;for(;e&&i<5;){if(this.isHoverSensitiveElement(e))return e;e=e.parentElement,i+=1}return null}isHoverSensitiveElement(t){if(t.matches(Q))return!0;const e=window.getComputedStyle(t);if(e.cursor==="pointer"||e.cursor==="zoom-in"||e.cursor==="zoom-out")return!0;const i=this.hasNonZeroDuration(e.transitionDuration);if(e.animationName!=="none"&&this.hasNonZeroDuration(e.animationDuration))return!0;if(i){const r=e.transitionProperty||"";if(r==="all"||/color|background|border|shadow|filter|opacity|transform/i.test(r))return!0}return!1}hasNonZeroDuration(t){const e=t.split(",");for(const i of e)if(this.parseCssTime(i.trim())>0)return!0;return!1}parseCssTime(t){const e=i=>Number.isFinite(i)?Math.max(i,0):0;return t.endsWith("ms")?e(Number.parseFloat(t.slice(0,-2))):t.endsWith("s")?e(Number.parseFloat(t.slice(0,-1))*1e3):e(Number.parseFloat(t))}updateReticlePosition(){this.reticleElement&&(this.reticleElement.style.transform=`translate3d(${Math.round(this.pointerX)}px, ${Math.round(this.pointerY)}px, 0)`)}updateLoupeTarget(){const t=this.getCanvasSize(),e=t+18,i=t+74;let s=this.pointerX+24,r=this.pointerY+24;s+e>window.innerWidth-10&&(s=this.pointerX-e-24),r+i>window.innerHeight-10&&(r=this.pointerY-i-24),s=this.clamp(s,10,Math.max(window.innerWidth-e-10,10)),r=this.clamp(r,10,Math.max(window.innerHeight-i-10,10)),this.targetLoupeX=s,this.targetLoupeY=r}applyLoupePosition(t){if(!this.loupeElement)return!1;!this.loupePositionReady||t?(this.loupeX=this.targetLoupeX,this.loupeY=this.targetLoupeY,this.loupePositionReady=!0):(this.loupeX+=(this.targetLoupeX-this.loupeX)*.56,this.loupeY+=(this.targetLoupeY-this.loupeY)*.56),this.loupeElement.style.transform=`translate3d(${Math.round(this.loupeX)}px, ${Math.round(this.loupeY)}px, 0)`;const e=Math.abs(this.targetLoupeX-this.loupeX),i=Math.abs(this.targetLoupeY-this.loupeY);return e>.45||i>.45}scheduleFrame(){this.state!=="picking"||this.rafId!==null||(this.rafId=window.requestAnimationFrame(()=>{this.rafId=null,this.renderFrame()}))}renderFrame(){if(this.state!=="picking")return;if(this.capture){const e=this.clamp(Math.round(this.pointerX*this.capture.scaleX),0,this.capture.width-1),i=this.clamp(Math.round(this.pointerY*this.capture.scaleY),0,this.capture.height-1);if(e!==this.lastRenderedMappedX||i!==this.lastRenderedMappedY||this.captureVersion!==this.lastRenderedCaptureVersion){const r=this.sampleColor(e,i,this.currentSampling());this.latestColor=r,this.drawLoupe(e,i),this.updateReadout(r),this.lastRenderedMappedX=e,this.lastRenderedMappedY=i,this.lastRenderedCaptureVersion=this.captureVersion}}this.applyLoupePosition(!1)&&this.scheduleFrame()}sampleColor(t,e,i){if(!this.capture)return this.toSampledColor(0,0,0);const s=Math.floor(i/2),r=this.clamp(t-s,0,this.capture.width-1),o=this.clamp(e-s,0,this.capture.height-1),n=this.clamp(t+s,0,this.capture.width-1),l=this.clamp(e+s,0,this.capture.height-1),a=n-r+1,c=l-o+1,h=this.capture.context.getImageData(r,o,a,c).data,u=t-r,p=e-o,d=(p*a+u)*4,m=h[d],x=h[d+1],E=h[d+2];if(i===1)return this.toSampledColor(m,x,E);const C=Math.max(i/2.35,.85),Y=2*C*C,T=58,B=2*T*T;let k=0,P=0,S=0,f=0;for(let g=0;g<c;g+=1)for(let y=0;y<a;y+=1){const w=(g*a+y)*4,L=h[w+3]/255;if(L<=0)continue;const M=h[w],I=h[w+1],R=h[w+2],F=y-u,D=g-p,U=F*F+D*D,_=Math.exp(-U/Y),z=M-m,H=I-x,A=R-E,G=z*z+H*H+A*A,q=Math.exp(-G/B),v=_*Math.max(.2,q)*L;k+=this.srgbChannelToLinear(M)*v,P+=this.srgbChannelToLinear(I)*v,S+=this.srgbChannelToLinear(R)*v,f+=v}if(f<=1e-4)return this.toSampledColor(m,x,E);const O=this.linearChannelToSrgb(k/f),X=this.linearChannelToSrgb(P/f),$=this.linearChannelToSrgb(S/f);return this.toSampledColor(O,X,$)}srgbChannelToLinear(t){const e=this.clamp(t,0,255)/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}linearChannelToSrgb(t){const e=this.clamp(t,0,1),i=e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;return this.clamp(Math.round(i*255),0,255)}drawLoupe(t,e){if(!this.capture||!this.loupeCanvas||!this.loupeContext)return;this.ensureCanvasSize();const i=this.loupeContext,s=this.currentZoom(),r=this.loupePixels,o=Math.floor(r/2);let n=t-o,l=e-o;n=this.clamp(n,0,Math.max(this.capture.width-r,0)),l=this.clamp(l,0,Math.max(this.capture.height-r,0));const a=this.getCanvasSize();if(i.clearRect(0,0,a,a),i.imageSmoothingEnabled=!1,i.drawImage(this.capture.canvas,n,l,r,r,0,0,a,a),this.gridEnabled){i.strokeStyle="rgba(255, 255, 255, 0.26)",i.lineWidth=1;for(let u=0;u<=r;u+=1){const p=u*s+.5;i.beginPath(),i.moveTo(p,0),i.lineTo(p,a),i.stroke(),i.beginPath(),i.moveTo(0,p),i.lineTo(a,p),i.stroke()}}const c=(t-n)*s,h=(e-l)*s;i.strokeStyle="rgba(255, 255, 255, 0.94)",i.lineWidth=2,i.strokeRect(c+1,h+1,Math.max(s-2,1),Math.max(s-2,1)),i.strokeStyle="rgba(10, 12, 16, 0.82)",i.lineWidth=1,i.strokeRect(c+2,h+2,Math.max(s-4,1),Math.max(s-4,1))}updateReadout(t){!this.swatchElement||!this.hexElement||!this.rgbElement||!this.hslElement||(this.swatchElement.style.backgroundColor=t.hex,this.pulseSwatchOnColorShift(t),this.hexElement.textContent=t.hex,this.rgbElement.textContent=t.rgb,this.hslElement.textContent=t.hsl,this.metaElement&&(this.metaElement.textContent="Click to copy this color"))}cycleSamplingMode(){this.samplingIndex=(this.samplingIndex+1)%this.samplingModes.length,this.invalidateRenderedFrame(),this.latestColor&&this.updateReadout(this.latestColor),this.scheduleFrame()}adjustZoom(t){const e=this.clamp(this.zoomIndex+t,0,this.zoomSteps.length-1);e!==this.zoomIndex&&(this.zoomIndex=e,this.ensureCanvasSize(),this.updateLoupeTarget(),this.invalidateRenderedFrame(),this.latestColor&&this.updateReadout(this.latestColor),this.scheduleFrame())}invalidateRenderedFrame(){this.lastRenderedMappedX=-1,this.lastRenderedMappedY=-1,this.lastRenderedCaptureVersion=-1}async confirmPick(){if(this.state!=="picking")return;if(this.captureQueued=!1,this.liveRecaptureTimer!==null&&(window.clearTimeout(this.liveRecaptureTimer),this.liveRecaptureTimer=null),this.rafId!==null&&(window.cancelAnimationFrame(this.rafId),this.rafId=null),this.recaptureTimer!==null&&(window.clearTimeout(this.recaptureTimer),this.recaptureTimer=null),this.unbindPickingEvents(),this.restoreCursor(),this.hideReadyIndicator(),await this.waitForCaptureIdle(),await this.refreshCaptureBeforeLock(),this.capture){const i=this.clamp(Math.round(this.pointerX*this.capture.scaleX),0,this.capture.width-1),s=this.clamp(Math.round(this.pointerY*this.capture.scaleY),0,this.capture.height-1);this.latestColor=this.sampleColor(i,s,this.currentSampling()),this.drawLoupe(i,s),this.updateReadout(this.latestColor)}if(!this.latestColor){this.exit();return}this.setState("confirming"),this.reticleElement?.classList.add("locked"),this.overlayElement?.classList.add("locked"),this.swatchElement&&(this.swatchElement.classList.remove("snap"),this.swatchElement.offsetWidth,this.swatchElement.classList.add("snap"));const t=this.formatForCopy(this.latestColor),e=this.persistHistory(this.latestColor);await this.copyText(t),this.showCopyConfirmation(),await e,await new Promise(i=>{this.freezeTimer=window.setTimeout(()=>{this.freezeTimer=null,i()},120)}),this.releaseCapture(),this.unmountOverlay(),this.enterPostPickMode()}async waitForCaptureIdle(t=600){if(!this.captureInFlight)return;const e=performance.now();for(;this.captureInFlight&&performance.now()-e<t;)await new Promise(i=>{window.setTimeout(()=>i(),16)})}async refreshCaptureBeforeLock(){if(!(this.state!=="picking"||this.captureInFlight)){this.captureInFlight=!0,this.setCaptureBusy(!0);try{await this.captureViewport(!0),this.lastCaptureTimestamp=performance.now(),this.captureFailureStreak=0,this.flashLoupePulse()}catch{}finally{this.captureInFlight=!1,this.setCaptureBusy(!1)}}}enterPostPickMode(){this.setState("post"),this.mountPostActions()}async persistHistory(t){const e=await chrome.runtime.sendMessage({type:"ADD_HISTORY_COLOR",payload:{hex:t.hex,rgb:t.rgb,hsl:t.hsl}});!e?.ok||!Array.isArray(e.history)||(this.history=e.history)}async copyText(t){try{return await navigator.clipboard.writeText(t),!0}catch{const e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.left="-9999px",document.body.appendChild(e),e.focus(),e.select();const i=document.execCommand("copy");return e.remove(),i}}ensureCanvasSize(){if(!this.loupeCanvas)return;const t=this.getCanvasSize();this.loupeCanvas.width===t&&this.loupeCanvas.height===t||(this.loupeCanvas.width=t,this.loupeCanvas.height=t,this.loupeCanvas.style.width=`${t}px`,this.loupeCanvas.style.height=`${t}px`,this.updateLoupeTarget(),this.applyLoupePosition(!0))}getCanvasSize(){return this.loupePixels*this.currentZoom()}currentSampling(){return this.samplingModes[this.samplingIndex]??1}currentZoom(){return this.zoomSteps[this.zoomIndex]??10}getClosestZoomIndex(t){let e=0,i=Number.POSITIVE_INFINITY;for(let s=0;s<this.zoomSteps.length;s+=1){const r=Math.abs(this.zoomSteps[s]-t);r<i&&(i=r,e=s)}return e}formatForCopy(t){return this.settings.defaultFormat==="rgb"?t.rgb:this.settings.defaultFormat==="hsl"?t.hsl:t.hex}hideCursor(){this.previousCursor=document.documentElement.style.cursor,document.documentElement.classList.add(b),document.documentElement.style.cursor="crosshair"}restoreCursor(){document.documentElement.classList.remove(b),document.documentElement.style.cursor=this.previousCursor}getEyeDropperCtor(){return window.EyeDropper}toSampledColor(t,e,i){const s=this.rgbToHex(t,e,i),r=`rgb(${t}, ${e}, ${i})`,o=this.rgbToHsl(t,e,i),n=`hsl(${o.h} ${o.s}% ${o.l}%)`;return{r:t,g:e,b:i,hex:s,rgb:r,hsl:n}}rgbToHex(t,e,i){return`#${this.toHex(t)}${this.toHex(e)}${this.toHex(i)}`}toHex(t){return this.clamp(Math.round(t),0,255).toString(16).padStart(2,"0").toUpperCase()}rgbToHsl(t,e,i){const s=t/255,r=e/255,o=i/255,n=Math.max(s,r,o),l=Math.min(s,r,o),a=n-l;let c=0;a!==0&&(n===s?c=(r-o)/a%6:n===r?c=(o-s)/a+2:c=(s-r)/a+4),c=Math.round(c*60),c<0&&(c+=360);const h=(n+l)/2,u=a===0?0:a/(1-Math.abs(2*h-1));return{h:c,s:Math.round(u*100),l:Math.round(h*100)}}normalizeHex(t){const e=t.trim().toUpperCase();if(/^#[0-9A-F]{6}$/.test(e))return e;if(/^#[0-9A-F]{3}$/.test(e))return`#${e.slice(1).split("").map(s=>`${s}${s}`).join("")}`;throw new Error("Invalid hex value from EyeDropper.")}hexToRgb(t){const e=this.normalizeHex(t).slice(1);return{r:Number.parseInt(e.slice(0,2),16),g:Number.parseInt(e.slice(2,4),16),b:Number.parseInt(e.slice(4,6),16)}}clamp(t,e,i){return Math.min(i,Math.max(e,t))}stopSession(t){this.recaptureTimer!==null&&(window.clearTimeout(this.recaptureTimer),this.recaptureTimer=null),this.liveRecaptureTimer!==null&&(window.clearTimeout(this.liveRecaptureTimer),this.liveRecaptureTimer=null),this.freezeTimer!==null&&(window.clearTimeout(this.freezeTimer),this.freezeTimer=null),this.loupePulseTimer!==null&&(window.clearTimeout(this.loupePulseTimer),this.loupePulseTimer=null),this.swatchPulseTimer!==null&&(window.clearTimeout(this.swatchPulseTimer),this.swatchPulseTimer=null),this.rafId!==null&&(window.cancelAnimationFrame(this.rafId),this.rafId=null),this.clearCopyConfirmation(),this.hideReadyIndicator(),this.unbindPickingEvents(),this.restoreCursor(),this.setPickerUiVisibleForCapture(!0),this.overlayElement?.classList.remove("capture-busy"),this.loupeElement?.classList.remove("capture-flash"),this.swatchElement?.classList.remove("live-pop"),this.captureInFlight=!1,this.captureQueued=!1,this.hoverDynamicSurface=!1,this.hoverInteractiveSurface=!1,this.hoverTargetFingerprint="",this.motionProbeStamp=0,this.lastCaptureTimestamp=0,this.captureVersion=0,this.lastRenderedCaptureVersion=-1,this.lastRenderedMappedX=-1,this.lastRenderedMappedY=-1,this.previousReadoutColor=null,this.lastSwatchPulseAt=0,this.releaseCapture(),this.unmountOverlay(),this.unmountPostActions(),this.setState("idle"),t&&(this.rootElement?.remove(),this.rootElement=null,this.readyIndicatorElement=null,this.styleElement?.remove(),this.styleElement=null)}exit(){this.stopSession(!0)}}const N=window;N.__colorStationController||(N.__colorStationController=new j);
