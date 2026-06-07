
let routines = JSON.parse(localStorage.getItem('routines')||'[]');
let builderPoses=[];
let currentRoutine=[];
let currentIndex=0;
let paused=false;
let activeTimer=null;

function beep(){
 try{
 const ctx=new (window.AudioContext||window.webkitAudioContext)();
 const osc=ctx.createOscillator();
 osc.connect(ctx.destination);
 osc.start();
 setTimeout(()=>{osc.stop();ctx.close();},100);
 }catch(e){}
}

function render(){
 document.getElementById('routineList').innerHTML=routines.map((r,i)=>`
 <li>${r.name}
 <button onclick="loadRoutine(${i})">Load</button>
 <button onclick="editRoutine(${i})">Edit</button>
 <button onclick="deleteRoutine(${i})">Delete</button>
 </li>`).join('');

 document.getElementById('poseList').innerHTML=builderPoses.map((p,i)=>`
 <li>${p.name} (${p.duration}s)
 <button onclick="editPose(${i})">Edit</button>
 <button onclick="deletePose(${i})">Delete</button>
 </li>`).join('');
}

function addPose(){
 const file=document.getElementById('poseImage').files[0];

 const savePose=(img)=>{
 builderPoses.push({
 name:poseName.value,
 duration:Number(poseDuration.value),
 switchSides:switchSides.checked,
 image:img
 });
 render();
 };

 if(file){
  const reader=new FileReader();
  reader.onload=e=>savePose(e.target.result);
  reader.readAsDataURL(file);
 }else{
  savePose('');
 }
}

function editPose(i){
 const p=builderPoses[i];
 poseName.value=p.name;
 poseDuration.value=p.duration;
 switchSides.checked=p.switchSides;
 builderPoses.splice(i,1);
 render();
}

function deletePose(i){
 builderPoses.splice(i,1);
 render();
}

function saveRoutine(){
 routines.push({
  name:routineName.value,
  poses:[...builderPoses]
 });
 localStorage.setItem('routines',JSON.stringify(routines));
 render();
}

function editRoutine(i){
 builderPoses=[...routines[i].poses];
 render();
}

function deleteRoutine(i){
 routines.splice(i,1);
 localStorage.setItem('routines',JSON.stringify(routines));
 render();
}

function loadRoutine(i){
 currentRoutine=routines[i].poses;
 alert('Routine loaded');
}

function pauseResume(){ paused=!paused; }

function previousPose(){
 if(currentIndex>0){
   currentIndex--;
   playPose();
 }
}

function nextPose(){
 if(currentIndex<currentRoutine.length-1){
   currentIndex++;
   playPose();
 }
}

function countdown(seconds,callback,label='Get Ready'){
 let t=seconds;
 currentPose.textContent=label;
 timer.textContent=t;

 const interval=setInterval(()=>{
   if(paused) return;
   beep();
   t--;
   timer.textContent=t;
   if(t<0){
      clearInterval(interval);
      callback();
   }
 },1000);
}

function startRoutine(){
 if(!currentRoutine.length) return;
 currentIndex=0;
 countdown(5,playPose,'Starting');
}

function playPose(){
 clearInterval(activeTimer);

 if(currentIndex>=currentRoutine.length){
   currentPose.textContent='Finished';
   timer.textContent='Done';
   return;
 }

 const pose=currentRoutine[currentIndex];

 currentPose.textContent=pose.name;
 currentImage.src=pose.image || '';

 let remaining=pose.duration;

 activeTimer=setInterval(()=>{
   if(paused) return;

   timer.textContent=remaining;

   if(pose.switchSides && remaining===Math.floor(pose.duration/2)){
      beep();
      alert('Switch sides');
   }

   if(remaining<=5 && remaining>0){
      beep();
   }

   remaining--;

   if(remaining<0){
      clearInterval(activeTimer);

      if(currentIndex < currentRoutine.length-1){
        countdown(5,()=>{
           currentIndex++;
           playPose();
        },'Next Pose');
      }else{
        currentIndex++;
        playPose();
      }
   }
 },1000);
}

render();
