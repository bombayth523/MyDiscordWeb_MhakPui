function copyToClipboard(contentNumber) {
    const contentToCopy = document.getElementById('contentToCopy' + contentNumber);
    const textToCopy = contentToCopy.textContent.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('คัดลอกแล้ว: ' + textToCopy);
    }).catch(() => {
        // Fallback สำหรับเบราว์เซอร์เก่า
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('คัดลอกแล้ว: ' + textToCopy);
    });
}

function showToast(message) {
    const existing = document.getElementById('copy-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.textContent = '✅ ' + message;
    toast.style.cssText = [
        'position: fixed',
        'bottom: 30px',
        'left: 50%',
        'transform: translateX(-50%)',
        'background: rgba(70, 194, 203, 0.95)',
        'color: #1a1a2e',
        'padding: 10px 22px',
        'border-radius: 50px',
        'font-family: Kanit, sans-serif',
        'font-size: 0.95rem',
        'font-weight: 500',
        'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
        'z-index: 9999',
        'opacity: 0',
        'transition: opacity 0.3s ease'
    ].join(';');

    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
