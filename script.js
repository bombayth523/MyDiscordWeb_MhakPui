function copyToClipboard(contentNumber) {
    const contentToCopy = document.getElementById("contentToCopy" + contentNumber);
    const textToCopy = contentToCopy.textContent;
    const textArea = document.createElement("textarea");

    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    alert("คัดลอกไปยังคลิปบอร์ดแล้ว: " + textToCopy);
}
