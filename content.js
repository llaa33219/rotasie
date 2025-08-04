(function() {
  'use strict';
  
  // injected.js를 페이지에 삽입
  function injectScript() {
    // 이미 삽입되었는지 확인
    if (document.querySelector('script[data-entry-transform-injected]')) {
      console.log('🔄 Entry Transform Controller가 이미 삽입되어 있습니다.');
      return;
    }
    
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.setAttribute('data-entry-transform-injected', 'true');
    
    // 스크립트 로드 완료 시 제거 (선택사항)
    script.onload = function() {
      console.log('✅ Entry Transform Controller 스크립트가 페이지에 삽입되었습니다.');
      this.remove();
    };
    
    script.onerror = function() {
      console.error('❌ Entry Transform Controller 스크립트 삽입에 실패했습니다.');
      this.remove();
    };
    
    // head 또는 documentElement에 삽입
    (document.head || document.documentElement).appendChild(script);
  }
  
  // DOM 준비 확인 후 스크립트 삽입
  function init() {
    console.log('🔌 Entry Canvas Transform Controller Content Script 시작됨');
    
    // playentry.org에서만 실행
    if (!window.location.hostname.includes('playentry.org')) {
      console.log('⏭️ playentry.org가 아니므로 스킵합니다.');
      return;
    }
    
    injectScript();
  }
  
  // DOM 로드 상태에 따라 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();