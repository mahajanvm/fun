document.write("404")
var canvas = document.querySelector("canvas");
var audio = document.querySelectorAll("audio");
var ctx = canvas.getContext("2d");
var px = 4.5;
var py = 8;
var pvx = 0;
var pvy = 0;
var scroll = 0;
var score = 0;
var level1 = createlevel1();
var keys = [];
var air = true;
var mydata = {};
var socket = io("https://funserver.jonahmorgan1.repl.co");
var myid = Math.random();
var myname = prompt("choose a username");

var image = new Image();
var image2 = new Image();
image.src = "spritesheet.png";
image.onload = function(){
  image2.src = "backgrounds.png";
  image2.onload = function(){
    requestAnimationFrame(render);
  }
}

socket.on("newupdate",function(name,id,x,y){
  mydata[id] = [x,y,name];
});
socket.on("leave",function(data){
  mydata = {};
});

var spritesheetcords = (x,y) => [x*21+2*x+2,y*21+2*y+2];

function hit(){
  for(var j = 0; j < 10; j += 1){
    for(var i = 0; i < 10; i += 1){
      if(px + 0.1 < i + scroll + 1 && px + 1 > i + scroll + 0.1 && py + 0.15 < j + 1 && py + 1 > j + 0.05){
        if(level1[j][i].charAt(0) == 'g'){
          return true;
        }else if(level1[j][i].charAt(0) == 'c'){
          audio[1].play();
          score++;
          level1[j][i] = 's';
        }
      }
    }
  }
  return false;
}
function render(){
  socket.emit("update",myname,myid,px,py);
  audio[0].play();
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var scale = Math.min(canvas.height/10,canvas.width/10);
  ctx.save();
  ctx.scale(scale,scale);
  ctx.translate(canvas.width/2/scale-5,0);
  ctx.drawImage(image2,0,0,63,63,0,0,10,10);
  ctx.save();
  ctx.translate(scroll,0);
  for(var j = 0; j < 10; j += 1){
    for(var i = 0; i < 10; i += 1){
      var type = level1[j][i];
      var coords;
      if(type == 'g1'){
        coords = spritesheetcords(1,4);
      }else if(type == 'g2'){
        coords = spritesheetcords(2,4);
      }else if(type == 'g3'){
        coords = spritesheetcords(3,4);
      }else if(type == 'g4'){
        coords = spritesheetcords(4,4);
      }else if(type == 'c'){
        coords = spritesheetcords(18,2);
      }else if(type == 'g5'){
        coords = spritesheetcords(2,5);
      }
      if(type != 's'){
        ctx.drawImage(image,coords[0],coords[1],21,21,i,j,1.02,1.02);
      }
    }
  }
  ctx.restore();
  ctx.font = '0.3px "Press Start 2p"';
  ctx.fillText("score " + score,0.3,0.6);
  var coords = spritesheetcords(24,8);
  Object.entries(mydata).forEach(entry => {
    var [key, value] = entry;
    ctx.drawImage(image,coords[0],coords[1],21,21,value[0],value[1],1,1);
    ctx.textAlign = "center";
    ctx.fillText(value[2],value[0]+0.5,value[1]);
  });
  ctx.drawImage(image,coords[0],coords[1],21,21,px,py,1,1);
  ctx.textAlign = "center";
  ctx.fillText(myname,px+0.5,py);
  ctx.restore();
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,canvas.width/2-(5*scale),canvas.height);
  ctx.fillRect(canvas.width/2+(5*scale),0,canvas.width/2-(5*scale),canvas.height);
  if(keys.includes('ArrowRight')){
    pvx += 0.01;
  }
  if(keys.includes('ArrowLeft')){
    pvx -= 0.01;
  }
  if(keys.includes('ArrowUp') && air == false) {
    pvy = -0.2;
    air = true;
  }
  pvx *= 0.9;
  px += pvx;
  for(var i = 0; i < 5; i++){
    py -= 0.01;
    if(!hit()){
      break;
    }
  }
  if(hit()){
    px -= pvx;
    py += 0.05;
  }
  pvy += 0.01;
  py += pvy;
  if(hit()){
    if(pvy < 0){
      while(hit()){
        py += 0.01;
      }
    }else{
      while(hit()){
        py -= 0.01;
      }
      air = false;
    }
    pvy = 0;
  }
  if(py > 19){
    score = 0;
    px = 1;
    py = 1;
    pvy = 0;
    scroll = 0;
    level1 = createlevel1();
  }
  requestAnimationFrame(render);
}

window.onkeydown = function(event){
  if(keys.includes(event.key) == false) {
    keys.push(event.key);
  }
}

window.onkeyup = function(event){
  keys.splice(keys.indexOf(event.key), 1);
}