
let currentRoutine=[];
let routines=JSON.parse(localStorage.getItem("routines")||"[]");
let tempPoses=[];

function render(){
 const ul=document.getElementById("routineList");
 ul.innerHTML="";
 routines.forEach((r,i)=>{
   const li=document.createElement("li");
   li.innerHTML=`${r.name} (${r.poses.length} poses)
   <button onclick="loadRoutine(${i})">Load</button>`;
   ul.appendChild(li);
 });
 document.getElementById("sessions").textContent=localStorage.getItem("sessions")||0;
}

function addPose(){
 const name=document.getElementById("pname").value;
 const dur=parseInt(document.getElementById("pdur").value);
 if(!name||!dur)return;
 tempPoses.push({name,duration:dur});
 document.getElementById("poseList").innerHTML=tempPoses.map(p=>`<li>${p.name} ${p.duration}s</li>`).join("");
}

function saveRoutine(){
 const name=document.getElementById("rname").value;
 if(!name||tempPoses.length===0)return;
 routines.push({name,poses:tempPoses});
 localStorage.setItem("routines",JSON.stringify(routines));
 tempPoses=[];
 document.getElementById("poseList").innerHTML="";
 render();
}

function loadRoutine(i){
 currentRoutine=routines[i].poses;
 alert("Routine loaded");
}

function speak(t){
 speechSynthesis.speak(new SpeechSynthesisUtterance(t));
}

function startRoutine(){
 if(currentRoutine.length===0)return;
 let idx=0;
 runPose();

 function runPose(){
   if(idx>=currentRoutine.length){
      let s=parseInt(localStorage.getItem("sessions")||0)+1;
      localStorage.setItem("sessions",s);
      render();
      document.getElementById("currentPose").textContent="Finished!";
      return;
   }

   let pose=currentRoutine[idx];
   let remaining=pose.duration;

   document.getElementById("currentPose").textContent=pose.name;
   speak(pose.name);

   let interval=setInterval(()=>{
      document.getElementById("timer").textContent=remaining;
      remaining--;
      if(remaining<0){
         clearInterval(interval);
         idx++;
         runPose();
      }
   },1000);
 }
}

if('serviceWorker' in navigator){
 navigator.serviceWorker.register('service-worker.js');
}

render();
