const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= START GAME ================= */
let gameStart = false;
const startScreen = document.getElementById("startScreen");

startScreen.addEventListener("click", () => {
    gameStart = true;
    startScreen.style.display = "none";
});

/* ================= IMAGES ================= */
const planeImg = new Image();
planeImg.src = "ImageGames/maybay.png";

const birdImg = new Image();
birdImg.src = "ImageGames/frame-1.png";

const fuelImg = new Image();
fuelImg.src = "ImageGames/nhienlieu.png";

const starImg = new Image();
starImg.src = "ImageGames/star.png";

const bgImg = new Image();
bgImg.src = "ImageGames/background.jpg";

/* ================= OBJECT ================= */
const plane = {
    x: 100,
    y: canvas.height / 2,
    w: 50,
    h: 50,
    speed: 6
};

let birds = [];
let fuels = [];
let stars = [];
let bullets = [];

/* ================= GAME DATA ================= */
let fuel = 100;
let score = 0;
let gameOver = false;

let birdSpeedMultiplier = 1;

// 🚨 cảnh báo
let warningText = "";
let warningTimer = 0;
let pendingWarning = false;

/* ================= CONTROL ================= */
const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if(e.code === "Space"){
        bullets.push({
            x: plane.x + plane.w,
            y: plane.y + plane.h/2,
            w: 10,
            h: 4
        });
    }
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

/* ================= SPAWN ================= */

// Chim
setInterval(()=>{
    if(!gameStart || gameOver) return;

    let amount = Math.floor(Math.random()*6)+5;

    for(let i=0;i<amount;i++){
        birds.push({
            x: canvas.width + Math.random()*300,
            y: Math.random()*(canvas.height-60),
            speed: (2 + Math.random()*2) * birdSpeedMultiplier
        });
    }

    // 🚨 hiện cảnh báo ở lượt SAU
    if(pendingWarning){
        warningText = "⚠ Chim đang tăng tốc!";
        warningTimer = 120;
        pendingWarning = false;
    }

    // tăng tốc
    birdSpeedMultiplier = Math.min(birdSpeedMultiplier + 0.2, 5);

    // đánh dấu cho lần sau
    pendingWarning = true;

},3000);

// Sao
setInterval(()=>{
    if(!gameStart || gameOver) return;

    stars.push({
        x: canvas.width,
        y: Math.random()*(canvas.height-40),
        speed: 3
    });
},2000);

// Nhiên liệu
function spawnFuel(){
    fuels.push({
        x: canvas.width,
        y: Math.random()*(canvas.height-40),
        speed: 3
    });
}

/* ================= UPDATE ================= */
function update(){
    if(!gameStart || gameOver) return;

    // 🎮 di chuyển 4 hướng
    if(keys["w"] || keys["ArrowUp"]) plane.y -= plane.speed;
    if(keys["s"] || keys["ArrowDown"]) plane.y += plane.speed;
    if(keys["a"] || keys["ArrowLeft"]) plane.x -= plane.speed;
    if(keys["d"] || keys["ArrowRight"]) plane.x += plane.speed;

    // giới hạn màn hình
    if(plane.y < 0) plane.y = 0;
    if(plane.y > canvas.height - plane.h) plane.y = canvas.height - plane.h;
    if(plane.x < 0) plane.x = 0;
    if(plane.x > canvas.width - plane.w) plane.x = canvas.width - plane.w;

    fuel -= 0.05;
    if(fuel <= 0){
        endGame("Hết nhiên liệu!");
    }

    /* ===== CHIM ===== */
    birds.forEach((b,i)=>{
        b.x -= b.speed;
        b.speed *= 1.0005;

        if(b.x < -60){
            birds.splice(i,1);
        }

        if(checkCollision(plane,b,50,50)){
            endGame("Đâm vào chim!");
        }

        bullets.forEach((bl,bi)=>{
            if(checkCollision(bl,b,50,50)){
                birds.splice(i,1);
                bullets.splice(bi,1);
                score += 5;
                spawnFuel();
            }
        });
    });

    /* ===== SAO ===== */
    stars.forEach((s,i)=>{
        s.x -= s.speed;

        if(s.x < -40) stars.splice(i,1);

        if(checkCollision(plane,s,40,40)){
            score += 10;
            stars.splice(i,1);
        }
    });

    /* ===== NHIÊN LIỆU ===== */
    fuels.forEach((f,i)=>{
        f.x -= f.speed;

        if(f.x < -40) fuels.splice(i,1);

        if(checkCollision(plane,f,40,40)){
            fuel = Math.min(100, fuel + 30);
            fuels.splice(i,1);
        }
    });

    /* ===== ĐẠN ===== */
    bullets.forEach((b,i)=>{
        b.x += 10;
        if(b.x > canvas.width) bullets.splice(i,1);
    });

    // giảm cảnh báo
    if(warningTimer > 0){
        warningTimer--;
    }
}

/* ================= COLLISION ================= */
function checkCollision(a,b,w,h){
    return a.x < b.x + w &&
           a.x + a.w > b.x &&
           a.y < b.y + h &&
           a.y + a.h > b.y;
}

/* ================= DRAW ================= */
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
    ctx.drawImage(planeImg,plane.x,plane.y,plane.w,plane.h);

    birds.forEach(b=>{
        ctx.drawImage(birdImg,b.x,b.y,50,50);
    });

    stars.forEach(s=>{
        ctx.drawImage(starImg,s.x,s.y,40,40);
    });

    fuels.forEach(f=>{
        ctx.drawImage(fuelImg,f.x,f.y,40,40);
    });

    bullets.forEach(b=>{
        ctx.fillStyle="red";
        ctx.fillRect(b.x,b.y,b.w,b.h);
    });

    // UI
    ctx.fillStyle="black";
    ctx.font="20px Arial";
    ctx.fillText("Điểm: "+score,20,30);
    ctx.fillText("Nhiên liệu: "+Math.floor(fuel),20,60);

    // 🚨 cảnh báo (nhấp nháy)
    if(warningTimer > 0){
        if(Math.floor(warningTimer / 10) % 2 === 0){
            ctx.fillStyle = "red";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            ctx.fillText(warningText, canvas.width / 2, 100);
            ctx.textAlign = "left";
        }
    }
}

/* ================= LOOP ================= */
function loop(){
    update();
    draw();

    if(!gameOver){
        requestAnimationFrame(loop);
    }
}

/* ================= END ================= */
function endGame(text){
    gameOver = true;
    setTimeout(()=>{
        alert(text + " | Điểm: " + score);
        location.reload();
    },100);
}

/* LOAD XONG CHẠY */
bgImg.onload = () => {
    loop();
};