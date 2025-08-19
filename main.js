// 從全域 window 物件中取得 MediaPipe 的核心元件
const { PoseLandmarker, FilesetResolver, DrawingUtils } = window;

// 取得 HTML 元素
const video = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');

let poseLandmarker = undefined;
let runningMode = "VIDEO"; // 我們要處理的是影片串流
let webcamRunning = false;

// 初始化姿勢偵測器
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU" // 優先使用 GPU 加速
        },
        runningMode: runningMode,
        numPoses: 1 // 我們只偵測一個人
    });
};
createPoseLandmarker();

// 啟用攝影機的函式
const enableCam = (event) => {
    if (!poseLandmarker) {
        console.log("等等！PoseLandmarker 還沒載入好。");
        return;
    }

    webcamRunning = true;
    startButton.style.display = 'none'; // 隱藏按鈕

    // 取得攝影機權限
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
};

// 偵測與繪製的主迴圈
let lastVideoTime = -1;
const predictWebcam = () => {
    // 設定 canvas 的尺寸與影片一致
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        // 開始偵測姿勢
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            // 清除上一禎的畫面
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // 繪製骨架
            const drawingUtils = new DrawingUtils(canvasCtx);
            for (const landmarks of result.landmarks) {
                // 畫出關節點之間的連線 (骨架)
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
                // 畫出關節點 (小圓圈)
                drawingUtils.drawLandmarks(landmarks);
            }
        });
    }

    // 持續呼叫自己，建立迴圈
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// 監聽按鈕點擊事件
startButton.addEventListener('click', enableCam);