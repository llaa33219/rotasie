(function() {
  'use strict';
  
  // URL 감지를 위한 현재 URL 저장
  let currentUrl = window.location.href;
  let isProjectPage = false;
  let transformController = null;
  
  // CSS Transform 및 Filter 속성 설정 정보
  const STYLE_PROPERTIES = {
    // Transform 속성들
    'transX': { unit: 'px', default: 0, cssName: 'translateX', type: 'transform' },
    'transY': { unit: 'px', default: 0, cssName: 'translateY', type: 'transform' },
    'scaleX': { unit: '', default: 1, cssName: 'scaleX', type: 'transform' },
    'scaleY': { unit: '', default: 1, cssName: 'scaleY', type: 'transform' },
    'rotate': { unit: 'deg', default: 0, cssName: 'rotate', type: 'transform' },
    'rotateX': { unit: 'deg', default: 0, cssName: 'rotateX', type: 'transform' },
    'rotateY': { unit: 'deg', default: 0, cssName: 'rotateY', type: 'transform' },
    'rotateZ': { unit: 'deg', default: 0, cssName: 'rotateZ', type: 'transform' },
    'skewX': { unit: 'deg', default: 0, cssName: 'skewX', type: 'transform' },
    'skewY': { unit: 'deg', default: 0, cssName: 'skewY', type: 'transform' },
    
    // Filter 속성들
    'blur': { unit: 'px', default: 0, cssName: 'blur', type: 'filter' },
    'bright': { unit: '', default: 1, cssName: 'brightness', type: 'filter' },
    'contrast': { unit: '', default: 1, cssName: 'contrast', type: 'filter' },
    'gray': { unit: '', default: 0, cssName: 'grayscale', type: 'filter' },
    'hue': { unit: 'deg', default: 0, cssName: 'hue-rotate', type: 'filter' },
    'invert': { unit: '', default: 0, cssName: 'invert', type: 'filter' },
    'opacity': { unit: '', default: 1, cssName: 'opacity', type: 'filter' },
    'saturate': { unit: '', default: 1, cssName: 'saturate', type: 'filter' },
    'sepia': { unit: '', default: 0, cssName: 'sepia', type: 'filter' }
  };
  
  // URL 변경 감지 함수
  function detectUrlChange() {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;
      checkIfEntryPage();
    }
  }
  
  // Entry 페이지 (프로젝트 또는 워크스페이스)인지 확인
  function checkIfEntryPage() {
    const isNowProjectPage = /^https:\/\/playentry\.org\/project\//.test(currentUrl);
    const isNowWSPage = /^https:\/\/playentry\.org\/ws\//.test(currentUrl);
    const isNowEntryPage = isNowProjectPage || isNowWSPage;
    
    if (isNowEntryPage && !isProjectPage) {
      if (isNowProjectPage) {
        console.log('🎯 Entry 프로젝트 페이지 감지됨. Transform Controller 시작...');
        isProjectPage = true;
        startTransformController(); // 기존 project 로직
      } else if (isNowWSPage) {
        console.log('🎯 Entry 워크스페이스 페이지 감지됨. Transform Controller 시작...');
        isProjectPage = true;
        startTransformControllerWS(); // 새로운 ws 로직
      }
    } else if (!isNowEntryPage && isProjectPage) {
      console.log('📤 Entry 페이지를 벗어남. Transform Controller 중지...');
      isProjectPage = false;
      stopTransformController();
    }
  }
  
  // Transform Controller 시작 (Project 페이지용)
  function startTransformController() {
    if (transformController) {
      clearInterval(transformController);
    }
    
    watchAndControlTransform();
  }
  
  // Transform Controller 시작 (WS 페이지용)
  function startTransformControllerWS() {
    if (transformController) {
      clearInterval(transformController);
    }
    
    watchAndControlTransformWS();
  }
  
  // Transform Controller 중지
  function stopTransformController() {
    if (transformController) {
      clearInterval(transformController);
      transformController = null;
    }
    
    // CSS 스타일 엘리먼트 제거
    if (styleElementMain) {
      styleElementMain.remove();
      styleElementMain = null;
      console.log('🗑️ 메인 페이지 CSS 스타일 엘리먼트 제거됨');
    }
    
    if (styleElementIframe) {
      styleElementIframe.remove();
      styleElementIframe = null;
      console.log('🗑️ iframe CSS 스타일 엘리먼트 제거됨');
    }
  }
  
  // Entry 변수 감지 및 CSS Transform 제어 (Project 페이지용)
  function watchAndControlTransform() {
    let attempts = 0;
    const maxAttempts = 60; // 30초 최대 대기
    
    function tryConnect() {
      attempts++;
      
      // 1) iframe 준비 대기
      const iframe = document.querySelector('iframe');
      if (!iframe) {
        if (attempts < maxAttempts) {
          console.log('🕒 iframe 대기 중...');
          setTimeout(tryConnect, 500);
        }
        return;
      }
      
      // 2) Entry + 변수 컨테이너 준비 대기
      const ed = iframe.contentWindow;
      if (!ed.Entry || !ed.Entry.variableContainer) {
        if (attempts < maxAttempts) {
          console.log('🕒 Entry 로드 대기 중...');
          setTimeout(tryConnect, 500);
        }
        return;
      }
      
      console.log('✅ Entry 로드 완료. Transform Controller 활성화됨');
      startVariableWatcher(ed);
    }
    
    tryConnect();
  }
  
  // Entry 변수 감지 및 CSS Transform 제어 (WS 페이지용)
  function watchAndControlTransformWS() {
    let attempts = 0;
    const maxAttempts = 60; // 30초 최대 대기
    
    function tryConnect() {
      attempts++;
      
      // 1) Entry + 변수 컨테이너 준비 대기 (직접 접근)
      if (!window.Entry || !window.Entry.variableContainer) {
        if (attempts < maxAttempts) {
          console.log('🕒 Entry 로드 대기 중...');
          setTimeout(tryConnect, 500);
        }
        return;
      }
      
      // 2) entryCanvas 요소 존재 확인
      const canvas = document.querySelector('#entryCanvas');
      if (!canvas) {
        if (attempts < maxAttempts) {
          console.log('🕒 #entryCanvas 대기 중...');
          setTimeout(tryConnect, 500);
        }
        return;
      }
      
      console.log('✅ Entry 로드 완료. Transform Controller 활성화됨 (WS)');
      startVariableWatcherWS();
    }
    
    tryConnect();
  }
  
  // CSS 스타일 엘리먼트 생성 및 관리
  let styleElementMain = null; // 메인 페이지용
  let styleElementIframe = null; // iframe용
  
  function createStyleElements(iframeDoc = null) {
    // 메인 페이지 스타일 엘리먼트
    if (!styleElementMain) {
      styleElementMain = document.createElement('style');
      styleElementMain.setAttribute('data-entry-transform-css', 'true');
      styleElementMain.type = 'text/css';
      document.head.appendChild(styleElementMain);
      console.log('🎨 메인 페이지 CSS 스타일 엘리먼트 생성됨');
    }
    
    // iframe 스타일 엘리먼트
    if (iframeDoc && !styleElementIframe) {
      styleElementIframe = iframeDoc.createElement('style');
      styleElementIframe.setAttribute('data-entry-transform-css', 'true');
      styleElementIframe.type = 'text/css';
      (iframeDoc.head || iframeDoc.documentElement).appendChild(styleElementIframe);
      console.log('🎨 iframe CSS 스타일 엘리먼트 생성됨');
    }
    
    return { main: styleElementMain, iframe: styleElementIframe };
  }
  
  // 변수 감시 시작 (Project 페이지용)
  function startVariableWatcher(ed) {
    // iframe document 가져오기
    const iframe = document.querySelector('iframe');
    const iframeDoc = iframe ? iframe.contentDocument || iframe.contentWindow.document : null;
    
    // CSS 스타일 엘리먼트 생성 (메인 페이지 + iframe)
    createStyleElements(iframeDoc);
    
    // |rotasie| 변수 특별 처리 (한 번만 설정)
    const rotasieVar = ed.Entry.variableContainer.getVariableByName('|rotasie|');
    if (rotasieVar) {
      rotasieVar.value_ = 1;
      console.log('✏️ |rotasie| 변수를 1로 설정했습니다.');
    }
    
    // 변수 값 지속적으로 읽어와서 적용 (10ms마다)
    transformController = setInterval(() => {
      const styleValues = {};
      
      // 모든 변수 값 읽어오기
      Object.keys(STYLE_PROPERTIES).forEach(propName => {
        const varName = `|${propName}|`;
        const entryVar = ed.Entry.variableContainer.getVariableByName(varName);
        
        if (entryVar) {
          styleValues[propName] = entryVar.value_;
        }
      });
      
      // 매번 CSS 업데이트 (변화 감지 없이)
      updateCanvasStyles(styleValues);
    }, 10);
  }
  
  // 변수 감시 시작 (WS 페이지용)
  function startVariableWatcherWS() {
    // CSS 스타일 엘리먼트 생성 (메인 페이지만)
    createStyleElements();
    
    // |rotasie| 변수 특별 처리 (한 번만 설정)
    const rotasieVar = window.Entry.variableContainer.getVariableByName('|rotasie|');
    if (rotasieVar) {
      // WS 페이지에서는 setValue 메서드 사용
      if (typeof rotasieVar.setValue === 'function') {
        rotasieVar.setValue(1);
      } else {
        rotasieVar.value_ = 1;
      }
      console.log('✏️ |rotasie| 변수를 1로 설정했습니다.');
    }
    
    // 변수 값 지속적으로 읽어와서 적용 (10ms마다)
    transformController = setInterval(() => {
      // #entryCanvas 존재 체크
      const canvas = document.querySelector('#entryCanvas');
      if (!canvas) {
        return; // 캔버스가 없으면 업데이트 안함
      }
      
      const styleValues = {};
      
      // 모든 변수 값 읽어오기 (getValue() 메서드 사용)
      Object.keys(STYLE_PROPERTIES).forEach(propName => {
        const varName = `|${propName}|`;
        const entryVar = window.Entry.variableContainer.getVariableByName(varName);
        
        if (entryVar) {
          // getValue() 메서드가 있으면 사용, 없으면 기존 방식
          if (typeof entryVar.getValue === 'function') {
            styleValues[propName] = entryVar.getValue();
          } else {
            styleValues[propName] = entryVar.value_;
          }
        }
      });
      
      // 매번 CSS 업데이트 (변화 감지 없이)
      updateCanvasStylesWS(styleValues);
    }, 10);
  }
  
  // Canvas Transform 및 Filter CSS 업데이트 (Project 페이지용)
  function updateCanvasStyles(values) {
    const transformParts = [];
    const filterParts = [];
    
    // Transform과 Filter 속성들을 분리해서 처리
    Object.keys(STYLE_PROPERTIES).forEach(propName => {
      if (values[propName] !== undefined) {
        const propInfo = STYLE_PROPERTIES[propName];
        const valueWithUnit = `${propInfo.cssName}(${values[propName]}${propInfo.unit})`;
        
        if (propInfo.type === 'transform') {
          transformParts.push(valueWithUnit);
        } else if (propInfo.type === 'filter') {
          filterParts.push(valueWithUnit);
        }
      }
    });
    
    const transformString = transformParts.join(' ');
    const filterString = filterParts.join(' ');
    
    // CSS 룰 생성
    let cssRule = `
      #entryCanvas {`;
    
    if (transformString) {
      cssRule += `
        transform: ${transformString} !important;`;
    }
    
    if (filterString) {
      cssRule += `
        filter: ${filterString} !important;`;
    }
    
    cssRule += `
      }
    `;
    
    // 메인 페이지에 CSS 적용
    if (styleElementMain) {
      styleElementMain.textContent = cssRule;
    }
    
    // iframe에 CSS 적용
    if (styleElementIframe) {
      styleElementIframe.textContent = cssRule;
    }
    
    console.log('🎨 Canvas Styles 업데이트 (메인 + iframe):', { transform: transformString, filter: filterString });
  }
  
  // Canvas Transform 및 Filter CSS 업데이트 (WS 페이지용)
  function updateCanvasStylesWS(values) {
    const transformParts = [];
    const filterParts = [];
    
    // Transform과 Filter 속성들을 분리해서 처리
    Object.keys(STYLE_PROPERTIES).forEach(propName => {
      if (values[propName] !== undefined) {
        const propInfo = STYLE_PROPERTIES[propName];
        const valueWithUnit = `${propInfo.cssName}(${values[propName]}${propInfo.unit})`;
        
        if (propInfo.type === 'transform') {
          transformParts.push(valueWithUnit);
        } else if (propInfo.type === 'filter') {
          filterParts.push(valueWithUnit);
        }
      }
    });
    
    const transformString = transformParts.join(' ');
    const filterString = filterParts.join(' ');
    
    // CSS 룰 생성
    let cssRule = `
      #entryCanvas {`;
    
    if (transformString) {
      cssRule += `
        transform: ${transformString} !important;`;
    }
    
    if (filterString) {
      cssRule += `
        filter: ${filterString} !important;`;
    }
    
    cssRule += `
      }
    `;
    
    // 메인 페이지에만 CSS 적용
    if (styleElementMain) {
      styleElementMain.textContent = cssRule;
    }
    
    console.log('🎨 Canvas Styles 업데이트 (WS):', { transform: transformString, filter: filterString });
  }
  
  // URL 변경 감지 설정
  function setupUrlWatcher() {
    // pushState/replaceState 오버라이드
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(detectUrlChange, 0);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(detectUrlChange, 0);
    };
    
    // popstate 이벤트 리스너
    window.addEventListener('popstate', detectUrlChange);
    
    // 주기적 URL 체크 (fallback)
    setInterval(detectUrlChange, 1000);
  }
  
  // 초기화
  function init() {
    console.log('🚀 Entry Canvas Transform Controller 초기화됨 (Injected)');
    setupUrlWatcher();
    checkIfEntryPage(); // 초기 페이지 체크
  }
  
  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();