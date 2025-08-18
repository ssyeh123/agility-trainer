// 取得 HTML 中的元素
const video = document.getElementById('webcam');
const startButton = document.getElementById('startButton');

// 檢查瀏覽器是否支援 getUserMedia API
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startButton.addEventListener('click', () => {
        // 請求攝影機權限
        navigator.mediaDevices.getUserMedia({ 
            video: true // 我們只需要視訊
        }).then(stream => {
            // 將攝影機的影像串流設定給 video 元素
            video.srcObject = stream;
            // 隱藏開始按鈕
            startButton.style.display = 'none';
        }).catch(error => {
            console.error("無法取得攝影機權限:", error);
            alert("無法啟動攝影機，請檢查權限設定。");
        });
    });
} else {
    alert("您的瀏覽器不支援攝影機功能，請嘗試使用 Chrome 或 Firefox。");
}